<template>
  <div class="book-container">
    <div class="control-panel">
      <button @click="prevPage" :disabled="currentPage === 0">上一页</button>
      <span>页码: {{ currentPage + 1 }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages - 1">下一页</button>
    </div>
    
    <div ref="bookRef" class="flip-book">
      <!-- 封面 -->
      <div class="page cover" data-density="hard">
        <h1>{{ bookTitle }}</h1>
        <div class="cover-image" v-if="coverImage">
          <img :src="coverImage" alt="封面图片" />
        </div>
      </div>
      
      <!-- 目录页 -->
      <div class="page toc-page">
        <h2>目录</h2>
        <div v-for="(section, index) in tableOfContents" :key="index" class="toc-item">
          <span class="toc-title">{{ section.title }}</span>
          <span class="toc-page" @click="goToPage(section.page)">第{{ section.page }}页</span>
        </div>
      </div>
      
      <!-- 内容页 -->
      <div v-for="(page, index) in pages" :key="index" class="page content-page">
        <div class="page-content" v-html="page" :style="{ fontSize: `${fontSize}px` }"></div>
      </div>
      
      <!-- 封底 -->
      <div class="page back-cover" data-density="hard">
        <h2>谢谢阅读</h2>
      </div>
    </div>
  </div>
</template>

<script>
import { PageFlip } from 'page-flip';

export default {
  name: 'StPageFlipBook',
  props: {
    pages: {
      type: Array,
      required: true,
      default: () => []
    },
    tableOfContents: {
      type: Array,
      default: () => []
    },
    fontSize: {
      type: Number,
      default: 16
    },
    bookTitle: {
      type: String,
      default: '我的书'
    },
    coverImage: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      flipBook: null,
      currentPage: 0,
      totalPages: 0
    };
  },
  
  mounted() {
    this.$nextTick(() => {
      this.initFlipBook();
      window.addEventListener('resize', this.handleResize);
    });
  },
  
  beforeUnmount() {
    if (this.flipBook) {
      this.flipBook.destroy();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  
  watch: {
    pages() {
      // 页面内容变化时重新初始化
      this.$nextTick(() => {
        if (this.flipBook) {
          this.flipBook.destroy();
        }
        this.initFlipBook();
      });
    }
  },
  
  methods: {
    initFlipBook() {
      // 确保元素已经挂载
      if (!this.$refs.bookRef) {
        return;
      }

      // 创建 PageFlip 实例
      this.flipBook = new PageFlip(this.$refs.bookRef, {
        width: 400,         // 单页宽度
        height: 500,        // 页面高度
        size: 'fixed',      // 可选: fixed, stretch
        minWidth: 200,      // 最小宽度
        maxWidth: 800,      // 最大宽度
        minHeight: 250,     // 最小高度
        maxHeight: 1000,    // 最大高度
        drawShadow: true,   // 绘制阴影
        maxShadowOpacity: 0.5, // 最大阴影不透明度
        flippingTime: 1000, // 翻页动画持续时间（毫秒）
        usePortrait: false,  // 禁用纵向模式，强制使用横向（双页）模式
        startPage: 0,       // 起始页
        autoSize: true,     // 自动调整大小
        showCover: true,    // 启用封面模式，第一页和最后一页将单独显示
        clickEventForward: true, // 转发点击事件到页面中的元素
        mobileScrollSupport: true // 在移动设备上支持滚动
      });

      // 加载页面内容
      this.flipBook.loadFromHTML(this.$refs.bookRef.querySelectorAll('.page'));

      // 更新总页数
      this.totalPages = 2 + this.pages.length + 1; // 封面 + 目录 + 内容页 + 封底
      
      // 绑定事件
      this.flipBook.on('flip', (e) => {
        this.currentPage = e.data;
        this.$emit('page-change', e.data);
      });
      
      this.flipBook.on('changeState', (e) => {
        this.$emit('state-change', e.data);
      });
      
      // 初始化完成后触发事件
      this.$emit('book-ready', this.flipBook);
    },
    
    prevPage() {
      if (this.flipBook) {
        this.flipBook.flipPrev('bottom');
      }
    },
    
    nextPage() {
      if (this.flipBook) {
        this.flipBook.flipNext('bottom');
      }
    },
    
    goToPage(pageNumber) {
      if (this.flipBook) {
        this.flipBook.flip(pageNumber, 'bottom');
      }
    },
    
    handleResize() {
      if (this.flipBook) {
        // updateFromRect 在 PageFlip 中不存在
        // 使用底层 resize 事件处理
        try {
          // 尝试调整大小
          window.setTimeout(() => {
            const currentPage = this.flipBook.getCurrentPageIndex();
            this.flipBook.destroy();
            this.initFlipBook();
            this.flipBook.turnToPage(currentPage);
          }, 100);
        } catch (err) {
          console.error("Error handling resize:", err);
        }
      }
    }
  }
};
</script>

<style scoped>
.book-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.control-panel {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 800px;
  justify-content: center;
}

.control-panel button {
  padding: 8px 16px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-panel button:hover {
  background-color: #2d3748;
}

.control-panel button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.flip-book {
  width: 800px;
  height: 500px;
  margin: 0 auto;
}

.page {
  background: #f8f8f8;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.cover, .back-cover {
  background: linear-gradient(to right bottom, #3182ce, #2b6cb0);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  font-weight: bold;
}

.cover h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.back-cover h2 {
  font-size: 28px;
}

.cover-image {
  max-width: 80%;
  max-height: 60%;
  margin: 20px 0;
}

.cover-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.toc-page {
  padding: 30px;
}

.toc-page h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #2d3748;
}

.toc-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px dotted #cbd5e0;
}

.toc-page .toc-title {
  font-weight: bold;
  color: #2d3748;
}

.toc-page .toc-page {
  color: #4299e1;
  cursor: pointer;
  text-decoration: underline;
}

.content-page {
  line-height: 1.6;
  color: #2d3748;
}

.page-content {
  height: 100%;
  overflow: hidden;
}

.page-content h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #2d3748;
}

.page-content p {
  margin-bottom: 15px;
}

.page-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}
</style> 