import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/mikroorm/entities/User';
import { AppConfigService } from '../app-config/app-config.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly em: EntityManager, private readonly appConfigService: AppConfigService) {}

  async validateUser(pass: string): Promise<any> {
    const valid = await compare(pass, this.appConfigService.get<string>('ADMIN_PASSCODE'));
    return valid && { username: 'admin' };
  }

  async login(user: { username: string }) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
