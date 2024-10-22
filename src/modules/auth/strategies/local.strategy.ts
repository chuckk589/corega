import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    // console.log(password);
    // const user = await this.authService.validateUser(password);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;
    try {
      //password is jwt token, decode it
      const payload = this.jwtService.verify(password);
      return payload;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
