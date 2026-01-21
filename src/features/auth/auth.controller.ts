import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @HttpCode(HttpStatus.NO_CONTENT)
  requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    return this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @Put('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
