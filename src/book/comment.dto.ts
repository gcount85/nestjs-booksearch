import { IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;
  @IsNumberString()
  userId: string;
  @IsNumberString()
  bookId: string;
}

export class UpdateCommentDto {
  @IsNotEmpty()
  content: string;
}

export class CommentDto {
  id: number;
  @IsNotEmpty()
  content: string;
  userId: number;
  bookId: number;
  createdAt: Date;
  updatedAt?: Date;
}
