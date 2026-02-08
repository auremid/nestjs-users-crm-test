import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  signToken() {
    return { access_token: this.jwtService.sign({ sub: 'admin' }) };
  }
}
