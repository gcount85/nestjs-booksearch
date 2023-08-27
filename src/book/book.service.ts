import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Book as BookModel,
  User as UserModel,
  Prisma,
  SelectedBook as SelectedBookModel,
} from '@prisma/client';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { BookItemDTO } from './book.dto';

@Injectable()
export class BookService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // 책 response dto 만들기
  async searchNaverBooks(query: string): Promise<any> {
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
    bookItemDto: BookItemDTO[],
  ): Promise<SelectedBookModel[]> {
    // 1. 선택한 책을 책 테이블에 저장합니다
    const createdBooks = await Promise.all(
      bookItemDto.map(async (item) => {
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
    return await Promise.all(
      createdBooks.map(async (book) => {
        return this.prisma.selectedBook.create({
          data: {
            userId: user.id,
            bookId: book.id,
          },
        });
      }),
    );
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
}
