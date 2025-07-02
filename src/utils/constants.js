// 电子书配置常量
export const getBookConfig = () => {
  // 获取窗口宽高
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 计算合适的书本尺寸（最大占据窗口的85%，但不小于最小值）
  const maxWidth = Math.max(1024, Math.floor(windowWidth * 0.85));
  const maxHeight = Math.max(768, Math.floor(windowHeight * 0.85));
  
  // 计算页面尺寸，保持大致的宽高比
  const pageWidth = Math.max(350, Math.floor(maxWidth * 0.44)); 
  const pageHeight = Math.max(460, Math.floor(maxHeight * 0.92));
  
  return {
    width: maxWidth,
    height: maxHeight,
    pageWidth,      // 页面内容宽度
    pageHeight,     // 页面内容高度（减去边距）
    fontSizePx: 16,
    lineHeight: 1.5,
    padding: 20,
    animationDuration: 600, // 翻页动画持续时间
    debounceDuration: 500,  // 字体调整防抖时间
  };
};

// 获取当前配置
export const BOOK_CONFIG = getBookConfig();

// 添加窗口大小变化监听器，更新配置
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    Object.assign(BOOK_CONFIG, getBookConfig());
  });
}

// 分页断句符号列表
export const NATURAL_BREAKS = [
  "。", "，", "！", "？", "；", "：", " ", ")", "）", "》", "\u201D",
  ".", ",", "!", "?", ";", ":", " ", ">", '"',
]; 