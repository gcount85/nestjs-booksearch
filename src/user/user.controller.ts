import { Param, Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto } from './user.dto';

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
    userCreateDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(userCreateDto);
  }
}
