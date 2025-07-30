import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import type { LoginDto } from './auth.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken(@Request() req: any) {
    return { valid: true, user: req.user };
  }
} 