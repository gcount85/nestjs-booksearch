import config from './configs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { BookModule } from './book/book.module';

console.log('env: ' + process.env.NODE_ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `${process.cwd()}/envs/${process.env.NODE_ENV}.env`,
      load: [config],
    }),
    UserModule,
    AuthModule,
    BookModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
