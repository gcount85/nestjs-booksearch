import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  root(): object {
    return {
      // 환경 별 환경변수 출력
      message: this.configService.get('MESSAGE'),
      serviceUrl: this.configService.get('SERVICE_URL'),
      databaseInfo: this.configService.get('DATABASE_INFO'),
    };
  }
}
