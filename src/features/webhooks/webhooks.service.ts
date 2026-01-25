import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, randomBytes } from 'crypto';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { WebhookEntity, WEBHOOK_EVENTS, type WebhookEventType } from './entities/webhook.entity';
import { WebhookDeliveryEntity } from './entities/webhook-delivery.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { ListEntity } from '../lists/entities/list.entity';
import { ListMemberEntity } from '../lists/entities/list-member.entity';

const WEBHOOK_SIGNATURE_HEADER = 'x-hayah-webhook-signature';
const DELIVERY_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 5;
const RETRY_BACKOFF_MS = [60_000, 300_000, 900_000, 3_600_000, 14_400_000]; // 1m, 5m, 15m, 1h, 4h

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
    @InjectRepository(WebhookDeliveryEntity)
    private readonly deliveryRepository: Repository<WebhookDeliveryEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(ListMemberEntity)
    private readonly listMemberRepository: Repository<ListMemberEntity>,
    private readonly httpService: HttpService,
  ) {}

  private async ensureListAccess(userId: string, listId: string): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['workspace', 'workspace.owner'],
    });
    if (!list) throw new NotFoundException('List not found');
    const ownerId = (list.workspace as { owner?: { id: string } })?.owner?.id;
    if (ownerId === userId) return;
    const member = await this.listMemberRepository.findOne({
      where: { list: { id: listId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('List not found');
  }

  async create(userId: string, dto: CreateWebhookDto): Promise<WebhookEntity> {
    await this.ensureListAccess(userId, dto.listId);
    const secret =
      dto.secret && dto.secret.length >= 16
        ? dto.secret
        : randomBytes(32).toString('hex');
    const webhook = this.webhookRepository.create({
      user: { id: userId },
      list: { id: dto.listId },
      url: dto.url,
      secret,
      events: dto.events,
      enabled: dto.enabled ?? true,
    });
    return this.webhookRepository.save(webhook);
  }

  async findAll(userId: string, listId?: string): Promise<WebhookEntity[]> {
    const qb = this.webhookRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.list', 'list')
      .where('w.user_id = :userId', { userId });
    if (listId) {
      qb.andWhere('w.list_id = :listId', { listId });
    }
    qb.orderBy('w.created_at', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string, userId: string): Promise<WebhookEntity> {
    const w = await this.webhookRepository.findOne({
      where: { id },
      relations: ['list', 'user'],
    });
    if (!w) throw new NotFoundException('Webhook not found');
    const listId = (w.list as { id: string }).id;
    const ownerId = (w.user as { id: string })?.id;
    if (ownerId !== userId) {
      await this.ensureListAccess(userId, listId);
    }
    return w;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateWebhookDto,
  ): Promise<WebhookEntity> {
    const w = await this.findOne(id, userId);
    if (dto.url != null) w.url = dto.url;
    if (dto.events != null) w.events = dto.events;
    if (dto.enabled != null) w.enabled = dto.enabled;
    if (dto.secret != null && dto.secret.length >= 16) w.secret = dto.secret;
    return this.webhookRepository.save(w);
  }

  async remove(id: string, userId: string): Promise<void> {
    const w = await this.findOne(id, userId);
    await this.webhookRepository.remove(w);
  }

  /** Find enabled webhooks for list that subscribe to event, then POST and record delivery. */
  async deliverTaskEvent(
    event: WebhookEventType,
    listId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const hooks = await this.webhookRepository.find({
      where: {
        list: { id: listId },
        enabled: true,
      },
    });
    const subscribed = hooks.filter((h) => h.events?.includes(event));
    const body = { event, listId, ...payload };
    for (const hook of subscribed) {
      try {
        await this.deliverOne(hook, body);
      } catch {
        // Log but don't fail task flow
      }
    }
  }

  private sign(secret: string, body: string): string {
    return createHmac('sha256', secret).update(body).digest('hex');
  }

  private async deliverOne(
    hook: WebhookEntity,
    body: Record<string, unknown>,
  ): Promise<void> {
    const raw = JSON.stringify(body);
    const sig = this.sign(hook.secret, raw);
    const delivery = this.deliveryRepository.create({
      webhook: hook,
      event: body.event as string,
      payload: body,
      attempt: 1,
      status: 'pending',
    });
    await this.deliveryRepository.save(delivery);
    await this.doSend(hook, raw, sig, delivery);
  }

  private async doSend(
    hook: WebhookEntity,
    raw: string,
    sig: string,
    delivery: WebhookDeliveryEntity,
  ): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.httpService
          .post(hook.url, raw, {
            headers: {
              'Content-Type': 'application/json',
              [WEBHOOK_SIGNATURE_HEADER]: `sha256=${sig}`,
            },
            timeout: DELIVERY_TIMEOUT_MS,
            validateStatus: () => true,
          })
          .pipe(
            timeout(DELIVERY_TIMEOUT_MS),
            catchError((err) => {
              return of({
                data: null,
                status: 0,
                statusText: err?.message ?? 'Request failed',
              } as { data: unknown; status: number; statusText: string });
            }),
          ),
      );
      const resTyped = res as { status: number; statusText: string };
      const status = resTyped.status;
      delivery.responseStatusCode = status;
      if (status >= 200 && status < 300) {
        delivery.status = 'success';
        delivery.errorMessage = null;
        delivery.nextRetryAt = null;
      } else {
        delivery.status = 'failed';
        delivery.errorMessage = resTyped.statusText ?? `HTTP ${status}`;
        const is4xx = status >= 400 && status < 500;
        if (!is4xx) this.scheduleRetry(delivery);
        else delivery.nextRetryAt = null;
      }
    } catch (e) {
      delivery.status = 'failed';
      delivery.responseStatusCode = null;
      delivery.errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.scheduleRetry(delivery);
    }
    await this.deliveryRepository.save(delivery);
  }

  private scheduleRetry(delivery: WebhookDeliveryEntity): void {
    const attempt = delivery.attempt;
    if (attempt >= MAX_ATTEMPTS) {
      delivery.nextRetryAt = null;
      return;
    }
    const idx = Math.min(attempt - 1, RETRY_BACKOFF_MS.length - 1);
    const ms = RETRY_BACKOFF_MS[idx];
    delivery.nextRetryAt = new Date(Date.now() + ms);
  }

  /** Retry failed deliveries that are due. Runs every minute via cron. */
  @Cron('* * * * *')
  async processRetries(): Promise<number> {
    const due = await this.deliveryRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.webhook', 'w')
      .where('d.status = :status', { status: 'failed' })
      .andWhere('d.next_retry_at IS NOT NULL')
      .andWhere('d.next_retry_at <= :now', { now: new Date() })
      .andWhere('d.attempt < :max', { max: MAX_ATTEMPTS })
      .getMany();
    let processed = 0;
    for (const d of due) {
      d.attempt += 1;
      const raw = JSON.stringify(d.payload);
      const sig = this.sign(d.webhook.secret, raw);
      await this.doSend(d.webhook, raw, sig, d);
      processed++;
    }
    return processed;
  }

  async findDeliveries(
    webhookId: string,
    userId: string,
    limit = 50,
  ): Promise<WebhookDeliveryEntity[]> {
    await this.findOne(webhookId, userId);
    return this.deliveryRepository.find({
      where: { webhook: { id: webhookId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
