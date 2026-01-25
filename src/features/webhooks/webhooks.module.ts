import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { WebhookEntity } from './entities/webhook.entity';
import { WebhookDeliveryEntity } from './entities/webhook-delivery.entity';
import { ListEntity } from '../lists/entities/list.entity';
import { ListMemberEntity } from '../lists/entities/list-member.entity';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebhookEntity,
      WebhookDeliveryEntity,
      ListEntity,
      ListMemberEntity,
    ]),
    HttpModule.register({
      timeout: 15_000,
      maxRedirects: 0,
    }),
    AuthModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
