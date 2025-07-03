<template>
  <div class="book-example">
    <h1>翻页书本示例</h1>
    <div class="options">
      <label>
        字体大小:
        <input type="range" v-model.number="fontSize" min="12" max="24" />
        {{ fontSize }}px
      </label>
    </div>
    
    <StPageFlipBook
      :pages="bookPages"
      :tableOfContents="tableOfContents"
      :fontSize="fontSize"
      :bookTitle="bookTitle"
      :coverImage="coverImage"
      @page-change="handlePageChange"
      @book-ready="handleBookReady"
    />
  </div>
</template>

<script>
import StPageFlipBook from './StPageFlipBook.vue';

export default {
  name: 'StPageFlipExample',
  components: {
    StPageFlipBook
  },
  data() {
    return {
      fontSize: 16,
      bookTitle: '翻页书本示例',
      coverImage: null, // 可以设置为您的封面图片URL
      bookPages: [
        '<h2>第一章</h2><p>这是第一章的内容。您可以在这里放入任何 HTML 内容，包括文本、图片、表格等。</p><p>StPageFlip 库提供了一个非常逼真的翻页效果，可以模拟实体书籍的翻页体验。</p>',
        '<p>这是第一章的第二页。每个页面可以包含不同的内容，并且可以通过点击页面边缘或使用按钮来翻页。</p><p>您可以自定义书本的外观，包括页面大小、颜色、字体等。</p>',
        '<h2>第二章</h2><p>第二章开始了。StPageFlip 支持响应式设计，可以适应不同屏幕大小的设备。</p><p>您可以轻松地通过拖动页面角来翻页，就像翻阅真正的书本一样。</p>',
        '<p>这是第二章的第二页。StPageFlip 提供了许多自定义选项，例如页面翻转动画时间、阴影效果等。</p><p>您还可以通过编程方式控制书本的行为，如跳转到特定页面、前进、后退等。</p>',
        '<h2>第三章</h2><p>第三章内容。这个库不仅适用于电子书，还可以用于产品目录、相册、杂志等各种需要翻页效果的场景。</p><p>它的性能很好，即使在移动设备上也能流畅运行。</p>',
        '<p>这是最后一页。您可以在这里放置总结、联系信息或其他结束内容。</p><p>希望这个示例能帮助您理解如何使用 StPageFlip 库来创建引人注目的翻页效果！</p>'
      ],
      tableOfContents: [
        { title: '第一章', page: 2 },
        { title: '第二章', page: 4 },
        { title: '第三章', page: 6 }
      ]
    };
  },
  methods: {
    handlePageChange(pageNumber) {
      console.log('当前页码:', pageNumber);
    },
    handleBookReady(flipBook) {
      console.log('书本已准备好:', flipBook);
    }
  }
};
</script>

<style scoped>
.book-example {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 32px;
  margin-bottom: 20px;
  text-align: center;
  color: #2d3748;
}

.options {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

input[type="range"] {
  width: 100px;
}
</style> 