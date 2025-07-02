<template>
  <div class="turn-book-container">
    <div id="book" ref="turnBook" :class="{ 'book-opened': isBookOpened }">
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
        <div class="page-content" v-html="page"></div>
      </div>
      <div class="page back-cover">thanks</div>
    </div>

    <div class="controls">
      <button @click="prevPage">上一页</button>
      <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">下一页</button>
    </div>

    <!-- 用于测试内容高度的隐藏容器 -->
    <div ref="testContainer" class="test-container"></div>
  </div>
</template>

<script>
import { testData } from "./testData.js";

// 书本配置常量
const BOOK_CONFIG = {
  width: 800,
  height: 500,
  pageWidth: 350,     // 页面内容宽度
  pageHeight: 460,    // 页面内容高度（减去边距）
  fontSizePx: 16,
  lineHeight: 1.5,
  padding: 20,
  animationDuration: 600, // 翻页动画持续时间
};

// 分页断句符号列表
const NATURAL_BREAKS = [
  "。", "，", "！", "？", "；", "：", " ", ")", "）", "》", "\u201D",
  ".", ",", "!", "?", ";", ":", " ", ">", '"',
];

export default {
  name: "TurnBookFlip",
  data() {
    return {
      currentPage: 1,
      totalPages: 0,
      turnInstance: null,
      content: "",
      pages: [],
      tableOfContents: [],
      sections: [],
      isBookOpened: false,
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
  },
  beforeUnmount() {
    this.cleanupTurnJS();
  },
  methods: {
    /**
     * 初始化电子书
     */
    initializeBook() {
      this.$nextTick(() => {
        // 处理内容
        this.content = this.convertImg(testData);
        
        // 解析内容和分页
        this.extractSections();
        this.calculatePages();
        this.generateTableOfContents();

        // 延迟初始化turn.js以确保DOM已更新
        setTimeout(() => {
          this.initTurnJS();
        }, 300);
      });
    },

    /**
     * 清理turn.js实例
     */
    cleanupTurnJS() {
      if (this.turnInstance && this.$refs.turnBook) {
        window.$(this.$refs.turnBook).turn("destroy");
        this.turnInstance = null;
      }
    },

    /**
     * 提取章节信息
     */
    extractSections() {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = this.content;
      const text = tempDiv.innerHTML;
      
      // 按段落分割
      const paragraphs = text.split("<br><br>");
      
      // 提取章节
      this.sections = [];
      let currentSection = { title: "", content: [] };

      paragraphs.forEach((paragraph) => {
        currentSection.content.push(paragraph);
      });

      // 添加最后一个章节
      if (currentSection.content.length > 0) {
        this.sections.push(currentSection);
      }
    },

    /**
     * 计算分页
     */
    calculatePages() {
      // 设置测试容器
      this.setupTestContainer();
      
      // 计算每页的内容
      this.pages = [];
      
      // 解析原始内容为DOM元素，以便更精确计算
      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = this.content;
      const allParagraphs = this.extractParagraphs(contentDiv);

      // 分页处理
      this.paginateContent(allParagraphs);
      
      // 更新总页数
      this.totalPages = this.totalPageCount;
    },

    /**
     * 设置用于测试内容高度的容器
     */
    setupTestContainer() {
      const testContainer = this.$refs.testContainer;
      Object.assign(testContainer.style, {
        width: `${BOOK_CONFIG.pageWidth}px`,
        height: "auto",
        visibility: "hidden",
        position: "absolute",
        fontSize: `${BOOK_CONFIG.fontSizePx}px`,
        lineHeight: String(BOOK_CONFIG.lineHeight),
        padding: `${BOOK_CONFIG.padding}px`,
        boxSizing: "border-box",
      });
    },

    /**
     * 分页处理内容
     * @param {Array} paragraphs - 段落数组
     */
    paginateContent(paragraphs) {
      const testContainer = this.$refs.testContainer;
      const maxHeight = BOOK_CONFIG.pageHeight;
      let currentPage = "";

      for (let index = 0; index < paragraphs.length; index++) {
        const item = paragraphs[index];
        
        // 检查是否为图片段落
        const hasImage = this.isImageParagraph(item.content);
        
        // 图片段落特殊处理
        if (hasImage) {
          currentPage = this.handleImageParagraph(item, currentPage, testContainer, maxHeight);
          continue;
        }
        
        // 普通段落处理
        const { newCurrentPage } = this.handleTextParagraph(
          item, currentPage, testContainer, maxHeight
        );
        
        currentPage = newCurrentPage;
        
        // 如果这是最后一个段落，保存当前页面
        if (index === paragraphs.length - 1 && currentPage) {
          this.pages.push(currentPage);
        }
      }
    },

    /**
     * 判断是否为图片段落
     * @param {String} content - 段落内容
     * @returns {Boolean}
     */
    isImageParagraph(content) {
      return content.includes('<div class="source-card"') && content.includes('<img');
    },
    
    /**
     * 处理图片段落
     * @param {Object} item - 段落对象
     * @param {String} currentPage - 当前页面内容
     * @param {HTMLElement} testContainer - 测试容器
     * @param {Number} maxHeight - 最大高度
     * @returns {String} - 处理后的当前页内容
     */
    handleImageParagraph(item, currentPage, testContainer, maxHeight) {
      testContainer.innerHTML = currentPage;
      const currentHeight = testContainer.offsetHeight;
      
      // 如果当前页已经达到最大高度的75%以上，先保存当前页，然后将图片放在新页面上
      if (currentHeight > maxHeight * 0.75) {
        // 保存当前页
        if (currentPage.trim()) {
          this.pages.push(currentPage);
          return `<p>${item.content}</p>`;
        }
      }
      
      // 测试添加图片后的高度
      const testContent = currentPage + `<p>${item.content}</p>`;
      testContainer.innerHTML = testContent;
      const newHeight = testContainer.offsetHeight;
      
      // 如果添加这个图片会超出页面高度
      if (newHeight > maxHeight) {
        if (currentPage.trim()) {
          this.pages.push(currentPage);
          return `<p>${item.content}</p>`;
        } else {
          // 如果当前页为空，说明图片太大，直接作为一页
          this.pages.push(`<p>${item.content}</p>`);
          return "";
        }
      } else {
        // 图片可以添加到当前页面
        return currentPage + `<p>${item.content}</p>`;
      }
    },
    
    /**
     * 处理普通文本段落
     * @param {Object} item - 段落对象
     * @param {String} currentPage - 当前页面内容
     * @param {HTMLElement} testContainer - 测试容器
     * @param {Number} maxHeight - 最大高度
     * @returns {Object} - {newCurrentPage}
     */
    handleTextParagraph(item, currentPage, testContainer, maxHeight) {
      // 测试添加到当前页后的高度
      const testContent = currentPage + `<p>${item.content}</p>`;
      testContainer.innerHTML = testContent;
      const newHeight = testContainer.offsetHeight;

      // 如果添加这个段落会超出页面高度
      if (newHeight > maxHeight) {
        // 尝试在段落内找到合适的分割点
        const { firstPart, remainingPart } = this.findOptimalSplitPoint(
          item.content, currentPage, testContainer, maxHeight
        );

        // 将第一部分添加到当前页
        const updatedCurrentPage = currentPage + `<p>${firstPart}</p>`;
        this.pages.push(updatedCurrentPage);

        // 返回新的页面，包含剩余部分
        return {
          newCurrentPage: remainingPart ? `<p>${remainingPart}</p>` : ""
        };
      } else {
        // 段落可以添加到当前页面
        return {
          newCurrentPage: currentPage + `<p>${item.content}</p>`
        };
      }
    },

    /**
     * 寻找最优分割点
     * @param {String} content - 段落内容
     * @param {String} currentPage - 当前页面内容
     * @param {HTMLElement} testContainer - 测试容器
     * @param {Number} maxHeight - 最大高度
     * @returns {Object} - {firstPart, remainingPart}
     */
    findOptimalSplitPoint(content, currentPage, testContainer, maxHeight) {
      let start = 0;
      let end = content.length;
      let mid = Math.floor((start + end) / 2);
      let foundExactFit = false;

      // 二分查找最佳分割点
      const maxIterations = 20;
      let iterations = 0;

      while (start < end && iterations < maxIterations) {
        iterations++;

        // 测试当前位置分割的内容是否适合当前页面
        const testFirstPart = currentPage + `<p>${content.substring(0, mid)}</p>`;
        testContainer.innerHTML = testFirstPart;
        const testHeight = testContainer.offsetHeight;

        // 找到最接近但不超过最大高度的分割点
        if (testHeight <= maxHeight) {
          if (mid === content.length - 1 || start === mid) {
            // 已经找到最佳分割点或者无法再优化
            foundExactFit = true;
            break;
          }
          start = mid;
        } else {
          end = mid;
        }

        mid = Math.floor((start + end) / 2);
      }

      // 如果找到合适的分割点
      if (foundExactFit || mid > 0) {
        // 在分割点附近找到一个自然的断句点
        let breakPoint = this.findNaturalBreakPoint(content, mid);

        // 分割段落
        const firstPart = content.substring(0, breakPoint);
        const remainingPart = content.substring(breakPoint);

        return { firstPart, remainingPart };
      } else {
        // 无法找到合适的分割点
        return { firstPart: "", remainingPart: content };
      }
    },

    /**
     * 查找自然断句点
     * @param {String} content - 内容
     * @param {Number} position - 当前位置
     * @returns {Number} - 断句点位置
     */
    findNaturalBreakPoint(content, position) {
      let breakPoint = position;
      
      // 向后查找30个字符内是否有自然断句点
      const forwardRange = Math.min(30, content.length - position);
      for (let i = 0; i < forwardRange; i++) {
        if (NATURAL_BREAKS.includes(content[position + i])) {
          breakPoint = position + i + 1; // 在断句点之后分割
          return breakPoint;
        }
      }

      // 如果向后没找到，向前查找15个字符
      if (breakPoint === position && position > 15) {
        for (let i = 1; i <= 15; i++) {
          if (NATURAL_BREAKS.includes(content[position - i])) {
            breakPoint = position - i + 1; // 在断句点之后分割
            return breakPoint;
          }
        }
      }
      
      return breakPoint;
    },

    /**
     * 转换图片内容
     * @param {String} content - 原始内容
     * @returns {String} - 转换后的内容
     */
    convertImg(content) {
      const imgReg = /<img src=.*?(?:>|\/>)/gi;
      const imageList = content.match(imgReg);
      
      if (!imageList) return content;
      
      imageList.forEach((item) => {
        const srcMatch = item.match(/src="([^"]+)"/);
        if (!srcMatch) return;
        
        const src = srcMatch[1];
        const match = src.match(/filename=([^&]*)/);
        const title = match ? match[1] : "暂无标题";
        
        const newView = `<br><br><div class="source-card" id="content-box" data-type="image" data-title="${title}" data-src="${src}"><img src="${src}" alt="${title}" /></div>`;
        content = content.replace(item, newView);
      });
      
      return content;
    },
    
    /**
     * 提取内容中的段落
     * @param {HTMLElement} contentDiv - 内容元素
     * @returns {Array} - 段落数组
     */
    extractParagraphs(contentDiv) {
      const html = contentDiv.innerHTML;
      const paragraphs = html.split("<br><br>");
      
      return paragraphs
        .map(paragraph => paragraph.trim())
        .filter(Boolean)
        .map(content => ({
          isTitle: false,
          content
        }));
    },

    /**
     * 生成目录
     */
    generateTableOfContents() {
      const pageCount = 3; // 从第3页开始计算（封面是1，目录是2）
      
      // 提取所有章节标题及其所在页面
      this.tableOfContents = this.pages.reduce((acc, pageContent, index) => {
        const titleMatch = pageContent.match(/<h2>(.*?)<\/h2>/);
        if (titleMatch) {
          acc.push({
            title: titleMatch[1],
            page: pageCount + index,
          });
        }
        return acc;
      }, []);
    },

    /**
     * 初始化turn.js
     */
    initTurnJS() {
      const options = {
        width: BOOK_CONFIG.width,
        height: BOOK_CONFIG.height,
        autoCenter: true,
        display: "double",
        acceleration: true,
        elevation: 50,
        gradients: true,
        duration: BOOK_CONFIG.animationDuration,
        margin: 0,
        when: {
          turning: (e, page) => {
            this.currentPage = page;
            this.isBookOpened = page > 1;
          },
          turned: (e, page) => {
            this.currentPage = page;
            this.isBookOpened = page > 1;
          },
        },
      };

      if (window.$ && this.$refs.turnBook) {
        this.turnInstance = window.$(this.$refs.turnBook).turn(options);
      } else {
        console.error("jQuery or turn.js not available");
      }
    },

    /**
     * 翻到上一页
     */
    prevPage() {
      if (this.turnInstance) {
        window.$(this.$refs.turnBook).turn("previous");
      }
    },

    /**
     * 翻到下一页
     */
    nextPage() {
      if (this.turnInstance) {
        window.$(this.$refs.turnBook).turn("next");
      }
    },
  },
};
</script>

