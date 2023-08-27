import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [UserModule],
  controllers: [BookController],
  providers: [BookService, PrismaService],
})
export class BookModule {}
