import { IsNotEmpty } from 'class-validator';

export class CommentDto {
  id?: number;
  @IsNotEmpty()
  content: string;
  userId?: number;
  bookId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
