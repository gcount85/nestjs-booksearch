import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  User as UserModel,
  SelectedBook as SelectedBookModel,
  Book as BookModel
} from '@prisma/client';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { BookItemDTO, BookItemsDTO, SelectedBookDto } from './book.dto';
import { CommentDto } from './comment.dto';

@Injectable()
export class BookService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  transformModelToSelectedBookDto(selectedBookModel: SelectedBookModel){
    if (!selectedBookModel){
      return null
    }
    const selectedBookDto = new SelectedBookDto();
    selectedBookDto.selectedBookSeq = selectedBookModel.selectedBookSeq
    selectedBookDto.userId = selectedBookModel.userId || undefined
    selectedBookDto.bookId = selectedBookModel.bookId;
    selectedBookDto.book = selectedBookModel.book || undefined;
    selectedBookDto.user = selectedBookModel.user || undefined;
    return selectedBookDto;
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
            user: true
          }
        });
      }),
    );

    return selectedBookModels
  }

  async getUsersSelectedBook(userId: string) {
    return await this.prisma.selectedBook.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        book: true, // Book 테이블을 join
      },
    });
  }

  async getUsersLikedBook(userId: string) {
    return await this.prisma.bookLike.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        book: true, // Book 테이블을 join
      },
    });
  }

  async updateBookLike(bookId: string, user) {
    const existingLike = await this.prisma.bookLike.findFirst({
      where: { userId: parseInt(user.id), bookId: parseInt(bookId) },
    });

    // 이미 좋아요를 눌렀으면 좋아요 취소
    if (existingLike) {
      return await this.prisma.bookLike.delete({
        where: { booklikeSeq: existingLike.booklikeSeq },
      });
    }

    return await this.prisma.bookLike.create({
      data: {
        userId: parseInt(user.id),
        bookId: parseInt(bookId),
      },
      include: {
        book: true,
      },
    });
  }

  // 책에 달린 코멘트 보기
  async getCommentsOnBook(bookId: string) {
    return await this.prisma.comment.findMany({
      where: {
        bookId: parseInt(bookId),
      },
    });
  }

  // 책에 코멘트 생성하기
  async createCommentOnBook(bookId: string, commentDto: CommentDto, user) {
    return await this.prisma.comment.create({
      data: {
        content: commentDto.content,
        book: { connect: { id: parseInt(bookId) } },
        user: { connect: { id: parseInt(user.id) } },
      },
      include: {
        book: true,
      },
    });
  }

  // 책에 코멘트 수정하기
  async updateCommentOnBook(commentId: string, commentDto: CommentDto) {
    console.log(commentDto);
    console.log(commentDto.content);

    const result = await this.prisma.comment.update({
      where: {
        id: parseInt(commentId),
      },
      data: {
        content: commentDto.content,
      },
    });

    return result;
  }

  // 책에 코멘트 삭제하기
  async deleteCommentOnBook(commentId: string) {
    return await this.prisma.comment.delete({
      where: {
        id: parseInt(commentId),
      },
    });
  }
}
