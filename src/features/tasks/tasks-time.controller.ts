import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TasksTimeService } from './tasks-time.service';
import { TimeLogEntity } from './entities/time-log.entity';

@ApiTags('tasks-time')
@ApiBearerAuth('access-token')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksTimeController {
  constructor(private readonly tasksTimeService: TasksTimeService) {}

  @Post(':id/time/start')
  startTimeLog(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body('description') description?: string,
  ): Promise<TimeLogEntity> {
    return this.tasksTimeService.startTimeLog(id, user.userId, description);
  }

  @Post(':id/time/stop')
  stopTimeLog(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<TimeLogEntity> {
    return this.tasksTimeService.stopTimeLog(id, user.userId);
  }

  @Get(':id/time')
  getTimeLogs(@Param('id') id: string): Promise<TimeLogEntity[]> {
    return this.tasksTimeService.getTimeLogs(id);
  }
}
