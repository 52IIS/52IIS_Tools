<div align="center">
  <pre>
   ██████   ████   ██████  ██████   ████           ██████   ████    ████   ██       ████   
██          ██    ██      ██    ██                ██    ██  ██  ██  ██  ██      ██      
█████    ████     ██      ██     ████             ██    ██  ██  ██  ██  ██       ████   
    ██  ██        ██      ██        ██            ██    ██  ██  ██  ██  ██          ██  
█████   ██████  ██████  ██████  ████    ██████    ██     ████    ████   ██████  ████                      
  </pre>
  <p> 只需简单几步，即可快速搭建属于自己的在线工具箱。</p>
  <p> 本项目基于 <a href="https://github.com/naroat/tools-web" target="_blank">tools-web</a> 进行二次修改创作。</p>
  <p> 本项目GitHub地址： <a href="https://github.com/52IIS/52IIS_Tools" target="_blank">https://github.com/52IIS/52IIS_Tools</a></p> 

[![node](https://img.shields.io/badge/any_text-18.14.2-red?label=node)](node)
[![vue](https://img.shields.io/badge/any_text-3.3.10-origin?label=vue)](vue)
[![tailwindcss](https://img.shields.io/badge/any_text-3.3.5-yellow?label=tailwindcss)](tailwindcss)
[![elementplus](https://img.shields.io/badge/any_text-2.7-blue?label=element-plus)](elementplus)
[![license](https://img.shields.io/github/license/52IIS/52IIS_Tools)](LICENSE)

</div>

## 目录

- [功能展览](#功能展览)
- [开始使用](#开始使用)
  - [手动部署](#手动部署)
- [工具列表](#工具列表)
- [其他](#其他)

## 功能展示

在线站点：<a href="https://www.52iis.com" target="_blank">52IIS Tools</a>

## 开始使用


### 手动部署

安装`pnpm`
```
npm install pnpm -g
```

克隆
```
git clone --depth=1 https://github.com/52IIS/52IIS_Tools.git
```

安装
```
# 进入项目
cd 52IIS_Tools

# 复制配置文件
cp .env.example .env.development

# 安装
pnpm install
```

启动
```
pnpm dev
```

打包
```
pnpm build
```

打包seo静态页面:复制`.env.development`文件，并将文件名修改为`.env.production`,将里面的`NODE_ENV`的值改为`productio`,然后运行下面打包命令
```
pnpm build:pro
```

## 工具列表

- 开发运维
  - 随机密码生成
  - URL编码/解码
  - UUID生成器
  - 时间戳转换
  - MD5在线加密/解密
  - Json在线转换
  - 正则测试工具
  - Unicode转中文
  - HTTP状态码
  - JWT解析
  - html实体转义
  - js代码格式化/压缩
  - Html代码格式化
  - Css代码格式化/压缩

- 文本处理
  - 文本对比
  - markdown编辑器
  - ASCII字形生成器
  - 文本去重
  - 在线文本编辑/HTML获取
  - 字数统计

- 教育学术
  - 单位换算
  - 摩斯电码
  - 常用进制转换
  - ASCII码表
  - 长度单位转换
  - 面积单位转换
  - 重量单位转换
  - 时间单位转换
  - 温度单位转换
  - 压力单位转换
  - 热量单位转换
  - 功率单位转换

- 图片处理
  - 二维码生成
  - 在线图片处理
  - 文本转图片
  - 图片分割

- 数据图表
  - 柱状图
  - 折线图
  - 饼图
  - 散点图

- 选择随机
  - 生成随机数
  - 帮我决定
  - 抛硬币
  - 投骰子

- 其他工具
  - 数字转金额大写
  - 手持弹幕
  - 色板
  - Color选择器
  - M3U8视频播放器
  - PDF转图片
  - Favicon在线制作
  - ASCII艺术字生成器

## 其他

Q: 我应该如何添加新功能？

A: 
  - 在`menu/tools.ts`文件中添加工具信息
  - 在`router/router.ts`中添加路由
  - 拷贝示例目录`components/Tools/Example`修改名称，在这个拷贝出来的目录中开发工具即可

<br/>  