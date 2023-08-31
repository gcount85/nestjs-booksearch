import { Param, Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto } from './user.dto';
import { AuthenticatedGuard } from 'src/auth/auth.guard';

@Controller('users')
@UseGuards(AuthenticatedGuard) // 클래스 레벨에 적용
export class UserController {
  constructor(private userService: UserService) {}

  /* 등록된 전체 유저 불러오기 */
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getAllUsers();
  }

  /* 이메일로 유저 식별하기 */
  @Get(':email')
  async getUser(@Param('email') email: string): Promise<UserResponseDto> {
    return await this.userService.getUser(email);
  }

  /* 유저 강제 등록하기 */
  @Post()
  async signupUser(
    @Body()
    userCreateDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(userCreateDto);
  }
}
