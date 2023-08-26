import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as UserModel, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<UserModel> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmailOrSave(
    email: string,
    username: string,
    providerId: string,
  ): Promise<UserModel> {
    const foundUser = await this.getUser(email);
    if (foundUser) {
      return foundUser;
    }

    const newUser = await this.createUser({
      email,
      username,
      providerId,
    });

    return newUser;
  }
}
