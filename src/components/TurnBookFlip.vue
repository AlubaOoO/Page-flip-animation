<template>
  <div class="turn-book-container" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 右侧工具栏 -->
    <book-toolbar 
      :is-dark-theme="isDarkTheme" 
      :font-size="fontSize"
      @theme-change="changeTheme"
      @font-size-input="onFontSizeInput"
      @font-size-change="onFontSizeChange"
      @font-size-debounced="updateFontSize"
    />

    <!-- 书本内容 -->
    <book-content 
      ref="bookContent"
      :pages="pages"
      :table-of-contents="tableOfContents"
      :font-size="fontSize"
      @page-change="onPageChange"
    />

    <!-- 控制按钮 -->
    <book-controls 
      :current-page="currentPage"
      :total-pages="totalPages"
      @prev-page="prevPage"
      @next-page="nextPage"
    />

    <!-- 用于测试内容高度的隐藏容器 -->
    <div ref="testContainer" class="test-container"></div>
  </div>
</template>

<script>
import { testData } from "./testData.js";
import { BOOK_CONFIG } from '../utils/constants';
import { loadSettings, saveSettings } from '../utils/storageUtils';
import { processBookContent } from '../services/bookService';
import BookToolbar from './components/BookToolbar.vue';
import BookContent from './components/BookContent.vue';
import BookControls from './components/BookControls.vue';

export default {
  name: "TurnBookFlip",
  components: {
    BookToolbar,
    BookContent,
    BookControls
  },
  data() {
    return {
      currentPage: 1,
      totalPages: 0,
      content: "",
      pages: [],
      tableOfContents: [],
      sections: [],
      isBookOpened: false,
      // 主题和字体大小设置
      isDarkTheme: false,
      fontSize: 16,
      // 字体调整状态
      fontSizeDebounceTimer: null,
      isFontSizeAdjusting: false,
      fontSizePending: false,
      processingUpdate: false,
    };
  },
  computed: {
    // 封面、目录、内容、封底的总页数
    totalPageCount() {
      return 2 + this.pages.length + 1;
    }
  },
  mounted() {
    this.initializeBook();
    // 加载本地存储的主题和字体设置
    this.loadUserSettings();
  },
  beforeUnmount() {
    // 清理可能存在的定时器
    if (this.fontSizeDebounceTimer) {
      clearTimeout(this.fontSizeDebounceTimer);
    }
  },
  methods: {
    /**
     * 初始化电子书
     */
    initializeBook() {
      this.$nextTick(() => {
        // 加载和处理内容
        const { pages, tableOfContents } = processBookContent(
          testData, 
          this.$refs.testContainer, 
          this.fontSize
        );
        
        // 更新数据
        this.pages = pages;
        this.tableOfContents = tableOfContents;
        this.totalPages = this.totalPageCount;
      });
    },

    /**
     * 加载用户设置
     */
    loadUserSettings() {
      const settings = loadSettings();
      this.isDarkTheme = settings.isDarkTheme;
      this.fontSize = settings.fontSize;
    },

    /**
     * 切换主题
     */
    changeTheme(isDark) {
      this.isDarkTheme = isDark;
      saveSettings({ 
        isDarkTheme: this.isDarkTheme, 
        fontSize: this.fontSize 
      });
    },

    /**
     * 处理字体大小滑块拖动事件
     */
    onFontSizeInput(size) {
      this.fontSize = size;
      this.isFontSizeAdjusting = true;
      
      // 如果存在上一个定时器，取消它
      if (this.fontSizeDebounceTimer) {
        clearTimeout(this.fontSizeDebounceTimer);
      }
    },
    
    /**
     * 处理字体大小滑块拖动结束事件
     */
    onFontSizeChange(size) {
      this.fontSize = size;
      
      // 保存设置
      saveSettings({ 
        isDarkTheme: this.isDarkTheme, 
        fontSize: this.fontSize 
      });
      
      // 防抖处理，避免频繁重新计算
      this.fontSizePending = true;
      
      if (this.fontSizeDebounceTimer) {
        clearTimeout(this.fontSizeDebounceTimer);
      }
      
      this.fontSizeDebounceTimer = setTimeout(() => {
        if (!this.processingUpdate) {
          this.updateFontSize();
        } else {
          // 如果当前正在处理更新，设置为挂起状态
          this.fontSizePending = true;
        }
      }, BOOK_CONFIG.debounceDuration);
    },

    /**
     * 更新字体大小
     */
    updateFontSize() {
      // 防止重复执行
      if (this.processingUpdate) {
        return;
      }
      
      this.processingUpdate = true;
      this.fontSizePending = false;
      
      // 如果内容已加载，需要重新计算分页
      try {
        // 重新计算分页
        const { pages, tableOfContents } = processBookContent(
          testData, 
          this.$refs.testContainer, 
          this.fontSize
        );
        
        // 更新数据
        this.pages = pages;
        this.tableOfContents = tableOfContents;
        this.totalPages = this.totalPageCount;
        
        this.processingUpdate = false;
        
        // 检查是否有挂起的更新
        if (this.fontSizePending) {
          this.$nextTick(() => {
            this.updateFontSize();
          });
        }
      } catch (err) {
        console.error("Error updating font size:", err);
        this.processingUpdate = false;
      }
    },

    /**
     * 页面变化处理
     */
    onPageChange(page) {
      this.currentPage = page;
      this.isBookOpened = page > 1;
    },

    /**
     * 翻到上一页
     */
    prevPage() {
      this.$refs.bookContent.prevPage();
    },

    /**
     * 翻到下一页
     */
    nextPage() {
      this.$refs.bookContent.nextPage();
    }
  },
};
</script>

<style>
@import '../assets/bookTheme.css';
</style>
