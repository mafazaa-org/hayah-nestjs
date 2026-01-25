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
import { StatusesService } from './statuses.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ReorderStatusesDto } from './dto/reorder-statuses.dto';
import { StatusEntity } from './entities/status.entity';

@ApiTags('statuses')
@ApiBearerAuth('access-token')
@Controller('statuses')
@UseGuards(JwtAuthGuard)
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Post()
  create(@Body() createStatusDto: CreateStatusDto): Promise<StatusEntity> {
    return this.statusesService.create(createStatusDto);
  }

  @Get()
  findAll(@Query('listId') listId: string): Promise<StatusEntity[]> {
    return this.statusesService.findAll(listId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<StatusEntity> {
    return this.statusesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<StatusEntity> {
    return this.statusesService.update(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.statusesService.remove(id);
  }

  @Put('reorder')
  reorder(
    @Query('listId') listId: string,
    @Body() reorderDto: ReorderStatusesDto,
  ): Promise<StatusEntity[]> {
    return this.statusesService.reorder(listId, reorderDto);
  }
}