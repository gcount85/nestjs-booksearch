import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User as UserModel } from '@prisma/client';

@Injectable()
export class KakaoOauthStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // 부모 클래스의 생성자를 호출
    super({
      clientID: configService.get('kakaoClientId'), // REST API 키
      clientSecret: configService.get('kakaoClientSecret'),
      callbackURL: 'http://localhost:3000/auth/oauth/kakao', // 카카오 OAuth 인증 후 실행되는 URL
      // scope: ['account_email', 'profile_nickname'], // 카카오 OAuth 인증시 요청하는 데이터
    });
  }

  // OAuth 인증이 끝나고 콜백URL을 실행하기 전 유저 신원 검증하는 메서드
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<UserModel> {
    const displayName = profile.displayName;
    const email = profile._json.kakao_account.email;
    const providerId = profile.id;
    console.log(profile);
    console.log('액세스 토큰', accessToken);
    console.log('리프레시 토큰', refreshToken);

    const user = await this.userService.findByEmailOrSave(
      email,
      displayName,
      providerId.toString(),
    );

    return user;
  }
}
