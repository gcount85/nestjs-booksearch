import { IsNumberString, ValidateNested } from 'class-validator';
import { UserResponseDto } from 'src/user/user.dto';

export class BookItemDto {
  title: string;
  link: string;
  image: string;
  author: string;
  discount: string;
  publisher: string;
  pubdate: string;
  @IsNumberString()
  isbn: string;
  description: string;
}

export class BookItemsDto {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  @ValidateNested()
  items: BookItemDto[];
}

export class BookDto {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description: string;
}

export class SelectedBookDto {
  selectedBookSeq: number;
  userId: number;
  bookId: number;
  @ValidateNested()
  book?: BookDto;
  @ValidateNested()
  user?: UserResponseDto;
}

export class BookLikeDto {
  booklikeSeq: number;
  userId: number;
  bookId: number;
  @ValidateNested()
  book?: BookDto;
  @ValidateNested()
  user?: UserResponseDto;
}
