import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AuthEntity } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { randomBytes } from 'crypto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<AuthResponseDto> {
    const { email, password, name } = createAuthDto;

    const existing = await this.userRepository.findOne({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpiresAt = new Date();
    emailVerificationTokenExpiresAt.setHours(
      emailVerificationTokenExpiresAt.getHours() + 24,
    ); // 24 hours expiry

    const user = this.userRepository.create({
      email,
      passwordHash,
      name: name ?? null,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
    });

    const savedUser = await this.userRepository.save(user);

    // TODO: Send verification email (requires email service integration)
    // await this.sendVerificationEmail(savedUser.email, emailVerificationToken);

    const accessToken = this.signToken(savedUser);

    return {
      accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { token } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;

    await this.userRepository.save(user);
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestPasswordResetDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      return;
    }

    // Generate password reset token
    const passwordResetToken = randomBytes(32).toString('hex');
    const passwordResetTokenExpiresAt = new Date();
    passwordResetTokenExpiresAt.setHours(
      passwordResetTokenExpiresAt.getHours() + 1,
    ); // 1 hour expiry

    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt;

    await this.userRepository.save(user);

    // TODO: Send password reset email (requires email service integration)
    // await this.sendPasswordResetEmail(user.email, passwordResetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid reset token');
    }

    if (
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiresAt = null;

    await this.userRepository.save(user);
  }

  private signToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
}
