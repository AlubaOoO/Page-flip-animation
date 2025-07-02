<template>
  <div id="book" ref="bookElement" :class="{ 'book-opened': isBookOpened }">
    <div v-if="isBookOpened" class="page-stack-left">
      <div class="layer layer-3"></div>
      <div class="layer layer-4"></div>
    </div>
    <div v-if="isBookOpened" class="page-stack-right">
      <div class="layer layer-3"></div>
      <div class="layer layer-4"></div>
    </div>
    <div class="page cover">story</div>
    <div class="page toc">
      <h2>目录</h2>
      <div
        v-for="(section, index) in tableOfContents"
        :key="index"
        class="toc-item"
      >
        <span class="toc-title">{{ section.title }}</span>
        <span class="toc-page">{{ section.page }}</span>
      </div>
    </div>
    <div
      v-for="(page, index) in pages"
      :key="index"
      class="page content-page"
    >
      <div class="page-content" v-html="page" :style="{ fontSize: `${fontSize}px` }"></div>
    </div>
    <div class="page back-cover">thanks</div>
  </div>
</template>

<script>
import { initTurnJS, cleanupTurnJS } from '../../utils/turnJSUtils';

export default {
  name: 'BookContent',
  props: {
    pages: {
      type: Array,
      required: true
    },
    tableOfContents: {
      type: Array,
      required: true
    },
    fontSize: {
      type: Number,
      default: 16
    }
  },
  data() {
    return {
      turnInstance: null,
      currentPage: 1,
      isBookOpened: false
    };
  },
  computed: {
    totalPages() {
      // 封面、目录、内容、封底的总页数
      return 2 + this.pages.length + 1;
    }
  },
  watch: {
    pages: {
      handler() {
        this.$nextTick(() => {
          setTimeout(() => {
            this.reinitializeTurnJS();
          }, 2000);
        });
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeTurnJS();
    });
  },
  beforeUnmount() {
    this.cleanupTurnJS();
  },
  methods: {
    initializeTurnJS() {
      const callbacks = {
        turning: (e, page) => {
          try {
            this.currentPage = page;
            this.isBookOpened = page > 1;
            this.$emit('page-change', page);
          } catch (err) {
            console.error("Error in turning event:", err);
          }
        },
        turned: (e, page) => {
          try {
            this.currentPage = page;
            this.isBookOpened = page > 1;
            this.$emit('page-turned', page);
          } catch (err) {
            console.error("Error in turned event:", err);
          }
        },
        start: (e, pageObject) => {
          // 页面开始翻页时的回调
          if (pageObject.page > 1) {
            this.isBookOpened = true;
          }
        }
      };
      
      // 延迟初始化，确保DOM已更新
      setTimeout(() => {
        this.turnInstance = initTurnJS(this.$refs.bookElement, callbacks);
      }, 300);
    },
    
    reinitializeTurnJS() {
      try {
        window.$(this.$refs.bookElement).turn('resize')
      } catch (err) {
        console.error("Error in reinitializeTurnJS:", err);
      }
    },
    
    cleanupTurnJS() {
      if (this.turnInstance) {
        cleanupTurnJS(this.$refs.bookElement);
        this.turnInstance = null;
      }
    },
    
    prevPage() {
      if (this.turnInstance) {
        window.$(this.$refs.bookElement).turn("previous");
      }
    },
    
    nextPage() {
      if (this.turnInstance) {
        window.$(this.$refs.bookElement).turn("next");
      }
    },
    
    goToPage(pageNumber) {
      if (this.turnInstance && window.$) {
        try {
          window.$(this.$refs.bookElement).turn("page", pageNumber);
        } catch (err) {
          console.error("Error navigating to page:", err);
        }
      }
    }
  }
}
</script>

<style>
#book {
  width: 800px;
  height: 500px;
  position: relative;
  perspective: 1500px;
  margin-bottom: 20px;
  overflow-y: clip;
}

