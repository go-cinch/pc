<template>
  <t-form
    ref="form"
    :class="['item-container', `login-${type}`]"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <template v-if="type == 'password'">
      <t-form-item name="username">
        <t-input
          v-model="formData.username"
          size="large"
          placeholder="请输入用户名"
          clearable
          @focus="saveOldUsername"
          @blur="getUserStatus"
        >
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item name="password">
        <t-input
          v-model="formData.password"
          size="large"
          :type="showPsw ? 'text' : 'password'"
          clearable
          placeholder="请输入密码"
        >
          <template #prefix-icon>
            <t-icon name="lock-on" />
          </template>
          <template #suffix-icon>
            <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
          </template>
        </t-input>
      </t-form-item>

      <!-- 需要验证码 -->
      <t-form-item v-if="showCaptcha" name="captchaAnswer">
        <t-input v-model="formData.captchaAnswer" size="large" placeholder="请输入验证码">
          <template #prefix-icon>
            <t-icon name="secured" />
          </template>
        </t-input>
        <t-image :src="captchaImg" :style="{ height: '40px', background: '#d9d9d9' }" @click="refreshCaptcha" />
      </t-form-item>

      <div class="check-container remember-pwd">
        <t-checkbox>记住账号</t-checkbox>
        <span class="tip">忘记账号？</span>
      </div>
    </template>

    <t-form-item v-if="type !== 'qrcode'" class="btn-container">
      <t-button v-if="disableLogin" block size="large" theme="default" :disabled="disableLogin"> 账户已锁定 </t-button>
      <t-button v-else block size="large" type="submit"> 登录 </t-button>
    </t-form-item>

    <div class="switch-container">
      <span v-if="type !== 'password'" class="tip" @click="switchType('password')">使用账号密码登录</span>
    </div>
  </t-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { FormInstanceFunctions, MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store';
import { captcha, userStatus } from '@/api/user';

const userStore = useUserStore();

const INITIAL_DATA = {
  username: 'admin',
  password: '123456',
  checked: false,
  captchaId: '',
  captchaAnswer: '',
};

const FORM_RULES = {
  phone: [{ required: true, message: '手机号必填', type: 'error' }],
  username: [{ required: true, message: '用户名必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  captchaAnswer: [{ required: true, message: '验证码必填', type: 'error' }],
};

const type = ref('password');

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const oldUsername = ref('');
const showPsw = ref(false);
const showCaptcha = ref(false);
const captchaImg = ref('');
const disableLogin = ref(false);

const switchType = (val: string) => {
  type.value = val;
};

const router = useRouter();

const onSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    try {
      await userStore.login(formData.value);

      MessagePlugin.success('登陆成功');
      router.push({
        path: '/dashboard/base',
      });
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        if (e.response.data.message === 'invalid captcha') {
          await getUserStatus();
          MessagePlugin.error('验证码过期');
        } else {
          MessagePlugin.error(e.response.data.message);
        }
      }
      await refreshCaptcha();
    }
  }
};

const saveOldUsername = async () => {
  oldUsername.value = formData.value.username;
};

const getUserStatus = async () => {
  if (oldUsername.value === formData.value.username) {
    return;
  }
  if (formData.value.username.length < 5) {
    return;
  }
  try {
    const data = await userStatus({ username: formData.value.username });
    if (data.captcha) {
      if (data.captcha.id !== '') {
        showCaptcha.value = true;
      } else {
        showCaptcha.value = false;
      }
      formData.value.captchaId = data.captcha.id;
      captchaImg.value = data.captcha.img;
    } else {
      showCaptcha.value = false;
    }
    if (data.locked === '1') {
      disableLogin.value = true;
    } else {
      disableLogin.value = false;
    }
  } finally {
  }
};
const refreshCaptcha = async () => {
  if (!showCaptcha.value) {
    return;
  }
  try {
    const data = await captcha();
    if (data.captcha) {
      if (data.captcha.id !== '') {
        showCaptcha.value = true;
      } else {
        showCaptcha.value = false;
      }
      formData.value.captchaId = data.captcha.id;
      captchaImg.value = data.captcha.img;
    } else {
      showCaptcha.value = false;
    }
  } finally {
  }
};
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
