import { IsEmail, IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class UserResponseDto {
  @IsNumber()
  id: number;
  @IsEmail()
  email: string;
  providerId: string;
  username: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsNumberString()
  providerId: string;
  @IsNotEmpty()
  username: string;
}
