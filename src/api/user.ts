import { request } from '@/utils/request';
import { UserCaptchaReply, UserInfoReply, UserLoginReply, UserStatusReply } from '@/api/model/user';

const Api = {
  UserLogin: '/auth/login',
  UserCaptcha: '/auth/captcha',
  UserStatus: '/auth/status',
  UserInfo: '/auth/info',
};

export function login(data) {
  return request.post<UserLoginReply>({
    url: Api.UserLogin,
    data,
  });
}

export function captcha() {
  return request.get<UserCaptchaReply>({
    url: Api.UserCaptcha,
  });
}

export function userStatus(params) {
  return request.get<UserStatusReply>({
    url: Api.UserStatus,
    params,
  });
}

export function userInfo() {
  return request.get<UserInfoReply>({
    url: Api.UserInfo,
  });
}
