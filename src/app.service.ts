import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  root(): object {
    return {
      // 환경 별 환경변수 출력
      message: this.configService.get('message'),
      serviceUrl: this.configService.get('serviceUrl'),
      logLevel: this.configService.get('logLevel'),
      apiVersion: this.configService.get('apiVersion'),
      dbInfo: this.configService.get('dbInfo'),
    };
  }
}
