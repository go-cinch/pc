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
}
