import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { ReactionResponseDto } from './dto/reaction-response.dto';

@ApiTags('comments')
@ApiBearerAuth('access-token')
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(user.userId, createCommentDto);
  }

  @Get('task/:taskId')
  findAllByTask(@Param('taskId') taskId: string): Promise<CommentResponseDto[]> {
    return this.commentsService.findAllByTask(taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, user.userId, updateCommentDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.commentsService.remove(id, user.userId);
  }

  @Post(':id/reactions')
  addReaction(
    @Param('id') commentId: string,
    @CurrentUser() user: { userId: string },
    @Body() createReactionDto: CreateReactionDto,
  ): Promise<ReactionResponseDto> {
    return this.commentsService.addReaction(
      commentId,
      user.userId,
      createReactionDto.emoji,
    );
  }

  @Delete(':id/reactions/:emoji')
  removeReaction(
    @Param('id') commentId: string,
    @Param('emoji') emoji: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.commentsService.removeReaction(commentId, user.userId, emoji);
  }

  @Get(':id/reactions')
  getReactions(
    @Param('id') commentId: string,
  ): Promise<ReactionResponseDto[]> {
    return this.commentsService.getReactions(commentId);
  }
}
