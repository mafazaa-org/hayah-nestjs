import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookEntity } from './entities/webhook.entity';
import { WebhookDeliveryEntity } from './entities/webhook-delivery.entity';

@ApiTags('webhooks')
@ApiBearerAuth('access-token')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateWebhookDto,
  ): Promise<WebhookEntity> {
    return this.webhooksService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('listId') listId?: string,
  ): Promise<WebhookEntity[]> {
    return this.webhooksService.findAll(user.userId, listId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<WebhookEntity> {
    return this.webhooksService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ): Promise<WebhookEntity> {
    return this.webhooksService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.webhooksService.remove(id, user.userId);
  }
}
