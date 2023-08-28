import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as UserModel } from '@prisma/client';
import { UserResponseDto, CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  transformUserModelsToDto(userModel: UserModel): UserResponseDto{
    if (!userModel){
      return null
    }
    const userResponseDto = new UserResponseDto();
    userResponseDto.id = userModel.id
    userResponseDto.providerId = userModel.providerId || undefined
    userResponseDto.username = userModel.username;
    userResponseDto.email = userModel.email;
    return userResponseDto;
  }

  async getAllUsers(): Promise<UserResponseDto[] | null> {
    const userModels: UserModel[] = await this.prisma.user.findMany();
    const userResponseDtos: UserResponseDto[] = userModels.map(this.transformUserModelsToDto)
    return userResponseDtos
  }

  async getUser(email: string): Promise<UserResponseDto | null> {
    const userModel: UserModel = await this.prisma.user.findUnique({
      where: { email },
    });
    return this.transformUserModelsToDto(userModel)
  }
  
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const userModel: UserModel = await this.prisma.user.create({ data : createUserDto });
    return this.transformUserModelsToDto(userModel)
  }

  async findByEmailOrSave(
    email: string,
    username: string,
    providerId: string,
  ): Promise<UserResponseDto> {
    const foundUserModel: UserResponseDto = await this.getUser(email);
    if (foundUserModel) {
      return foundUserModel
    }
    
    const newUser: UserResponseDto = await this.createUser({
      email,
      username,
      providerId,
    });
    
    return newUser
  }
}
