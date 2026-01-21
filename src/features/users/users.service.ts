import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSettingsEntity } from './entities/user-settings.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly userSettingsRepository: Repository<UserSettingsEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    // Note: avatarUrl would be handled separately via file upload service
    // For now, we can store it in a separate column if needed in the future

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.passwordHash = newPasswordHash;

    await this.userRepository.save(user);
  }

  async getUserSettings(userId: string): Promise<UserSettingsResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let settings = await this.userSettingsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!settings) {
      settings = this.userSettingsRepository.create({ user });
      settings = await this.userSettingsRepository.save(settings);
    }

    return {
      id: settings.id,
      timezone: settings.timezone,
      language: settings.language,
      notificationPreferences: settings.notificationPreferences,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async updateUserSettings(
    userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let settings = await this.userSettingsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!settings) {
      settings = this.userSettingsRepository.create({ user });
    }

    if (updateUserSettingsDto.timezone !== undefined) {
      settings.timezone = updateUserSettingsDto.timezone;
    }

    if (updateUserSettingsDto.language !== undefined) {
      settings.language = updateUserSettingsDto.language;
    }

    if (updateUserSettingsDto.notificationPreferences !== undefined) {
      settings.notificationPreferences =
        updateUserSettingsDto.notificationPreferences;
    }

    const updatedSettings = await this.userSettingsRepository.save(settings);

    return {
      id: updatedSettings.id,
      timezone: updatedSettings.timezone,
      language: updatedSettings.language,
      notificationPreferences: updatedSettings.notificationPreferences,
      createdAt: updatedSettings.createdAt,
      updatedAt: updatedSettings.updatedAt,
    };
  }
}

