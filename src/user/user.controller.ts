import { Param, Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':email')
  async getUser(@Param('email') email: string): Promise<UserModel> {
    return await this.userService.getUser(email);
  }

  @Post()
  async signupUser(
    @Body() userData: { username: string; email: string; providerId: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
