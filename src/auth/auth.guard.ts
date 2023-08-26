import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 로그인 후 인증이 되었는지 확인할 때 사용
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated(); // 세션에서 정보를 읽어옴(deserializeUser 호출)
  }
}

@Injectable()
// AuthGuard 상속 & 카카오 OAuth 스트래티지 이용
export class KakaoAuthGuard extends AuthGuard('kakao') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean; // 카카오 스트래티지 실행. 내부적으로 KakaoOauthStrategy의 validate 메소드가 호출
    const request = context.switchToHttp().getRequest();
    await super.logIn(request); // 세션 저장(serializeUser 호출)
    return result;
  }
}
