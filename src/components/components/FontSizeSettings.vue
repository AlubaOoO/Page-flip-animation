<template>
  <div class="toolbar-section">
    <h4>字体大小</h4>
    <div class="font-size-control">
      <span class="font-size-label">小</span>
      <input 
        type="range" 
        min="12" 
        max="24" 
        step="1" 
        :value="fontSize" 
        @input="onFontSizeInput"
        @change="onFontSizeChange"
      />
      <span class="font-size-label">大</span>
    </div>
    <div class="font-size-display">{{ fontSize }}px</div>
  </div>
</template>

<script>
export default {
  name: 'FontSizeSettings',
  props: {
    fontSize: {
      type: Number,
      required: true
    },
    debounceTime: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      debounceTimer: null,
      internalFontSize: this.fontSize
    };
  },
  watch: {
    fontSize(newValue) {
      this.internalFontSize = newValue;
    }
  },
  methods: {
    onFontSizeInput(event) {
      const newSize = parseInt(event.target.value, 10);
      this.internalFontSize = newSize;
      this.$emit('font-size-input', newSize);
      
      // 如果存在上一个定时器，取消它
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
    },
    
    onFontSizeChange(event) {
      const newSize = parseInt(event.target.value, 10);
      
      // 立即通知父组件
      this.$emit('font-size-change', newSize);
      
      // 防抖处理
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        this.$emit('font-size-debounced', newSize);
      }, this.debounceTime);
    }
  }
}
</script>

<style scoped>
.toolbar-section {
  margin-bottom: 20px;
}

.toolbar-section h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: var(--text-color);
  border-bottom: 1px solid var(--toolbar-border);
  padding-bottom: 5px;
}

.font-size-control {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.font-size-label {
  font-size: 14px;
  margin: 0 5px;
  color: var(--text-color);
}

.font-size-display {
  text-align: center;
  font-size: 14px;
  color: var(--text-color);
}

input[type="range"] {
  flex-grow: 1;
  height: 6px;
  border-radius: 5px;
  background: var(--border-color);
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--btn-bg);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--btn-bg);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style> 