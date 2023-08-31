import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { KakaoAuthGuard, AuthenticatedGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  /* 카카오 로그인으로 이동하는 라우터 메소드 */
  @Get('oauth/to-kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuth(@Request() req) {}

  /* request 값을 받아서 화면에 보여주는 역할 */
  @Get('oauth/kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuthRedirect(@Request() req, @Response() res) {
    const { user } = req;
    return res.send(user);
  }

  /* 로그인 된 때만 실행 가능한 메서드로 로그인 된 유저 정보 반환. 로그인 테스트 용. */
  @UseGuards(AuthenticatedGuard)
  @Get('test-guard')
  testGuardWithSession(@Request() req) {
    return req.user;
  }
}
