<template>
  <div class="turn-book-container">
    <div id="book" ref="turnBook">
      <div class="page">封面</div>
      <div class="page">目录</div>
      <div class="page">第 1 页</div>
      <div class="page">第 2 页</div>
      <div class="page">第 3 页</div>
      <div class="page">第 4 页</div>
      <div class="page">第 5 页</div>
      <div class="page">第 6 页</div>
      <div class="page">封底</div>
      <div class="page">谢谢阅读</div>
    </div>
    
    <div class="controls">
      <button @click="prevPage">上一页</button>
      <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TurnBookFlip',
  data() {
    return {
      currentPage: 1,
      totalPages: 10, // Total number of pages including covers
      turnInstance: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      // Initialize turn.js
      this.initTurnJS();
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
    initTurnJS() {
      const options = {
        width: 800,
        height: 500,
        autoCenter: true,
        display: 'double',
        when: {
          turning: (e, page) => {
            this.currentPage = page;
          },
          turned: (e, page) => {
            this.currentPage = page;
          }
        }
      };
      
      // Using the global jQuery and turn.js from the CDN
      if (window.$ && this.$refs.turnBook) {
        this.turnInstance = window.$(this.$refs.turnBook).turn(options);
      } else {
        console.error('jQuery or turn.js not available');
      }
    },
    prevPage() {
      if (this.turnInstance) {
        window.$(this.$refs.turnBook).turn('previous');
      }
    },
    nextPage() {
      if (this.turnInstance) {
        window.$(this.$refs.turnBook).turn('next');
      }
    }
  }
}
</script>

<style scoped>
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

.page {
  background: linear-gradient(135deg, #fff, #f0f0f0);
  border: 1px solid #ccc;
  width: 400px;
  height: 500px;
  font-size: 28px;
  text-align: center;
  line-height: 500px;
  box-sizing: border-box;
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
</style> 