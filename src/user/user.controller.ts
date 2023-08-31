import { Param, Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto } from './user.dto';
import { AuthenticatedGuard } from 'src/auth/auth.guard';

@Controller('users')
@UseGuards(AuthenticatedGuard) // 클래스 레벨에 적용
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
