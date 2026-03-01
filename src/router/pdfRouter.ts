//对外暴露配置路由(其他路由)
export const pdfRoute = [
  //工具
   {
    path: '/pdf2img',
    component: () => import('@/components/Tools/Pdf2Img/Pdf2Img.vue'),
    name: 'Pdf2Img',
    meta: {
      title: "PDF转图片",
      keywords: 'PDF转图片,将PDF文档转换为图片',
      description: '将PDF文档转换为图片，支持批量转换',
    }
  },
  // 照片合并为PDF
  {
    path: '/img2pdf',
    component: () => import('@/components/Tools/Img2Pdf/Img2Pdf.vue'),
    name: 'Img2Pdf',
    meta: {
      title: "照片合并为PDF",
      keywords: '照片合并为PDF,将多张照片合并为一个PDF文档',
      description: '将多张照片合并为一个PDF文档',
    }
  },
  {
    path: '/pdfmerge',
    component: () => import('@/components/Tools/PdfMerge/PdfMerge.vue'),
    name: 'PdfMerge',
    meta: {
      title: "PDF合并",
      keywords: 'PDF合并,将多个PDF文档合并为一个PDF文档',
      description: '将多个PDF文档合并为一个PDF文档',
    }
  },
  // PDF压缩
  {
    path: '/pdfcompress',
    component: () => import('@/components/Tools/PdfCompress/PdfCompress.vue'),
    name: 'PdfCompress',
    meta: {
      title: "PDF压缩",
      keywords: 'PDF压缩,压缩PDF文档大小',
      description: '压缩PDF文档大小，支持批量压缩',
    }
  },
  // PDF长截图
  {
    path: '/pdflongshot',
    component: () => import('@/components/Tools/PdfLongShot/PdfLongShot.vue'),
    name: 'PdfLongShot',
    meta: {
      title: "PDF长截图",
      keywords: 'PDF长截图,将PDF文档转换为长截图',
      description: '将PDF文档转换为长截图，支持批量转换',
    }
  },
  // 删除或插入PDF文档的某一页
  {
    path: '/pdfpage',
    component: () => import('@/components/Tools/PdfPage/PdfPage.vue'),
    name: 'PdfPage',
    meta: {
      title: "PDF页面管理",
      keywords: 'PDF页面管理,（删除）或（插入）PDF文档的某一页',
      description: '（删除）或（插入）PDF文档的某一页',
    }
  },
]
