import { IsEmail } from 'class-validator';

export class UserResponseDto {
  id: number;
  @IsEmail()
  email: string;
  providerId: string;
  username: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;
  providerId: string;
  username: string;
}
