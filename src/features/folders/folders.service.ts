import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FolderEntity } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { MoveFolderDto } from './dto/move-folder.dto';

@Injectable()
export class FoldersService {
  private readonly MAX_FOLDER_DEPTH = 20; // Practical limit, though schema supports 100+

  constructor(
    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<FolderEntity> {
    const { name, workspaceId, parentFolderId } = createFolderDto;

    if (parentFolderId) {
      const parentDepth = await this.calculateFolderDepth(parentFolderId);
      // If parent is at max depth, we can't add a child (it would exceed the limit)
      if (parentDepth >= this.MAX_FOLDER_DEPTH) {
        throw new BadRequestException(
          `Maximum folder depth of ${this.MAX_FOLDER_DEPTH} levels would be exceeded`,
        );
      }
    }

    const folder = this.folderRepository.create({
      name,
      workspace: { id: workspaceId } as any,
      parent: parentFolderId ? ({ id: parentFolderId } as any) : null,
    });

    return this.folderRepository.save(folder);
  }

  async findOne(id: string): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'lists'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async update(
    id: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({ where: { id } });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (updateFolderDto.name !== undefined) {
      folder.name = updateFolderDto.name;
    }

    return this.folderRepository.save(folder);
  }

  async move(id: string, moveFolderDto: MoveFolderDto): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const { parentFolderId } = moveFolderDto;

    if (!parentFolderId) {
      folder.parent = null;
      return this.folderRepository.save(folder);
    }

    if (parentFolderId === id) {
      throw new BadRequestException('Folder cannot be its own parent');
    }

    // Check if moving would create a circular reference
    const wouldCreateCycle = await this.wouldCreateCircularReference(
      id,
      parentFolderId,
    );
    if (wouldCreateCycle) {
      throw new BadRequestException(
        'Cannot move folder: would create a circular reference',
      );
    }

    // Check if new parent depth would exceed maximum
    // New depth = parent's depth + 1 (for the folder being moved)
    const newParentDepth = await this.calculateFolderDepth(parentFolderId);
    const newDepth = newParentDepth + 1;

    if (newDepth > this.MAX_FOLDER_DEPTH) {
      throw new BadRequestException(
        `Maximum folder depth of ${this.MAX_FOLDER_DEPTH} levels would be exceeded`,
      );
    }

    const newParent = await this.folderRepository.findOne({
      where: { id: parentFolderId },
    });

    if (!newParent) {
      throw new NotFoundException('New parent folder not found');
    }

    folder.parent = newParent;
    return this.folderRepository.save(folder);
  }

  async remove(id: string): Promise<void> {
    const folder = await this.folderRepository.findOne({ where: { id } });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.folderRepository.remove(folder);
  }

  async getWorkspaceTree(workspaceId: string): Promise<FolderEntity[]> {
    // Simple implementation: fetch root folders and their immediate children.
    // Can be optimized later for deeper recursion if needed.
    const roots = await this.folderRepository.find({
      where: {
        workspace: { id: workspaceId } as any,
        parent: IsNull(),
      },
      relations: ['children'],
      order: { name: 'ASC' },
    });

    return roots;
  }

  /**
   * Calculates the depth of a folder by walking up the parent chain.
   * Returns 0 for root folders (no parent).
   */
  private async calculateFolderDepth(folderId: string): Promise<number> {
    let depth = 0;
    let currentFolderId: string | null = folderId;
    const visited = new Set<string>();

    while (currentFolderId) {
      if (visited.has(currentFolderId)) {
        // Circular reference detected
        throw new BadRequestException(
          'Circular reference detected in folder hierarchy',
        );
      }

      visited.add(currentFolderId);

      const folder = await this.folderRepository.findOne({
        where: { id: currentFolderId },
        relations: ['parent'],
      });

      if (!folder) {
        break;
      }

      if (!folder.parent) {
        break;
      }

      depth++;
      currentFolderId = folder.parent.id;

      // Safety check to prevent infinite loops
      if (depth > this.MAX_FOLDER_DEPTH * 2) {
        throw new BadRequestException(
          'Folder hierarchy depth calculation exceeded safety limit',
        );
      }
    }

    return depth;
  }

  /**
   * Checks if moving a folder to a new parent would create a circular reference.
   * This happens if the new parent is a descendant of the folder being moved.
   */
  private async wouldCreateCircularReference(
    folderId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = newParentId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (currentParentId === folderId) {
        return true; // Circular reference would be created
      }

      if (visited.has(currentParentId)) {
        break; // Already checked this path
      }

      visited.add(currentParentId);

      const parent = await this.folderRepository.findOne({
        where: { id: currentParentId },
        relations: ['parent'],
      });

      if (!parent || !parent.parent) {
        break;
      }

      currentParentId = parent.parent.id;
    }

    return false;
  }
}
