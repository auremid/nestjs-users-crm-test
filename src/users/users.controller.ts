import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryDto } from './dto/get-users.query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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

  @Post('add-user')
  async createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }
}
