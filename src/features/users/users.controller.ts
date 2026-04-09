import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';
import { memoryStorage } from 'multer';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<UserResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.searchUsers(query, limitNum);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: { userId: string }): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.userId);
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.userId, updateUserDto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return this.usersService.uploadAvatar(user.userId, file);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: { userId: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(user.userId, changePasswordDto);
  }

  @Get('me/settings')
  async getUserSettings(
    @CurrentUser() user: { userId: string },
  ): Promise<UserSettingsResponseDto> {
    return this.usersService.getUserSettings(user.userId);
  }

  @Put('me/settings')
  async updateUserSettings(
    @CurrentUser() user: { userId: string },
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    return this.usersService.updateUserSettings(user.userId, updateUserSettingsDto);
  }
}

