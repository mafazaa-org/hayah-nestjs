import { Controller } from '@nestjs/common';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) {}
}