<style>
.turn-book-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 0;
  position: relative;
}

#book {
  width: 800px;
  height: 500px;
  position: relative;
  perspective: 1500px;
  margin-bottom: 20px;
}

/* 书本左侧的堆叠书页效果 - 只在书本打开时显示 */
#book.book-opened .page-stack-left {
  content: '';
  position: absolute;
  bottom: 0;
  left: -20px;
  width: 20px;
  height: 500px;
  background: linear-gradient(to right, #d8d8d8, #e8e8e8);
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: -2;
  border-left: 1px solid #ccc;
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
  background: linear-gradient(to left, #d8d8d8, #e8e8e8);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: -2;
  border-right: 1px solid #ccc;
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
  background: linear-gradient(to right, #d0d0d0, #e0e0e0);
  z-index: -1;
  border-left: 1px solid #ccc;
  border-radius: 2px 0 0 2px;
}

#book.book-opened .page-stack-left::after {
  background: linear-gradient(to right, #c8c8c8, #d8d8d8);
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
  background: linear-gradient(to left, #d0d0d0, #e0e0e0);
  z-index: -1;
  border-right: 1px solid #ccc;
  border-radius: 0 2px 2px 0;
}

#book.book-opened .page-stack-right::after {
  background: linear-gradient(to left, #c8c8c8, #d8d8d8);
  right: -6px;
  z-index: -2;
}

/* 第3层和第4层堆叠 - 左侧 */
#book.book-opened .page-stack-left .layer-3 {
  background: linear-gradient(to right, #c0c0c0, #d0d0d0);
  left: -9px;
  z-index: -3;
}

#book.book-opened .page-stack-left .layer-4 {
  background: linear-gradient(to right, #b8b8b8, #c8c8c8);
  left: -12px;
  z-index: -4;
}

/* 第3层和第4层堆叠 - 右侧 */
#book.book-opened .page-stack-right .layer-3 {
  background: linear-gradient(to left, #c0c0c0, #d0d0d0);
  right: -9px;
  z-index: -3;
}

#book.book-opened .page-stack-right .layer-4 {
  background: linear-gradient(to left, #b8b8b8, #c8c8c8);
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
    rgba(0, 0, 0, 0.1) 48%, 
    rgba(0, 0, 0, 0.1) 52%, 
    rgba(0, 0, 0, 0.00) 100%);
  z-index: 11;
}

.page {
  background: linear-gradient(135deg, #fff, #f0f0f0);
  border: 1px solid #ccc;
  width: 400px;
  height: 500px;
  box-sizing: border-box;
  user-select: none;
  overflow: hidden;
}

.cover,
.back-cover {
  background: linear-gradient(135deg, #f5e3aa, #e8d090);
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  line-height: 500px;
}

.toc {
  font-size: 16px;
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
  border-bottom: 1px dotted #ccc;
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
  color: #333;
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

.image-placeholder {
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  padding: 10px;
  margin: 15px 0;
  text-align: center;
  font-style: italic;
  font-size: 14px;
  color: #666;
  border-radius: 4px;
}

.controls {
  margin-top: 30px;
  display: flex;
  gap: 30px;
  align-items: center;
}

button {
  padding: 10px 20px;
  background: linear-gradient(to bottom, #42b983, #3aa876);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: linear-gradient(to bottom, #3aa876, #33946a);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.page-number {
  font-size: 16px;
  color: #666;
  min-width: 80px;
  text-align: center;
}

.test-container {
  position: absolute;
  visibility: hidden;
  z-index: -1;
}
</style>
