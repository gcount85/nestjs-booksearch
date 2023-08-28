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
  @IsNumberString() // TODO: 카카오 재가입해서 테스트 할 것
  providerId: string;
  @IsNotEmpty()
  username: string;
}
