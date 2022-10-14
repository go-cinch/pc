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
    ],
  },
];
