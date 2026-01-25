import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AttachmentsService } from './attachments.service';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import { memoryStorage } from 'multer';

@ApiTags('attachments')
@ApiBearerAuth('access-token')
@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('task/:taskId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadFileToTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new NotFoundException('No file provided');
    }

    return this.attachmentsService.uploadFile(taskId, user.userId, file);
  }

  @Post('comment/:commentId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadFileToComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new NotFoundException('No file provided');
    }

    return this.attachmentsService.uploadFileToComment(commentId, user.userId, file);
  }

  // Get all attachments for a task - must come before :id route
  @Get('task/:taskId')
  findAllByTask(@Param('taskId') taskId: string): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.findAllByTask(taskId);
  }

  // Get all attachments for a comment - must come before :id route
  @Get('comment/:commentId')
  findAllByComment(@Param('commentId') commentId: string): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.findAllByComment(commentId);
  }

  // Download/Preview endpoints - must come before :id route
  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename, mimeType } = await this.attachmentsService.getFileBuffer(id);

    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  }

  @Get(':id/preview')
  async previewFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename, mimeType } = await this.attachmentsService.getFileBuffer(id);

    // For preview, don't force download
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AttachmentResponseDto> {
    return this.attachmentsService.findOne(id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.attachmentsService.remove(id, user.userId);
  }
}
