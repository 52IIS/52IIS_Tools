//对外暴露配置路由(图表路由)
export const chartRoute = [
  //工具
  {
    path: '/bar',
    component: () => import('@/components/Tools/Chart/Bar/Bar.vue'),
    name: 'bar',
    meta: {
      title: "柱状图",
      keywords: '柱状图',
      description: '在线制作柱状图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/line',
    component: () => import('@/components/Tools/Chart/Line/Line.vue'),
    name: 'line',
    meta: {
      title: "折线图",
      keywords: '折线图',
      description: '在线制作折线图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/pie',
    component: () => import('@/components/Tools/Chart/Pie/Pie.vue'),
    name: 'pie',
    meta: {
      title: "饼图",
      keywords: '饼图',
      description: '在线制作饼图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  },
  {
    path: '/scatter',
    component: () => import('@/components/Tools/Chart/Scatter/Scatter.vue'),
    name: 'scatter',
    meta: {
      title: "散点图",
      keywords: '散点图',
      description: '在线制作散点图，像做表格一样制作可视化图表，支持导出静态或动态图表',
    }
  }
]
