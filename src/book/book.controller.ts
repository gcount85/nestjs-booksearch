import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';
import {
  BookDto,
  BookItemDto,
  BookItemsDto,
  BookLikeDto,
  SelectedBookDto,
} from './book.dto';
import { AuthenticatedGuard } from 'src/auth/auth.guard';

@Controller('books')
@UseGuards(AuthenticatedGuard) // 클래스 레벨에 적용
export class BookController {
  constructor(private bookService: BookService) {}

  /* 네이버 책 검색 결과 반환하기 (디폴트 10개로 고정) */
  @Get('search')
  async searchNaverBooks(@Query('query') query: string): Promise<BookItemsDto> {
    return await this.bookService.searchNaverBooks(query);
  }

  /* DB에 저장된 모든 책 보기 */
  @Get('')
  async getAllBooks(): Promise<BookDto[]> {
    return await this.bookService.getAllBooks();
  }

  /* bookId로 DB에 저장된 특정 책 삭제 */
  @Delete(':bookId')
  async deleteBookByBookId(@Param('bookId') bookId: string): Promise<BookDto> {
    return await this.bookService.deleteBookByBookId(bookId);
  }

  /* 유저가 선택한 책 리스트를 DB에 저장하고 유저와 관계 생성 */
  @Post('selected/:userId')
  async saveSelectedBookByUser(
    @Body('bookItemDtos') bookItemDtos: BookItemDto[],
    @Param('userId') userId: string,
  ): Promise<SelectedBookDto[]> {
    return await this.bookService.saveSelectedBookByUser(bookItemDtos, userId);
  }

  /* 특정 유저가 저장한 책 리스트 조회 */
  @Get('selected/:userId')
  async getSelectedBooksByUser(
    @Param('userId') userId: string,
  ): Promise<SelectedBookDto[]> {
    return await this.bookService.getSelectedBooksByUser(userId);
  }

  /* 유저의 저장된 책 리스트에서 selectedBookSeq로 특정 책 삭제 */
  @Delete('selected/:selectedBookSeq')
  async deleteSelectedBookByBookSeq(
    @Param('selectedBookSeq') selectedBookSeq: string,
  ): Promise<SelectedBookDto> {
    return await this.bookService.deleteSelectedBookByBookSeq(selectedBookSeq);
  }

  /* 특정 유저가 좋아요를 누른 책 리스트 조회하기 */
  @Get('liked/:userId')
  async getBooksLikedByUser(
    @Param('userId') userId: string,
  ): Promise<BookLikeDto[]> {
    return await this.bookService.getBooksLikedByUser(userId);
  }

  /* 책에 좋아요 누르기 & 취소하기 */
  @Put(':bookId/likes/:userId')
  async updateBookLike(
    @Param('bookId') bookId: string,
    @Param('userId') userId: string,
  ): Promise<BookLikeDto> {
    return await this.bookService.updateBookLike(bookId, userId);
  }

  /* DB에 저장된 모든 코멘트 보기 */
  @Get('comments')
  async getAllComments(): Promise<CommentDto[]> {
    return await this.bookService.getAllComments();
  }

  /* 특정 책에 코멘트 생성하기 */
  @Post(':bookId/comments')
  async createCommentOnBook(
    @Body('comment') comment: CreateCommentDto,
  ): Promise<CommentDto> {
    return await this.bookService.createCommentOnBook(comment);
  }

  /* 특정 책에 달린 코멘트 보기 */
  @Get(':bookId/comments')
  async getCommentsOnBook(
    @Param('bookId') bookId: string,
  ): Promise<CommentDto[]> {
    return await this.bookService.getCommentsOnBook(bookId);
  }

  /* 특정 책에 달린 코멘트 수정하기 */
  @Put(':bookId/comments/:commentId')
  async updateCommentOnBook(
    @Param('commentId') commentId: string,
    @Body('comment') comment: UpdateCommentDto,
  ): Promise<CommentDto> {
    return await this.bookService.updateCommentOnBook(commentId, comment);
  }

  /* 특정 책에 달린 코멘트 삭제하기 */
  @Delete(':bookId/comments/:commentId')
  async deleteCommentOnBook(
    @Param('commentId') commentId: string,
  ): Promise<CommentDto> {
    return await this.bookService.deleteCommentOnBook(commentId);
  }
}
