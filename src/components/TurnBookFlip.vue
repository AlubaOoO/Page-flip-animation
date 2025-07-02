<template>
  <div class="turn-book-container">
    <div id="book" ref="turnBook" :class="{ 'book-opened': isBookOpened }">
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
      <div class="page back-cover">谢谢阅读</div>
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
  mounted() {
    this.$nextTick(() => {
      // 解析富文本内容
      this.content = testData;
      this.content = this.convertImg(this.content);
      // 提取章节标题
      this.extractSections();

      // 计算分页
      this.calculatePages();

      // 生成目录
      this.generateTableOfContents();

      // 延迟初始化turn.js以确保DOM已更新
      setTimeout(() => {
        // Initialize turn.js
        this.initTurnJS();
      }, 1000);
    });
  },
  beforeUnmount() {
    // Clean up turn.js instance
    if (this.turnInstance && this.$refs.turnBook) {
      window.$(this.$refs.turnBook).turn("destroy");
      this.turnInstance = null;
    }
  },
  methods: {
    extractSections() {
      // 提取内容中的章节标题
      // 在这个示例中，我们将 <br><br> 后跟非 <br> 开头的大段文字作为新章节的开始
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = this.content;

      // 将HTML转换为纯文本，保留<br>作为换行符
      const text = tempDiv.innerHTML;
      console.log("text", text);

      // 简单处理：把文本按段落分割
      const paragraphs = text.split("<br><br>");
      console.log("paragraphs", paragraphs);
      // 找到像标题的段落（如"家譜是什麼？"和"尋找家譜"）
      this.sections = [];
      let currentSection = { title: "", content: [] };

      paragraphs.forEach((paragraph) => {
        currentSection.content.push(paragraph);
      });

      // 添加最后一个章节
      if (currentSection.content.length > 0) {
        this.sections.push(currentSection);
      }
      console.log("sections", this.sections);
    },

    calculatePages() {
      // 创建测试容器来计算内容高度
      const testContainer = this.$refs.testContainer;
      testContainer.style.width = "350px"; // 页面宽度减去边距
      testContainer.style.height = "auto";
      testContainer.style.visibility = "hidden";
      testContainer.style.position = "absolute";
      testContainer.style.fontSize = "16px";
      testContainer.style.lineHeight = "1.5";
      testContainer.style.padding = "20px";
      testContainer.style.boxSizing = "border-box";

      // 计算每页的内容
      const maxHeight = 460; // 页面高度减去边距
      this.pages = [];

      // 解析原始内容为DOM元素，以便更精确计算
      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = this.content;
      const allParagraphs = this.extractParagraphs(contentDiv);

      let currentPage = "";

      // 处理所有段落
      for (let index = 0; index < allParagraphs.length; index++) {
        const item = allParagraphs[index];
        
        // 检查段落是否包含图片元素
        const hasImage = item.content.includes('<div class="source-card"') && item.content.includes('<img');
        
        // 如果段落包含图片，检查当前页是否已接近最大高度
        if (hasImage) {
          testContainer.innerHTML = currentPage;
          const currentHeight = testContainer.offsetHeight;
          
          // 如果当前页已经达到最大高度的75%以上，先保存当前页，然后将图片放在新页面上
          if (currentHeight > maxHeight * 0.75) {
            // 保存当前页
            if (currentPage.trim()) {
              this.pages.push(currentPage);
              currentPage = "";
            }
            
            // 将图片段落添加到新页面
            currentPage = `<p>${item.content}</p>`;
            continue;
          }
        }
        
        // 普通段落，测试添加到当前页后的高度
        const testContent = currentPage + `<p>${item.content}</p>`;
        testContainer.innerHTML = testContent;
        const newHeight = testContainer.offsetHeight;

        // 如果添加这个段落会超出页面高度
        if (newHeight > maxHeight) {
          // 检查是否为包含图片的段落
          if (hasImage) {
            // 如果是图片段落且超出高度，保存当前页并在新页面显示图片
            if (currentPage.trim()) {
              this.pages.push(currentPage);
              currentPage = `<p>${item.content}</p>`;
            } else {
              // 如果当前页为空，说明图片太大，直接作为一页
              currentPage = `<p>${item.content}</p>`;
              this.pages.push(currentPage);
              currentPage = "";
            }
          } else {
            // 非图片段落，使用原来的分割逻辑
            // 尝试在段落内找到合适的分割点
            let start = 0;
            let end = item.content.length;
            let mid = Math.floor((start + end) / 2);
            let foundExactFit = false;

            // 限制查找次数，避免无限循环
            const maxIterations = 20;
            let iterations = 0;

            while (start < end && iterations < maxIterations) {
              iterations++;

              // 测试当前位置分割的内容是否适合当前页面
              const testFirstPart =
                currentPage + `<p>${item.content.substring(0, mid)}</p>`;
              testContainer.innerHTML = testFirstPart;
              const testHeight = testContainer.offsetHeight;

              // 找到最接近但不超过最大高度的分割点
              if (testHeight <= maxHeight) {
                if (mid === item.content.length - 1 || start === mid) {
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
              // 在分割点附近找到一个自然的断句点（如句号、逗号、问号等）
              let breakPoint = mid;
              const naturalBreaks = [
                "。",
                "，",
                "！",
                "？",
                "；",
                "：",
                " ",
                ")",
                "）",
                "》",
                "\u201D",
                ".",
                ",",
                "!",
                "?",
                ";",
                ":",
                " ",
                ">",
                '"',
              ];

              // 向后查找30个字符内是否有自然断句点
              const searchRange = Math.min(30, item.content.length - mid);
              for (let i = 0; i < searchRange; i++) {
                if (naturalBreaks.includes(item.content[mid + i])) {
                  breakPoint = mid + i + 1; // 在断句点之后分割
                  break;
                }
              }

              // 如果向后没找到，向前查找15个字符
              if (breakPoint === mid && mid > 15) {
                for (let i = 1; i <= 15; i++) {
                  if (naturalBreaks.includes(item.content[mid - i])) {
                    breakPoint = mid - i + 1; // 在断句点之后分割
                    break;
                  }
                }
              }

              // 分割段落
              const firstPart = item.content.substring(0, breakPoint);
              const remainingPart = item.content.substring(breakPoint);

              // 将第一部分添加到当前页
              currentPage += `<p>${firstPart}</p>`;
              this.pages.push(currentPage);

              // 开始新的页面，包含剩余部分
              currentPage = `<p>${remainingPart}</p>`;
              testContainer.innerHTML = currentPage;
              continue; // 继续处理下一个段落
            } else {
              // 如果无法找到合适的分割点
              this.pages.push(currentPage);
              currentPage = `<p>${item.content}</p>`;
              testContainer.innerHTML = currentPage;
            }
          }
        } else {
          // 段落可以添加到当前页面
          currentPage += `<p>${item.content}</p>`;
        }

        // 如果这是最后一个段落，保存当前页面
        if (index === allParagraphs.length - 1 && currentPage) {
          this.pages.push(currentPage);
        }
      }

      // 更新总页数（封面 + 目录 + 内容页 + 封底）
      this.totalPages = 2 + this.pages.length + 1;
    },

    convertImg(content) {
      const imgReg = /<img src=.*?(?:>|\/>)/gi;
      const imageList = content.match(imgReg);
      // console.log('imageList :>> ', imageList)
      imageList?.forEach((item) => {
        // console.log('item', item)
        RegExp(/src="(.*?)"/).exec(item);
        const src = RegExp.$1;
        // console.log('src', src)
        RegExp(/\?filename=(.*?)/).exec(src);
        const match = src.match(/filename=([^&]*)/);
        const title = match ? match[1] : "暂无标题";
        // console.log("title", title)
        // const newView = `<div class="source-card" id="content-box" data-type="image" data-title="${title}" data-src="${src}"><svg class="icon-image" aria-hidden="true"><use xlink:href="#icon-imagecontent" /></svg><div>${title}</div></div>`;
        const newView = `<br><br><div class="source-card" id="content-box" data-type="image" data-title="${title}" data-src="${src}"><img src="${src}" alt="${title}" /></div>`;
        content = content.replace(item, newView);
      });
      return content;
    },
    extractParagraphs(contentDiv) {
      // 从内容中提取所有段落和标题
      const result = [];

      // 使用 innerHTML 保留 HTML 标签
      const html = contentDiv.innerHTML;

      // 按段落分割
      const paragraphs = html.split("<br><br>");

      paragraphs.forEach((paragraph) => {
        // 移除开头和结尾的空白
        const trimmed = paragraph.trim();
        if (!trimmed) return;
        // 检查是否包含图片内容的标记
        else {
          result.push({
            isTitle: false,
            content: trimmed,
          });
        }
      });

      return result;
    },

    generateTableOfContents() {
      this.tableOfContents = [];
      let pageCount = 3; // 从第3页开始计算（封面是1，目录是2）

      // 提取所有章节标题及其所在页面
      const titlePages = [];
      let currentTitle = "";

      // 遍历所有页面，找出每个章节标题所在的页码
      this.pages.forEach((pageContent, index) => {
        const titleMatch = pageContent.match(/<h2>(.*?)<\/h2>/);
        if (titleMatch) {
          currentTitle = titleMatch[1];
          titlePages.push({
            title: currentTitle,
            page: pageCount + index,
          });
        }
      });

      // 设置目录内容
      this.tableOfContents = titlePages;
    },

    initTurnJS() {
      const options = {
        width: 800,
        height: 500,
        autoCenter: true,
        display: "double",
        acceleration: true,
        elevation: 50,
        gradients: true,
        // 确保中间显示自然的书脊效果
        duration: 600, // 翻页动画持续时间
        // 为了让阴影效果更好地显示，增大页面之间的间隙
        margin: 0, // 页面之间的间隙
        when: {
          turning: (e, page) => {
            this.currentPage = page;
            // 当页码大于1时，表示书本已翻开
            this.isBookOpened = page > 1;
          },
          turned: (e, page) => {
            this.currentPage = page;
            // 当页码大于1时，表示书本已翻开
            this.isBookOpened = page > 1;
          },
        },
      };

      // Using the global jQuery and turn.js from the CDN
      if (window.$ && this.$refs.turnBook) {
        this.turnInstance = window.$(this.$refs.turnBook).turn(options);
      } else {
        console.error("jQuery or turn.js not available");
      }
    },

    prevPage() {
      if (this.turnInstance) {
        window.$(this.$refs.turnBook).turn("previous");
      }
    },

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
}

#book {
  width: 800px;
  height: 500px;
  position: relative;
  perspective: 1500px;
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
  padding: 30px;
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
