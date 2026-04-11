import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TimeLogEntity } from './entities/time-log.entity';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksTimeService {
  constructor(
    @InjectRepository(TimeLogEntity)
    private readonly timeLogRepository: Repository<TimeLogEntity>,
    private readonly tasksService: TasksService,
  ) {}

  async startTimeLog(taskId: string, userId: string, description?: string): Promise<TimeLogEntity> {
    // Verify task exists and is accessible
    await this.tasksService.findOne(taskId);

    // Ensure no overlapping active time log exists for this user and task
    const activeLog = await this.timeLogRepository.findOne({
      where: {
        task: { id: taskId },
        user: { id: userId },
        endTime: IsNull(),
      },
    });

    if (activeLog) {
      throw new BadRequestException('A timer is already running for this task.');
    }

    const timeLog = this.timeLogRepository.create({
      task: { id: taskId },
      user: { id: userId },
      startTime: new Date(),
      description,
    });

    return this.timeLogRepository.save(timeLog);
  }

  async stopTimeLog(taskId: string, userId: string): Promise<TimeLogEntity> {
    const activeLog = await this.timeLogRepository.findOne({
      where: {
        task: { id: taskId },
        user: { id: userId },
        endTime: IsNull(),
      },
    });

    if (!activeLog) {
      throw new BadRequestException('No active timer running for this task.');
    }

    activeLog.endTime = new Date();
    // Calculate duration in seconds
    activeLog.durationSeconds = Math.floor(
      (activeLog.endTime.getTime() - activeLog.startTime.getTime()) / 1000,
    );

    return this.timeLogRepository.save(activeLog);
  }

  async getTimeLogs(taskId: string): Promise<TimeLogEntity[]> {
    // Validate task existence
    await this.tasksService.findOne(taskId);

    return this.timeLogRepository.find({
      where: { task: { id: taskId } },
      relations: ['user'],
      order: {
        startTime: 'DESC',
      },
    });
  }

  // Future Enhancements could include updateTimeLog and removeTimeLog
}
