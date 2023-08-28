import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;
  @IsNumber()
  userId: number;
  @IsNumber()
  bookId: number;
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
