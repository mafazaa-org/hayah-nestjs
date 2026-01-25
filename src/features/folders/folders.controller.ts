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
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { MoveFolderDto } from './dto/move-folder.dto';
import { FolderEntity } from './entities/folder.entity';

@ApiTags('folders')
@ApiBearerAuth('access-token')
@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto): Promise<FolderEntity> {
    return this.foldersService.create(createFolderDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FolderEntity> {
    return this.foldersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ): Promise<FolderEntity> {
    return this.foldersService.update(id, updateFolderDto);
  }

  @Put(':id/move')
  move(
    @Param('id') id: string,
    @Body() moveFolderDto: MoveFolderDto,
  ): Promise<FolderEntity> {
    return this.foldersService.move(id, moveFolderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.foldersService.remove(id);
  }

  @Get('workspace/:workspaceId/tree')
  getWorkspaceTree(
    @Param('workspaceId') workspaceId: string,
  ): Promise<FolderEntity[]> {
    return this.foldersService.getWorkspaceTree(workspaceId);
  }
}
