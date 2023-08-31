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

  /* prisma 유저 모델 response를 DTO로 변환시킨다 */
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

  /* 등록된 전체 유저 불러오기 */
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

  /* 이메일로 유저 식별하기 */
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

  /* 유저 생성하기 */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    let foundUserModel: UserModel;
    try {
      foundUserModel = await this.prisma.user.findFirst({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      throw new InternalServerErrorException('유저 검색 중 에러');
    }

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
      throw new InternalServerErrorException(
        '유저 등록 중 에러. 이미 등록된 providerId일 수 있습니다.',
      );
    }
  }

  /* 이미 존재하는 유저인지 확인 후 등록한다 */
  async findByEmailOrSave(
    email: string,
    username: string,
    providerId: string,
  ): Promise<UserResponseDto> {
    const foundUserModel: UserResponseDto = await this.prisma.user.findFirst({
      where: { email },
    });
    if (foundUserModel) {
      return foundUserModel;
    }

    try {
      const newUserModel: UserModel = await this.prisma.user.create({
        data: { email, username, providerId },
      });
      return this.transformUserModelsToDto(newUserModel);
    } catch (error) {
      throw new InternalServerErrorException('유저 등록 중 에러.');
    }
  }
}
