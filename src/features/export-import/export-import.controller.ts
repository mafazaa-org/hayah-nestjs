import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExportImportService } from './export-import.service';
import type { ExportFormat } from './export-import.service';
import { BulkCreateTasksDto } from './dto/bulk-create-tasks.dto';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import { BulkDeleteTasksDto } from './dto/bulk-delete-tasks.dto';

@ApiTags('export-import')
@ApiBearerAuth('access-token')
@Controller('export-import')
@UseGuards(JwtAuthGuard)
export class ExportImportController {
  constructor(private readonly exportImportService: ExportImportService) {}

  @Get('lists/:listId/export')
  async exportList(
    @CurrentUser() user: { userId: string },
    @Param('listId') listId: string,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const f: ExportFormat = format === 'csv' ? 'csv' : 'json';
    const result = await this.exportImportService.exportList(
      listId,
      user.userId,
      f,
    );
    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    const body =
      typeof result.body === 'string'
        ? result.body
        : JSON.stringify(result.body, null, 2);
    res.send(body);
  }

  @Post('lists/:listId/import/tasks')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async importTasksFromCsv(
    @CurrentUser() user: { userId: string },
    @Param('listId') listId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ created: number; failed: number; errors: { row: number; message: string }[] }> {
    if (!file?.buffer) {
      throw new BadRequestException(
        'No CSV file provided. Upload a file with key "file".',
      );
    }
    const csvContent = (file.buffer as Buffer).toString('utf-8');
    return this.exportImportService.importTasksFromCsv(
      listId,
      user.userId,
      csvContent,
    );
  }

  @Post('tasks/bulk')
  async bulkCreate(
    @CurrentUser() user: { userId: string },
    @Body() dto: BulkCreateTasksDto,
  ) {
    return this.exportImportService.bulkCreate(user.userId, dto);
  }

  @Patch('tasks/bulk')
  async bulkUpdate(
    @CurrentUser() user: { userId: string },
    @Body() dto: BulkUpdateTasksDto,
  ) {
    return this.exportImportService.bulkUpdate(user.userId, dto);
  }

  @Post('tasks/bulk-delete')
  async bulkDelete(
    @CurrentUser() user: { userId: string },
    @Body() dto: BulkDeleteTasksDto,
  ) {
    return this.exportImportService.bulkDelete(user.userId, dto);
  }
}
