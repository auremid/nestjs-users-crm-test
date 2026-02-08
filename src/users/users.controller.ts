import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryDto } from './dto/get-users.query.dto';

@Controller('api/v1')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get-user/:id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get('get-users')
  async getUsers(@Query() query: UsersQueryDto) {
    return this.usersService.getUsers(query);
  }
}
