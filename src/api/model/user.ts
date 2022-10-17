import { Page } from '@/api/page';

export interface UserLoginReply {
  code: number;
  reason: string;
  message: string;
  token: string;
  expires: string;
}

export interface UserCaptchaReply {
  captcha: {
    id: string;
    img: string;
  };
}

export interface UserStatusReply {
  captcha: {
    id: string;
    img: string;
  };
  locked: string;
  lockExpire: string;
}

export interface UserInfoReply {
  id: string;
  username: string;
  code: string;
  mobile: string;
  avatar: string;
  nickname: string;
  introduction: string;
  permission: {
    resources: Array<string>;
    menus: Array<string>;
    btns: Array<string>;
  };
}

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  code: string;
  mobile: string;
  status: string;
  locked: string;
  avatar: string;
  nickname: string;
  introduction: string;
  lastLogin: string;
  lockMsg: string;
}

export interface FindUserReply {
  page: Page;
  list: Array<User>;
}