/* 书本左侧的堆叠书页效果 - 只在书本打开时显示 */
#book.book-opened .page-stack-left {
  content: '';
  position: absolute;
  bottom: 0;
  left: -20px;
  width: 20px;
  height: 500px;
  background: linear-gradient(to right, var(--stack-edge-color1), var(--stack-edge-color2));
  box-shadow: -2px 0 5px var(--shadow-color);
  z-index: -2;
  border-left: 1px solid var(--border-color);
  border-radius: 2px 0 0 2px;
}

/* 书本右侧的堆叠书页效果 - 只在书本打开时显示 */
#book.book-opened .page-stack-right {
  content: '';
  position: absolute;
  bottom: 0;
  right: -20px;
  width: 20px;
  height: 500px;
  background: linear-gradient(to left, var(--stack-edge-color1), var(--stack-edge-color2));
  box-shadow: 2px 0 5px var(--shadow-color);
  z-index: -2;
  border-right: 1px solid var(--border-color);
  border-radius: 0 2px 2px 0;
}

/* 多层堆叠效果 - 左侧 */
#book.book-opened .page-stack-left::before,
#book.book-opened .page-stack-left::after,
#book.book-opened .page-stack-left .layer {
  content: '';
  position: absolute;
  top: 0;
  left: -3px;
  width: 100%;
  height: 100%;
  background: var(--stack-layer1);
  z-index: -1;
  border-left: 1px solid var(--border-color);
  border-radius: 2px 0 0 2px;
}

#book.book-opened .page-stack-left::after {
  background: var(--stack-layer2);
  left: -6px;
  z-index: -2;
}

/* 多层堆叠效果 - 右侧 */
#book.book-opened .page-stack-right::before,
#book.book-opened .page-stack-right::after,
#book.book-opened .page-stack-right .layer {
  content: '';
  position: absolute;
  top: 0;
  right: -3px;
  width: 100%;
  height: 100%;
  background: var(--stack-layer1);
  z-index: -1;
  border-right: 1px solid var(--border-color);
  border-radius: 0 2px 2px 0;
}

#book.book-opened .page-stack-right::after {
  background: var(--stack-layer2);
  right: -6px;
  z-index: -2;
}

/* 第3层和第4层堆叠 - 左侧 */
#book.book-opened .page-stack-left .layer-3 {
  background: var(--stack-layer3);
  left: -9px;
  z-index: -3;
}

#book.book-opened .page-stack-left .layer-4 {
  background: var(--stack-layer4);
  left: -12px;
  z-index: -4;
}

/* 第3层和第4层堆叠 - 右侧 */
#book.book-opened .page-stack-right .layer-3 {
  background: var(--stack-layer3);
  right: -9px;
  z-index: -3;
}

#book.book-opened .page-stack-right .layer-4 {
  background: var(--stack-layer4);
  right: -12px;
  z-index: -4;
}

/* 默认情况下不显示阴影 */
#book::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 100%;
}

/* 只有当书本打开时才显示阴影 */
#book.book-opened::after {
  background: linear-gradient(to right, 
    rgba(0, 0, 0, 0.00) 0%, 
    var(--shadow-color) 48%, 
    var(--shadow-color) 52%, 
    rgba(0, 0, 0, 0.00) 100%);
  z-index: 15;
}

.page {
  background: var(--bg-gradient);
  border: 1px solid var(--border-color);
  width: 400px;
  height: 500px;
  box-sizing: border-box;
  user-select: none;
  overflow: hidden;
  color: var(--text-color);
}

.cover,
.back-cover {
  background: var(--cover-bg);
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  line-height: 500px;
}

.toc {
  font-size: 16px;
  background: var(--bg-gradient);
}

.toc h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
}

.toc-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px dotted var(--border-color);
}

.content-page {
  font-size: 16px;
  line-height: 1.5;
  text-align: left;
  overflow: hidden;
}

.page-content {
  height: 100%;
  padding: 20px;
  overflow: hidden;
}

.page-content h2 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color);
}

.page-content p {
  position: relative;
  margin-bottom: 15px;
}

.page-content p img {
  width: 100%;
  height: auto;
}

.source-card {
  width: 100%;
}

.source-card img {
  width: 100%;
  height: auto;
}
</style> 