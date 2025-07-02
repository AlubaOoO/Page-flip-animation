<template>
  <div class="toolbar-section">
    <h4>主题切换</h4>
    <div class="theme-switch">
      <button 
        class="theme-btn light" 
        :class="{ active: !isDarkTheme }"
        @click="changeTheme(false)"
      >
        亮色
      </button>
      <button 
        class="theme-btn dark" 
        :class="{ active: isDarkTheme }"
        @click="changeTheme(true)"
      >
        暗色
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThemeSettings',
  props: {
    isDarkTheme: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    changeTheme(isDark) {
      this.$emit('theme-change', isDark);
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

.theme-switch {
  display: flex;
  justify-content: space-between;
}

.theme-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  flex-grow: 1;
  transition: all 0.3s;
}

.theme-btn:first-child {
  margin-right: 5px;
}

.theme-btn.light {
  background: #fff;
  color: #333;
}

.theme-btn.dark {
  background: #333;
  color: #e0e0e0;
}

.theme-btn.active {
  border: 2px solid #42b983;
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.5);
}
</style> 