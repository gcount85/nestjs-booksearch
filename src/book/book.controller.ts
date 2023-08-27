import { Controller, Get, Query, Param, Body, Post } from '@nestjs/common';
import { BookService } from './book.service';
import {
  Book as BookModel,
  SelectedBook as SelectedBookModel,
} from '@prisma/client';

@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  // GET localhost:3000/books/search?query=철학
  // 네이버 책 검색 결과 디폴트 10개 반환
  @Get('search')
  async searchNaverBooks(@Query('query') query: string) {
    return await this.bookService.searchNaverBooks(query);
  }

  // 유저가 선택한 책 리스트를 받아서 DB에 저장
  @Post()
  async saveSelectedBook(
    @Body() { bookItemDto, user },
  ): Promise<SelectedBookModel[]> {
    return await this.bookService.saveSelectedBook(user, bookItemDto);
  }
}
