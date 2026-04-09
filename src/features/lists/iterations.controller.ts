import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IterationsService } from './iterations.service';
import { CreateIterationDto } from './dto/create-iteration.dto';
import { UpdateIterationDto } from './dto/update-iteration.dto';
import { IterationResponseDto } from './dto/iteration-response.dto';

@ApiTags('iterations')
@ApiBearerAuth('access-token')
@Controller('lists')
@UseGuards(JwtAuthGuard)
export class IterationsController {
  constructor(private readonly iterationsService: IterationsService) {}

  @Get(':listId/iterations')
  findAllByList(
    @Param('listId') listId: string,
  ): Promise<IterationResponseDto[]> {
    return this.iterationsService.findAllByList(listId);
  }

  @Post(':listId/iterations')
  create(
    @Param('listId') listId: string,
    @Body() createIterationDto: CreateIterationDto,
  ): Promise<IterationResponseDto> {
    return this.iterationsService.create(listId, createIterationDto);
  }

  @Get('iterations/:id')
  findOne(@Param('id') id: string): Promise<IterationResponseDto> {
    return this.iterationsService.findOne(id);
  }

  @Put('iterations/:id')
  update(
    @Param('id') id: string,
    @Body() updateIterationDto: UpdateIterationDto,
  ): Promise<IterationResponseDto> {
    return this.iterationsService.update(id, updateIterationDto);
  }

  @Delete('iterations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.iterationsService.remove(id);
  }

  @Post('iterations/:id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  addTask(
    @Param('id') iterationId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    return this.iterationsService.addTaskToIteration(iterationId, taskId);
  }

  @Delete('iterations/:id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(
    @Param('id') iterationId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    return this.iterationsService.removeTaskFromIteration(iterationId, taskId);
  }
}
