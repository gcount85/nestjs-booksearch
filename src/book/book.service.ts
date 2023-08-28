import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  User as UserModel,
  SelectedBook as SelectedBookModel,
  Book as BookModel,
  BookLike as BookLikeModel,
  Comment as CommentModel,
} from '@prisma/client';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  BookItemDTO,
  BookItemsDTO,
  BookLikeDto,
  SelectedBookDto,
} from './book.dto';
import { CommentDto } from './comment.dto';

type SelectedBookWithBookUser = SelectedBookModel & {
  book?: BookModel;
  user?: UserModel;
};

type BookLikeModelWithBookUser = BookLikeModel & {
  book?: BookModel;
  user?: UserModel;
};

@Injectable()
export class BookService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  transformModelToSelectedBookDto(selectedBookModel: SelectedBookWithBookUser) {
    if (!selectedBookModel) {
      return null;
    }
    const selectedBookDto = new SelectedBookDto();
    selectedBookDto.selectedBookSeq = selectedBookModel.selectedBookSeq;
    selectedBookDto.userId = selectedBookModel.userId || undefined;
    selectedBookDto.bookId = selectedBookModel.bookId;
    selectedBookDto.book = selectedBookModel.book || undefined;
    selectedBookDto.user = selectedBookModel.user || undefined;
    return selectedBookDto;
  }

  transformModelToBookLikeDto(bookLikeModel: BookLikeModelWithBookUser) {
    if (!bookLikeModel) {
      return null;
    }
    const bookLikeDto = new BookLikeDto();
    bookLikeDto.booklikeSeq = bookLikeModel.booklikeSeq;
    bookLikeDto.userId = bookLikeModel.userId || undefined;
    bookLikeDto.bookId = bookLikeModel.bookId;
    bookLikeDto.book = bookLikeModel.book || undefined;
    bookLikeDto.user = bookLikeModel.user || undefined;
    return bookLikeDto;
  }

  // TODO : undefined 확인
  transformModelToCommentDto(commentModel: CommentModel) {
    if (!commentModel) {
      return null;
    }
    const commentDto = new CommentDto();
    commentDto.id = commentModel.id || undefined;
    commentDto.content = commentModel.content;
    commentDto.userId = commentModel.userId || undefined;
    commentDto.bookId = commentModel.bookId || undefined;
    commentDto.createdAt = commentModel.createdAt || undefined;
    commentDto.updatedAt = commentModel.updatedAt;
    return commentDto;
  }

  async searchNaverBooks(query: string): Promise<BookItemsDTO> {
    try {
      const config = {
        headers: {
          'X-Naver-Client-Id': this.configService.get('naverBookClientId'),
          'X-Naver-Client-Secret': this.configService.get(
            'naverBookClientSecret',
          ),
        },
      };
      const response = await axios.get(
        `https://openapi.naver.com/v1/search/book.json?query=${query}`,
        config,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch book data from naver');
    }
  }

  async saveSelectedBook(
    user: UserModel,
    bookItemDtos: BookItemDTO[],
  ): Promise<SelectedBookModel[]> {
    // 1. 선택한 책을 책 테이블에 저장합니다
    const createdBooks: BookModel[] = await Promise.all(
      bookItemDtos.map(async (item) => {
        return this.prisma.book.create({
          data: {
            title: item.title,
            author: item.author,
            isbn: item.isbn,
            description: item.description,
          },
        });
      }),
    );

    // 2. 생성된 책과 사용자의 관계를 설정합니다.
    const selectedBookModels: SelectedBookModel[] = await Promise.all(
      createdBooks.map(async (book) => {
        return this.prisma.selectedBook.create({
          data: {
            userId: user.id,
            bookId: book.id,
          },
          include: {
            book: true,
            user: true,
          },
        });
      }),
    );

    const selectedBookDtos: SelectedBookDto[] = selectedBookModels.map(
      this.transformModelToSelectedBookDto,
    );
    return selectedBookDtos;
  }

  async getUsersSelectedBook(userId: string): Promise<SelectedBookDto[]> {
    const selectedBookModels: SelectedBookModel[] =
      await this.prisma.selectedBook.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          book: true, // Book 테이블을 join
        },
      });

    const selectedBookDtos: SelectedBookDto[] = selectedBookModels.map(
      this.transformModelToSelectedBookDto,
    );
    return selectedBookDtos;
  }

  async getUsersLikedBook(userId: string): Promise<BookLikeDto[]> {
    const bookLikeModels: BookLikeModel[] = await this.prisma.bookLike.findMany(
      {
        where: {
          userId: parseInt(userId),
        },
        include: {
          book: true, // Book 테이블을 join
        },
      },
    );

    const bookLikeDtos: BookLikeDto[] = bookLikeModels.map(
      this.transformModelToBookLikeDto,
    );
    return bookLikeDtos;
  }

  // TODO : user 타입 붙이기
  async updateBookLike(bookId: string, user): Promise<BookLikeModel> {
    const existingLike = await this.prisma.bookLike.findFirst({
      where: { userId: parseInt(user.id), bookId: parseInt(bookId) },
    });

    let bookLikeModel = undefined;

    // 이미 좋아요를 눌렀으면 좋아요 취소
    if (existingLike) {
      bookLikeModel = await this.prisma.bookLike.delete({
        where: { booklikeSeq: existingLike.booklikeSeq },
      });
    }

    bookLikeModel = await this.prisma.bookLike.create({
      data: {
        userId: parseInt(user.id),
        bookId: parseInt(bookId),
      },
      include: {
        book: true,
      },
    });

    const bookLikeDto = this.transformModelToBookLikeDto(bookLikeModel);
    return bookLikeDto;
  }

  // 책에 코멘트 생성하기
  // TODO : User 타입 추가하기
  async createCommentOnBook(
    bookId: string,
    comment: CommentDto,
    user,
  ): Promise<CommentDto> {
    const commentModel = await this.prisma.comment.create({
      data: {
        content: comment.content,
        book: { connect: { id: parseInt(bookId) } },
        user: { connect: { id: parseInt(user.id) } },
      },
      include: {
        book: true,
      },
    });
    const commentDto = this.transformModelToCommentDto(commentModel);
    return commentDto;
  }

  // 책에 달린 코멘트 보기
  async getCommentsOnBook(bookId: string): Promise<CommentDto[]> {
    const commentModel: CommentModel[] = await this.prisma.comment.findMany({
      where: {
        bookId: parseInt(bookId),
      },
    });
    const commentDtos: CommentDto[] = commentModel.map(
      this.transformModelToCommentDto,
    );
    return commentDtos;
  }

  // 책에 코멘트 수정하기
  async updateCommentOnBook(
    commentId: string,
    comment: CommentDto,
  ): Promise<CommentDto> {
    const commentModel = await this.prisma.comment.update({
      where: {
        id: parseInt(commentId),
      },
      data: {
        content: comment.content,
      },
    });

    const commentDto = this.transformModelToCommentDto(commentModel);
    return commentDto;
  }

  // 책에 코멘트 삭제하기
  async deleteCommentOnBook(commentId: string): Promise<CommentDto> {
    const commentModel = await this.prisma.comment.delete({
      where: {
        id: parseInt(commentId),
      },
    });
    const commentDto = this.transformModelToCommentDto(commentModel);
    return commentDto;
  }
}
