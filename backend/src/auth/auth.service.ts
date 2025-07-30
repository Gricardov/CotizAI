import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export interface LoginDto {
  username: string;
  password: string;
  area: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  area: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string, area: string): Promise<User | null> {
    // Por ahora, usuario hardcodeado
    if (username === 'admin' && password === '12345') {
      return {
        id: 1,
        username: 'admin',
        role: 'cotizador',
        area: area,
      };
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password, loginDto.area);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      area: user.area 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        area: user.area,
      },
    };
  }

  async validateToken(payload: any): Promise<User> {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      area: payload.area,
    };
  }
} 