import { defineStore } from 'pinia';
import { TOKEN_NAME } from '@/config/global';
import { store, usePermissionStore, useTabsRouterStore } from '@/store';
import { login, userInfo } from '@/api/user';

const InitUserInfo = {
  id: '',
  username: '',
  code: '',
  mobile: '',
  avatar: '',
  nickname: '',
  introduction: '',
  permission: {
    resources: [],
    menus: [],
    btns: [],
  },
};

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_NAME) || 'main_token', // 默认token不走权限
    userInfo: InitUserInfo,
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.permission.menus;
    },
    btns: (state) => {
      return state.userInfo?.permission.btns;
    },
  },
  actions: {
    async login(userInfo: Record<string, unknown>) {
      const res = await login(userInfo);
      this.token = res.token;
    },
    async getUserInfo() {
      this.userInfo = await userInfo();
    },
    async logout() {
      localStorage.removeItem(TOKEN_NAME);
      this.token = '';
      this.userInfo = {
        id: '',
        username: '',
        code: '',
        mobile: '',
        avatar: '',
        nickname: '',
        introduction: '',
        permission: {
          resources: [],
          menus: [],
          btns: [],
        },
      };

      const tabsRouterStore = useTabsRouterStore();
      tabsRouterStore.removeTabRouterList();
    },
    async removeToken() {
      this.token = '';
    },
  },
  persist: {
    afterRestore: (ctx) => {
      if (ctx.store.roles && ctx.store.roles.length > 0) {
        const permissionStore = usePermissionStore();
        permissionStore.initRoutes(ctx.store.roles);
      }
    },
  },
});

export function getUserStore() {
  return useUserStore(store);
}
