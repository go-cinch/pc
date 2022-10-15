import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'system',
    meta: { title: '系统', icon: 'setting' },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/pages/system/user/index.vue'),
        meta: { title: '用户' },
      },
      {
        path: 'group',
        name: 'SystemGroup',
        component: () => import('@/pages/system/user-group/index.vue'),
        meta: { title: '用户组' },
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/pages/system/role/index.vue'),
        meta: { title: '角色' },
      },
      {
        path: 'action',
        name: 'SystemAction',
        component: () => import('@/pages/system/action/index.vue'),
        meta: { title: '行为' },
      },
    ],
  },
];
