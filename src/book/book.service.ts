import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  BookDto,
  BookItemDTO,
  BookItemsDTO,
  BookLikeDto,
  SelectedBookDto,
} from './book.dto';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';

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

  transformModelToBookDto(bookModel: BookModel) {
    if (!bookModel) {
      return null;
    }
    const bookDto = new BookDto();
    bookDto.id = bookModel.id;
    bookDto.title = bookModel.title;
    bookDto.author = bookModel.author;
    bookDto.isbn = bookModel.isbn;
    bookDto.description = bookModel.description;
    return bookDto;
  }

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

  transformModelToCommentDto(commentModel: CommentModel) {
    if (!commentModel) {
      return null;
    }
    const commentDto = new CommentDto();
    commentDto.id = commentModel.id;
    commentDto.content = commentModel.content;
    commentDto.userId = commentModel.userId;
    commentDto.bookId = commentModel.bookId;
    commentDto.createdAt = commentModel.createdAt;
    commentDto.updatedAt = commentModel.updatedAt;
    return commentDto;
  }

  async searchNaverBooks(query: string): Promise<BookItemsDTO> {
    try {
      const config = {
        headers: {
          'X-Naver-Client-Id': this.configService.get('NAVER_BOOK_CLIENT_ID'),
          'X-Naver-Client-Secret': this.configService.get(
            'NAVER_BOOK_CLIENT_SECRET',
          ),
        },
      };
      const response = await axios.get(
        `https://openapi.naver.com/v1/search/book.json?query=${query}`,
        config,
      );
      return response.data;
    } catch (error) {
      console.log('!!!!!!!!!!!!!! ', query);
      console.log(error);
      throw new InternalServerErrorException(
        '네이버 책 검색 결과 가져오기 실패',
      );
    }
  }

  async getAllBooks() {
    let bookModels: BookModel[];

    try {
      bookModels = await this.prisma.book.findMany();
    } catch (error) {
      throw new InternalServerErrorException('book 검색 중 에러');
    }

    if (!bookModels) {
      throw new NotFoundException('저장된 책이 없습니다.');
    }

    const bookDto = bookModels.map(this.transformModelToBookDto);
    return bookDto;
  }

  async deleteBookByBookId(bookId: string) {
    let bookModel: BookModel;

    try {
      bookModel = await this.prisma.book.delete({
        where: {
          id: parseInt(bookId),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'book 삭제 중 에러. 유저와 관계가 있는 책일 수 있습니다. ',
      );
    }

    if (!bookModel) {
      throw new NotFoundException('찾고자 하는 책이 없습니다.');
    }

    const bookDto = this.transformModelToBookDto(bookModel);
    return bookDto;
  }

  async saveSelectedBookByUser(
    bookItemDtos: BookItemDTO[],
    userId: string,
  ): Promise<SelectedBookModel[]> {
    let createdBooks: BookModel[];
    let selectedBookModels: SelectedBookModel[];
    try {
      // 1. 선택한 책을 책 테이블에 저장합니다
      createdBooks = await Promise.all(
        bookItemDtos.map(async (item) => {
          const book = await this.prisma.book.findFirst({
            where: { isbn: item.isbn },
          });
          if (book) {
            return book;
          }
          return await this.prisma.book.create({
            data: {
              title: item.title,
              author: item.author,
              isbn: item.isbn,
              description: item.description,
            },
          });
        }),
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('book 등록 중 에러');
    }

    // 2. 생성된 책과 사용자의 관계를 설정합니다.
    try {
      selectedBookModels = await Promise.all(
        createdBooks.map(async (book) => {
          const existingSelectedBook = await this.prisma.selectedBook.findFirst(
            {
              where: {
                userId: parseInt(userId),
                bookId: book.id,
              },
            },
          );
          if (existingSelectedBook) {
            return;
          }
          return await this.prisma.selectedBook.create({
            data: {
              userId: parseInt(userId),
              bookId: book.id,
            },
            include: {
              book: true,
              user: true,
            },
          });
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('selectedBook 등록 중 에러');
    }
    const selectedBookDtos: SelectedBookDto[] = selectedBookModels.map(
      this.transformModelToSelectedBookDto,
    );
    return selectedBookDtos;
  }

  async getSelectedBooksByUser(userId: string): Promise<SelectedBookDto[]> {
    let selectedBookModels: SelectedBookModel[];

    try {
      selectedBookModels = await this.prisma.selectedBook.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          book: true, // Book 테이블을 join
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('selectedBook 검색 중 에러');
    }

    if (!selectedBookModels) {
      throw new NotFoundException('유저가 선택하여 저장한 책이 없습니다.');
    }

    const selectedBookDtos: SelectedBookDto[] = selectedBookModels.map(
      this.transformModelToSelectedBookDto,
    );
    return selectedBookDtos;
  }

  async deleteSelectedBookByUser(
    selectedBookSeq: string,
  ): Promise<SelectedBookDto> {
    let selectedBookModel: SelectedBookModel;

    try {
      selectedBookModel = await this.prisma.selectedBook.delete({
        where: {
          selectedBookSeq: parseInt(selectedBookSeq),
        },
        include: {
          book: true, // Book 테이블을 join
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'selectedBook 특정 책 삭제 중 에러',
      );
    }

    if (!selectedBookModel) {
      throw new NotFoundException('유저가 선택하여 저장한 책이 없습니다.');
    }

    const selectedBookDtos =
      this.transformModelToSelectedBookDto(selectedBookModel);
    return selectedBookDtos;
  }

  async getBooksLikedByUser(userId: string): Promise<BookLikeDto[]> {
    let bookLikeModels: BookLikeModel[];
    try {
      bookLikeModels = await this.prisma.bookLike.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          book: true, // Book 테이블을 join
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('bookLike 검색 중 에러');
    }

    if (!bookLikeModels) {
      throw new NotFoundException('유저가 좋아요를 누른 책이 없습니다.');
    }

    const bookLikeDtos: BookLikeDto[] = bookLikeModels.map(
      this.transformModelToBookLikeDto,
    );
    return bookLikeDtos;
  }

  async updateBookLike(bookId: string, userId: string): Promise<BookLikeModel> {
    const userIdInt = parseInt(userId);
    const bookIdInt = parseInt(bookId);

    let existingLike: BookLikeModel | null;
    try {
      existingLike = await this.prisma.bookLike.findFirst({
        where: { userId: userIdInt, bookId: bookIdInt },
      });
    } catch (error) {
      throw new InternalServerErrorException('bookLike 검색 중 에러');
    }

    // 이미 좋아요를 눌렀으면 좋아요 취소
    if (existingLike) {
      await this.prisma.bookLike.delete({
        where: { booklikeSeq: existingLike.booklikeSeq },
      });
      return this.transformModelToBookLikeDto(null);
    }

    let bookLikeModel: BookLikeModel;
    try {
      bookLikeModel = await this.prisma.bookLike.create({
        data: {
          userId: userIdInt,
          bookId: bookIdInt,
        },
        include: {
          book: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('bookLike 업데이트 중 에러');
    }

    return this.transformModelToBookLikeDto(bookLikeModel);
  }

  async getAllComments(): Promise<CommentDto[]> {
    let commentModel: CommentModel[];

    try {
      commentModel = await this.prisma.comment.findMany();
    } catch (error) {
      throw new InternalServerErrorException('모든 comment 검색 중 에러 ');
    }
    if (!commentModel) {
      throw new NotFoundException('등록된 코멘트가 없습니다.');
    }

    const commentDtos: CommentDto[] = commentModel.map(
      this.transformModelToCommentDto,
    );
    return commentDtos;
  }

  // 책에 코멘트 생성하기
  async createCommentOnBook(comment: CreateCommentDto): Promise<CommentDto> {
    let commentModel: CommentModel;
    try {
      commentModel = await this.prisma.comment.create({
        data: {
          content: comment.content,
          book: { connect: { id: parseInt(comment.bookId) } },
          user: { connect: { id: parseInt(comment.userId) } },
        },
        include: {
          book: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('comment 등록 중 에러 ');
    }

    const commentDto = this.transformModelToCommentDto(commentModel);
    return commentDto;
  }

  // 책에 달린 코멘트 보기
  async getCommentsOnBook(bookId: string): Promise<CommentDto[]> {
    let commentModel: CommentModel[];
    try {
      commentModel = await this.prisma.comment.findMany({
        where: {
          bookId: parseInt(bookId),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('comment 검색 중 에러 ');
    }
    if (!commentModel) {
      throw new NotFoundException('등록된 코멘트가 없습니다.');
    }

    const commentDtos: CommentDto[] = commentModel.map(
      this.transformModelToCommentDto,
    );
    return commentDtos;
  }

  // 책에 코멘트 수정하기
  async updateCommentOnBook(
    commentId: string,
    comment: UpdateCommentDto,
  ): Promise<CommentDto> {
    let commentModel: CommentModel;
    try {
      commentModel = await this.prisma.comment.update({
        where: {
          id: parseInt(commentId),
        },
        data: {
          content: comment.content,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('comment 업데이트 중 에러 ');
    }
    const commentDto = this.transformModelToCommentDto(commentModel);
    return commentDto;
  }

  // 책에 코멘트 삭제하기
  async deleteCommentOnBook(commentId: string): Promise<CommentDto> {
    let commentModel: CommentModel;
    try {
      commentModel = await this.prisma.comment.delete({
        where: {
          id: parseInt(commentId),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('comment 삭제 중 에러 ');
    }
    const commentDto = this.transformModelToCommentDto(commentModel);
    return commentDto;
  }
}
