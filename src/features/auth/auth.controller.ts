import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from '../mail/mail.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService) { }

  @Post('register')
  register(@Body() createAuthDto: CreateAuthDto): Promise<AuthResponseDto> {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  login(
    @Body() createAuthDto: CreateAuthDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(createAuthDto.email, createAuthDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  me(@CurrentUser() user: any) {
    return user;
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    try{
      const passwordResetToken = await this.authService.requestPasswordReset(requestPasswordResetDto);
      await this.authService.sendPasswordResetEmail(requestPasswordResetDto.email, passwordResetToken ?? '');
      return { message: 'If an account exists for this email, you will receive a reset link shortly.' };
    } catch (error) {
      throw new BadRequestException('Failed to request password reset. Please try again.');
    }
  }

  @Put('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try{
      await this.authService.resetPassword(resetPasswordDto);
      return { message: 'Password reset successfully.' };
    } catch (error) {
      throw new BadRequestException('Failed to reset password. Please try again.');
    }
  }
}
