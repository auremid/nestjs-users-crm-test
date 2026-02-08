import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login() {
    return this.authService.signToken();
  }
}
