import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IterationEntity } from './entities/iteration.entity';
import { TaskIterationEntity } from '../tasks/entities/task-iteration.entity';
import { ListEntity } from './entities/list.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { CreateIterationDto } from './dto/create-iteration.dto';
import { UpdateIterationDto } from './dto/update-iteration.dto';
import { IterationResponseDto } from './dto/iteration-response.dto';

@Injectable()
export class IterationsService {
  constructor(
    @InjectRepository(IterationEntity)
    private readonly iterationRepository: Repository<IterationEntity>,
    @InjectRepository(TaskIterationEntity)
    private readonly taskIterationRepository: Repository<TaskIterationEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  private toResponseDto(iteration: IterationEntity): IterationResponseDto {
    return {
      id: iteration.id,
      name: iteration.name,
      startDate: iteration.startDate,
      endDate: iteration.endDate,
      listId: iteration.list?.id ?? '',
      createdAt: iteration.createdAt,
      updatedAt: iteration.updatedAt,
    };
  }

  async findAllByList(listId: string): Promise<IterationResponseDto[]> {
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    const iterations = await this.iterationRepository.find({
      where: { list: { id: listId } },
      relations: ['list'],
      order: { createdAt: 'ASC' },
    });

    return iterations.map((i) => this.toResponseDto(i));
  }

  async findOne(id: string): Promise<IterationResponseDto> {
    const iteration = await this.iterationRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!iteration) {
      throw new NotFoundException('Iteration not found');
    }

    return this.toResponseDto(iteration);
  }

  async create(
    listId: string,
    dto: CreateIterationDto,
  ): Promise<IterationResponseDto> {
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    const iteration = this.iterationRepository.create({
      name: dto.name,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      list: { id: listId } as ListEntity,
    });

    const saved = await this.iterationRepository.save(iteration);

    const result = await this.iterationRepository.findOne({
      where: { id: saved.id },
      relations: ['list'],
    });

    return this.toResponseDto(result!);
  }

  async update(
    id: string,
    dto: UpdateIterationDto,
  ): Promise<IterationResponseDto> {
    const iteration = await this.iterationRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!iteration) {
      throw new NotFoundException('Iteration not found');
    }

    if (dto.name !== undefined) {
      iteration.name = dto.name;
    }
    if (dto.startDate !== undefined) {
      iteration.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      iteration.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    await this.iterationRepository.save(iteration);

    const updated = await this.iterationRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    return this.toResponseDto(updated!);
  }

  async remove(id: string): Promise<void> {
    const iteration = await this.iterationRepository.findOne({
      where: { id },
    });

    if (!iteration) {
      throw new NotFoundException('Iteration not found');
    }

    await this.iterationRepository.remove(iteration);
  }

  async addTaskToIteration(
    iterationId: string,
    taskId: string,
  ): Promise<void> {
    const iteration = await this.iterationRepository.findOne({
      where: { id: iterationId },
    });
    if (!iteration) {
      throw new NotFoundException('Iteration not found');
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if already assigned
    const existing = await this.taskIterationRepository.findOne({
      where: {
        iteration: { id: iterationId },
        task: { id: taskId },
      },
    });

    if (existing) {
      throw new BadRequestException('Task is already assigned to this iteration');
    }

    const taskIteration = this.taskIterationRepository.create({
      iteration: { id: iterationId } as IterationEntity,
      task: { id: taskId } as TaskEntity,
    });

    await this.taskIterationRepository.save(taskIteration);
  }

  async removeTaskFromIteration(
    iterationId: string,
    taskId: string,
  ): Promise<void> {
    const taskIteration = await this.taskIterationRepository.findOne({
      where: {
        iteration: { id: iterationId },
        task: { id: taskId },
      },
    });

    if (!taskIteration) {
      throw new NotFoundException(
        'Task is not assigned to this iteration',
      );
    }

    await this.taskIterationRepository.remove(taskIteration);
  }
}
