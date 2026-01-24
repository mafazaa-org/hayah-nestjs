import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsEmitterService } from './events-emitter.service';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [AuthModule],
  providers: [EventsGateway, EventsEmitterService],
  exports: [EventsEmitterService],
})
export class EventsModule {}
