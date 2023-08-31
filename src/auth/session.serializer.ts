import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userService: UserService) {
    super();
  }
  /* 세션에 유저 정보 저장하기(이메일) */
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user.email);
  }

  /* 세션에 저장된 유저 정보 불러오기 */
  async deserializeUser(
    payload: string,
    done: (err: Error, user: any) => void,
  ): Promise<any> {
    const user = await this.userService.getUser(payload);
    if (!user) {
      done(new Error('No user'), null);
    }

    // 유저 정보가 있다면 유저 정보 반환
    done(null, user);
  }
}
