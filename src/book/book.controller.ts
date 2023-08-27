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

  // 유저가 선택한 책 리스트를 받아서 DB에 저장
  @Get('selected/:userId')
  async getUsersSelectedBook(@Param('userId') userId: string) {
    return await this.bookService.getUsersSelectedBook(userId);
  }

  // 유저가 좋아요 한 책 리스트 조회하기
  @Get('liked/:userId')
  async getUsersLikedBook(@Param('userId') userId: string) {
    return await this.bookService.getUsersLikedBook(userId);
  }

  // 책에 좋아요 누르기
  @Post(':bookId/like')
  async updateBookLike(@Param('bookId') bookId: string, @Body() user) {
    return await this.bookService.updateBookLike(bookId, user);
  }
}
