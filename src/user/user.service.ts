import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as UserModel } from '@prisma/client';
import { UserResponseDto, CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  transformUserModelsToDto(userModel: UserModel): UserResponseDto | null {
    if (!userModel) {
      return null;
    }
    const userResponseDto = new UserResponseDto();
    userResponseDto.id = userModel.id;
    userResponseDto.providerId = userModel.providerId;
    userResponseDto.username = userModel.username;
    userResponseDto.email = userModel.email;
    return userResponseDto;
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    let userModels: UserModel[] | null;
    try {
      userModels = await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException('유저 검색 중 에러');
    }

    if (!userModels) {
      throw new NotFoundException('등록된 유저가 없습니다.');
    }

    const userResponseDtos: UserResponseDto[] = userModels.map(
      this.transformUserModelsToDto,
    );
    return userResponseDtos;
  }

  async getUser(email: string): Promise<UserResponseDto | null> {
    let userModel: UserModel | null;

    try {
      userModel = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new InternalServerErrorException('유저 검색 중 에러');
    }

    if (!userModel) {
      throw new NotFoundException('등록된 유저가 없습니다.');
    }

    return this.transformUserModelsToDto(userModel);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const foundUserModel: UserModel = await this.getUser(createUserDto.email);

    // 이미 존재하는 유저 예외처리
    if (foundUserModel) {
      throw new BadRequestException('이미 등록된 유저입니다.');
    }

    try {
      const userModel: UserModel = await this.prisma.user.create({
        data: createUserDto,
      });
      return this.transformUserModelsToDto(userModel);
    } catch (error) {
      throw new InternalServerErrorException('유저 등록 중 에러');
    }
  }

  async findByEmailOrSave(
    email: string,
    username: string,
    providerId: string,
  ): Promise<UserResponseDto> {
    const foundUserModel: UserResponseDto = await this.getUser(email);
    if (foundUserModel) {
      return foundUserModel;
    }

    const newUser: UserResponseDto = await this.createUser({
      email,
      username,
      providerId,
    });

    return newUser;
  }
}
