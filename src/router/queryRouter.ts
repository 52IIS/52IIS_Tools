//对外暴露配置路由(查询相关路由)
export const queryRoute = [
  //工具
  {
    path: '/ip',
    component: () => import('@/components/Tools/Ip/Ip.vue'),
    name: 'ip',
    meta: {
      title: "IP查询",
      keywords: 'ip,ip查询,ip地址查询,ip138,查ip,我的ip,公网ip,ip归属地查询',
      description: '公网ip地址归属地查询',
    }
  },
  {
    path: '/webinfo',
    component: () => import('@/components/Tools/WebInfo/WebInfo.vue'),
    name: 'webInfo',
    meta: {
      title: "网站favicon获取",
      keywords: '获取网站logo,获取网站icon,获取网站favicon,获取网站标题,获取网站关键词,获取网站描述',
      description: '获取网站logo、icon、favicon、标题、关键词、描述等信息',
    }
  },
]
