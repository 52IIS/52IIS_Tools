import { otherRoute } from './otherRouter'
//对外暴露配置路由(常量路由)
export const constantRoute = [
  //首页
  {
    path: '/',
    component: () => import('@/components/Home/Home.vue'),
    name: 'home',
    meta: {
      keywords: 'tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
      description: 'tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
    }
  },
 ...otherRoute,
  // 关于
  {
    path: '/about',
    component: () => import('@/components/Home/About.vue'),
    name: 'about',
    meta: {
      title: "关于",
      keywords: '关于ranblogs,关于工具站',
      description: '',
    }
  },
  //其他路由
  {
    path: '/404',
    component: () => import('@/components/404/404.vue'),
    name: '404',
    meta: {
      title: "404"
    }
  },
  {
    //重定向
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'Any',
  },
]
