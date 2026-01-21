import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StatusEntity } from './entities/status.entity';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ReorderStatusesDto } from './dto/reorder-statuses.dto';
import { ListEntity } from '../lists/entities/list.entity';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
  ) {}

  async create(createStatusDto: CreateStatusDto): Promise<StatusEntity> {
    const { name, listId, orderIndex, color } = createStatusDto;

    // Verify list exists
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    // If orderIndex is not provided, calculate the next available index
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const existingStatuses = await this.statusRepository.find({
        where: { list: { id: listId } },
        order: { orderIndex: 'DESC' },
        take: 1,
      });

      finalOrderIndex =
        existingStatuses.length > 0
          ? existingStatuses[0].orderIndex + 1
          : 0;
    }

    const status = this.statusRepository.create({
      name,
      orderIndex: finalOrderIndex,
      color: color || null,
      list: { id: listId } as any,
    });

    return this.statusRepository.save(status);
  }

  async findAll(listId: string): Promise<StatusEntity[]> {
    return this.statusRepository.find({
      where: { list: { id: listId } },
      relations: ['list'],
      order: { orderIndex: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StatusEntity> {
    const status = await this.statusRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    return status;
  }

  async update(id: string, updateStatusDto: UpdateStatusDto): Promise<StatusEntity> {
    const status = await this.statusRepository.findOne({ where: { id } });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    if (updateStatusDto.name !== undefined) {
      status.name = updateStatusDto.name;
    }

    if (updateStatusDto.color !== undefined) {
      status.color = updateStatusDto.color || null;
    }

    return this.statusRepository.save(status);
  }

  async remove(id: string): Promise<void> {
    const status = await this.statusRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!status) {
      throw new NotFoundException('Status not found');
    }

    // Check if status has tasks
    if (status.tasks && status.tasks.length > 0) {
      throw new BadRequestException(
        'Cannot delete status: it has tasks assigned. Move or delete tasks first.',
      );
    }

    await this.statusRepository.remove(status);
  }

  async reorder(listId: string, reorderDto: ReorderStatusesDto): Promise<StatusEntity[]> {
    // Verify list exists
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    const { statusOrders } = reorderDto;

    // Verify all status IDs belong to this list
    const statusIds = statusOrders.map((item) => item.statusId);
    const statuses = await this.statusRepository.find({
      where: { id: In(statusIds), list: { id: listId } },
    });

    if (statuses.length !== statusIds.length) {
      throw new BadRequestException(
        'One or more status IDs do not exist or do not belong to this list',
      );
    }

    // Update orderIndex for each status
    const updatePromises = statusOrders.map((item) => {
      const status = statuses.find((s) => s.id === item.statusId);
      if (status) {
        status.orderIndex = item.orderIndex;
        return this.statusRepository.save(status);
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    // Return updated statuses in order
    return this.findAll(listId);
  }
}