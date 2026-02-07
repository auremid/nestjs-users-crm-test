import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/v1')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('get-user/:id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
