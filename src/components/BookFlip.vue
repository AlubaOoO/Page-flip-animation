<template>
  <div class="book-container">
    <div class="book" ref="bookElement">
      <!-- Left pages (even) -->
      <div class="book-page-wrapper left-page">
        <div class="book-page" v-if="currentPageIndex > 0">
          <div class="page-content" v-html="pages[currentPageIndex - 1].content"></div>
        </div>
        <div class="book-page cover" v-else>
          <div class="page-content">
            <h2>封面</h2>
            <p>翻页图书示例</p>
          </div>
        </div>
      </div>
      
      <!-- Right pages (odd) -->
      <div class="book-page-wrapper right-page">
        <div class="book-page" v-if="currentPageIndex < pages.length">
          <div class="page-content" v-html="pages[currentPageIndex].content"></div>
        </div>
        <div class="book-page back-cover" v-else>
          <div class="page-content">
            <h2>封底</h2>
            <p>感谢阅读</p>
          </div>
        </div>
      </div>
      
      <!-- Flipping page animation -->
      <div class="flipping-page" :class="{ 'flipping': isFlipping, 'flipping-left': isFlippingLeft }" 
           @animationend="onAnimationEnd">
        <div class="flipping-page-front" v-if="isFlipping">
          <div class="page-content" v-html="flippingContent.front"></div>
        </div>
        <div class="flipping-page-back" v-if="isFlipping">
          <div class="page-content" v-html="flippingContent.back"></div>
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button @click="prevPage" :disabled="currentPageIndex === 0">上一页</button>
      <span class="page-number">{{ Math.ceil((currentPageIndex + 1) / 2) }} / {{ Math.ceil(pages.length / 2) }}</span>
      <button @click="nextPage" :disabled="currentPageIndex >= pages.length">下一页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookFlip',
  data() {
    return {
      currentPageIndex: 0,
      isFlipping: false,
      isFlippingLeft: false,
      flippingContent: {
        front: '',
        back: ''
      },
      pages: [
        { content: '<h2>目录</h2><p>翻页图书示例目录</p>' },
        { content: '<h2>第 1 页</h2><p>这是第一页的内容。双页布局的书本效果，可以更真实地模拟翻书体验。</p>' },
        { content: '<h2>第 2 页</h2><p>这是第二页的内容。书页翻转时会有动画效果，增强用户体验。</p>' },
        { content: '<h2>第 3 页</h2><p>这是第三页的内容。页面的内容可以是任何HTML，可以包含图片和其他元素。</p>' },
        { content: '<h2>第 4 页</h2><p>这是第四页的内容。这个组件可以很容易地扩展，添加更多功能。</p>' },
        { content: '<h2>第 5 页</h2><p>这是第五页的内容。可以通过点击按钮或者直接点击页面边缘来翻页。</p>' },
        { content: '<h2>第 6 页</h2><p>这是第六页的内容。你也可以添加自定义的页面切换效果。</p>' },
        { content: '<h2>谢谢阅读</h2><p>感谢使用这个组件！</p>' }
      ]
    }
  },
  mounted() {
    // Add click events for page edges to allow clicking on the edges to turn pages
    const book = this.$refs.bookElement;
    if (book) {
      // Add click handlers for edges
      const leftEdge = document.createElement('div');
      leftEdge.className = 'page-edge left-edge';
      leftEdge.addEventListener('click', this.prevPage);
      
      const rightEdge = document.createElement('div');
      rightEdge.className = 'page-edge right-edge';
      rightEdge.addEventListener('click', this.nextPage);
      
      book.appendChild(leftEdge);
      book.appendChild(rightEdge);
    }
  },
  methods: {
    prevPage() {
      if (this.currentPageIndex > 0 && !this.isFlipping) {
        this.isFlipping = true;
        this.isFlippingLeft = true;
        
        // Set content for the flipping page
        this.flippingContent.front = this.pages[this.currentPageIndex].content;
        this.flippingContent.back = this.currentPageIndex > 0 ? 
          this.pages[this.currentPageIndex - 1].content : 
          '<h2>封面</h2><p>翻页图书示例</p>';
          
        // Change page after animation starts
        this.currentPageIndex -= 2;
        if (this.currentPageIndex < 0) this.currentPageIndex = 0;
      }
    },
    nextPage() {
      if (this.currentPageIndex < this.pages.length && !this.isFlipping) {
        this.isFlipping = true;
        this.isFlippingLeft = false;
        
        // Set content for the flipping page
        this.flippingContent.front = this.currentPageIndex > 0 ? 
          this.pages[this.currentPageIndex - 1].content : 
          '<h2>封面</h2><p>翻页图书示例</p>';
        this.flippingContent.back = this.currentPageIndex < this.pages.length ? 
          this.pages[this.currentPageIndex].content : 
          '<h2>封底</h2><p>感谢阅读</p>';
          
        // Change page after animation starts
        this.currentPageIndex += 2;
        if (this.currentPageIndex > this.pages.length) this.currentPageIndex = this.pages.length;
      }
    },
    onAnimationEnd() {
      this.isFlipping = false;
    }
  }
}
</script>

<style scoped>
.book-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 0;
}

.book {
  position: relative;
  width: 800px;
  height: 500px;
  perspective: 2000px;
  display: flex;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  background: #f0f0f0;
  border-radius: 5px;
}

.book-page-wrapper {
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.left-page {
  border-right: 1px solid #ddd;
}

.right-page {
  border-left: 1px solid #ddd;
}

.book-page {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fff, #f0f0f0);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.cover {
  background: linear-gradient(135deg, #4eca8b, #42b983);
  color: white;
}

.back-cover {
  background: linear-gradient(135deg, #4eca8b, #42b983);
  color: white;
}

.flipping-page {
  position: absolute;
  width: 50%;
  height: 100%;
  right: 0;
  top: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  z-index: 10;
  pointer-events: none;
  visibility: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.flipping-left {
  left: 0;
  right: auto;
  transform-origin: right center;
}

.flipping {
  visibility: visible;
}

.flipping-page-front, .flipping-page-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #fff, #f0f0f0);
  box-sizing: border-box;
  padding: 20px;
  overflow: hidden;
}

.flipping-page-back {
  transform: rotateY(180deg);
}

.flipping.flipping-left {
  animation: flipLeftToRight 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
}

.flipping:not(.flipping-left) {
  animation: flipRightToLeft 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
}

@keyframes flipRightToLeft {
  0% {
    transform: rotateY(0);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
  20% {
    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  }
  100% {
    transform: rotateY(-180deg);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
}

@keyframes flipLeftToRight {
  0% {
    transform: rotateY(0);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
  20% {
    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  }
  100% {
    transform: rotateY(180deg);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
}

.page-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-align: center;
  user-select: none;
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

button:hover:not(:disabled) {
  background: linear-gradient(to bottom, #3aa876, #33946a);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

button:disabled {
  background: linear-gradient(to bottom, #cccccc, #bbbbbb);
  cursor: not-allowed;
  box-shadow: none;
}

.page-number {
  font-size: 16px;
  color: #666;
  min-width: 80px;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 28px;
}

p {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #666;
  max-width: 80%;
  font-size: 16px;
}

.page-edge {
  position: absolute;
  top: 0;
  width: 40px;
  height: 100%;
  cursor: pointer;
  z-index: 5;
  opacity: 0.01;
  transition: opacity 0.3s;
}

.page-edge:hover {
  opacity: 0.1;
  background: rgba(0, 0, 0, 0.05);
}

.left-edge {
  left: 0;
}

.right-edge {
  right: 0;
}
</style> 