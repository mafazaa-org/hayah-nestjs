import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from '../entities/activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {}

  /**
   * Create an activity entry
   */
  async createActivity(
    taskId: string,
    userId: string,
    actionType: string,
    oldValue: any | null = null,
    newValue: any | null = null,
  ): Promise<ActivityEntity> {
    const activity = this.activityRepository.create({
      task: { id: taskId } as any,
      user: { id: userId } as any,
      actionType,
      oldValue,
      newValue,
    });

    return this.activityRepository.save(activity);
  }

  /**
   * Get all activities for a task
   */
  async findAllByTask(taskId: string): Promise<ActivityEntity[]> {
    return this.activityRepository.find({
      where: {
        task: { id: taskId },
      },
      relations: ['user', 'task'],
      order: { createdAt: 'DESC' },
    });
  }
}
