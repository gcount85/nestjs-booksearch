import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CommentDto } from './comment.dto';
import {
  BookItemDTO,
  BookItemsDTO,
  BookLikeDto,
  SelectedBookDto,
} from './book.dto';

@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  // GET localhost:3000/books/search?query=철학
  // 네이버 책 검색 결과 디폴트 10개 반환
  @Get('search')
  async searchNaverBooks(@Query('query') query: string): Promise<BookItemsDTO> {
    return await this.bookService.searchNaverBooks(query);
  }

  // 유저가 선택한 책 리스트를 받아서 DB에 저장
  @Post('selected/:userId')
  async saveSelectedBookByUser(
    @Body('bookItemDtos') bookItemDtos: BookItemDTO[],
    @Param('userId') userId: string,
  ): Promise<SelectedBookDto[]> {
    return await this.bookService.saveSelectedBookByUser(bookItemDtos, userId);
  }

  // 유저가 저장한 책 리스트 DB에서 조회
  @Get('selected/:userId')
  async getSelectedBooksByUser(
    @Param('userId') userId: string,
  ): Promise<SelectedBookDto[]> {
    return await this.bookService.getSelectedBooksByUser(userId);
  }

  // 유저가 좋아요 한 책 리스트 조회하기
  @Get('liked/:userId')
  async getBooksLikedByUser(
    @Param('userId') userId: string,
  ): Promise<BookLikeDto[]> {
    return await this.bookService.getBooksLikedByUser(userId);
  }

  // 책에 좋아요 누르기 & 취소하기
  @Post(':bookId/likes')
  async updateBookLike(
    @Param('bookId') bookId: string,
    @Body('userId') userId: string,
  ): Promise<BookLikeDto> {
    return await this.bookService.updateBookLike(bookId, userId);
  }

  // 책에 코멘트 생성하기
  @Post(':bookId/comments')
  async createCommentOnBook(
    @Param('bookId') bookId: string,
    @Body('comment') comment: CommentDto,
    @Body('user') userId: string,
  ): Promise<CommentDto> {
    return await this.bookService.createCommentOnBook(bookId, comment, userId);
  }

  // 책에 달린 코멘트 보기
  @Get(':bookId/comments')
  async getCommentsOnBook(
    @Param('bookId') bookId: string,
  ): Promise<CommentDto[]> {
    return await this.bookService.getCommentsOnBook(bookId);
  }

  // 책에 코멘트 수정하기
  @Put(':bookId/comments/:commentId')
  async updateCommentOnBook(
    @Param('commentId') commentId: string,
    @Body('comment') comment: CommentDto,
  ): Promise<CommentDto> {
    return await this.bookService.updateCommentOnBook(commentId, comment);
  }

  // 책에 코멘트 삭제하기
  @Delete(':bookId/comments/:commentId')
  async deleteCommentOnBook(
    @Param('commentId') commentId: string,
  ): Promise<CommentDto> {
    return await this.bookService.deleteCommentOnBook(commentId);
  }
}
