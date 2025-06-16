# Vue 书本翻页动画 (Vue Book Page Flip Animation)

这个项目使用 Vue.js 3 和 Turn.js 实现了一个交互式的书本翻页动画效果，具有左右双页布局，模拟真实的书本翻页体验。

## 功能特点

- 左右双页布局，模拟真实书本
- 平滑的3D翻页动画效果
- 支持前进和后退翻页
- 完全响应式设计
- 简洁直观的用户界面
- 适用于电子书、产品目录、在线杂志等

## 项目设置

### 安装依赖
```
yarn install
```

### 开发模式运行
```
yarn serve
```

### 编译生产版本
```
yarn build
```

### 自定义配置
请参考 [Vue CLI配置参考](https://cli.vuejs.org/config/).

## 使用方法

1. 运行项目后，您将看到一个模拟书本的界面，左右两页显示不同的内容
2. 使用"上一页"和"下一页"按钮进行翻页操作
3. 翻页时会有平滑的3D翻页动画
4. 也可以直接点击页面右下角进行翻页

## 自定义内容

要自定义书本内容，请修改 `src/components/TurnBookFlip.vue` 文件中的页面内容：

```html
<div id="book" ref="turnBook">
  <div class="page">封面</div>
  <div class="page">目录</div>
  <div class="page">第 1 页</div>
  <div class="page">第 2 页</div>
  <!-- 添加更多页面... -->
</div>
```

每个 `<div class="page">` 元素可以包含任何HTML内容，包括文本、图片、表格等。

## 技术实现

该项目使用了以下技术：

- Vue.js 3
- Turn.js 库实现书本翻页效果
- jQuery (Turn.js的依赖)
- CSS 3D转换和动画
- Flexbox布局

## 项目结构

```
src/
├── components/
│   └── TurnBookFlip.vue   # 书本翻页组件
├── App.vue                # 主应用组件
└── main.js               # 应用入口文件
```

## 依赖说明

- Turn.js 和 jQuery 通过 CDN 引入：
  ```html
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/blasten/turn.js@master/turn.js"></script>
  ```

## 许可

MIT
