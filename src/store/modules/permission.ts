import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';
import router, { asyncRouterList } from '@/router';
import { store } from '@/store';

function filterPermissionsRouters(routes: Array<RouteRecordRaw>, roles: Array<unknown>) {
  const res = [];
  const removeRoutes = [];
  routes.forEach((route) => {
    const children = [];
    route.children?.forEach((childRouter) => {
      const menu = `${route.path}/${childRouter.path}`;
      if (roles.indexOf('*') !== -1 || roles.indexOf(menu) !== -1) {
        children.push(childRouter);
      } else {
        removeRoutes.push({
          parent: route,
          child: childRouter,
        });
      }
    });
    if (children.length > 0) {
      route.children = children;
      res.push(route);
    }
  });
  return { accessedRouters: res, removeRoutes };
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: [],
    removeRoutes: [],
  }),
  actions: {
    async initRoutes(roles: Array<unknown>) {
      let accessedRouters = [];

      let removeRoutes = [];

      // special token
      if (roles.includes('*')) {
        accessedRouters = asyncRouterList;
      } else {
        const res = filterPermissionsRouters(asyncRouterList, roles);
        accessedRouters = res.accessedRouters;
        removeRoutes = res.removeRoutes;
      }

      this.routers = accessedRouters;
      this.removeRoutes = removeRoutes;

      removeRoutes.forEach((item) => {
        if (router.hasRoute(item.child.name)) {
          router.removeRoute(item.child.name);
        }
      });
    },
    async restore() {
      this.removeRoutes.forEach((item) => {
        router.addRoute(item.parent.name, item.child);
      });
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
