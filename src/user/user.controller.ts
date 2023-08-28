import { Param, Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':email')
  async getUser(@Param('email') email: string): Promise<UserResponseDto> {
    return await this.userService.getUser(email);
  }

  @Post()
  async signupUser(
    @Body()
    userCreateDto: {
      username: string;
      email: string;
      providerId: string;
    },
  ): Promise<UserResponseDto> {
    return this.userService.createUser(userCreateDto);
  }
}
