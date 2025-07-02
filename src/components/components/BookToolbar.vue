<template>
  <div class="toolbar">
    <theme-settings 
      :is-dark-theme="isDarkTheme" 
      @theme-change="onThemeChange"
    />
    
    <font-size-settings 
      :font-size="fontSize" 
      :debounce-time="debounceDuration"
      @font-size-input="onFontSizeInput"
      @font-size-change="onFontSizeChange"
      @font-size-debounced="onFontSizeDebounced"
    />
  </div>
</template>

<script>
import ThemeSettings from './ThemeSettings.vue';
import FontSizeSettings from './FontSizeSettings.vue';
import { BOOK_CONFIG } from '../../utils/constants';

export default {
  name: 'BookToolbar',
  components: {
    ThemeSettings,
    FontSizeSettings
  },
  props: {
    isDarkTheme: {
      type: Boolean,
      required: true
    },
    fontSize: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      debounceDuration: BOOK_CONFIG.debounceDuration
    };
  },
  methods: {
    onThemeChange(isDark) {
      this.$emit('theme-change', isDark);
    },
    
    onFontSizeInput(size) {
      this.$emit('font-size-input', size);
    },
    
    onFontSizeChange(size) {
      this.$emit('font-size-change', size);
    },
    
    onFontSizeDebounced(size) {
      this.$emit('font-size-debounced', size);
    }
  }
}
</script>

<style scoped>
.toolbar {
  position: absolute;
  right: -240px;
  bottom: 130px;
  width: 160px;
  background: var(--toolbar-bg);
  border: 1px solid var(--toolbar-border);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 100;
}
</style> 