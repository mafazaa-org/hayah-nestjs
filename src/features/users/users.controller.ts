import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

