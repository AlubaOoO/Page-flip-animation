// 电子书配置常量
export const BOOK_CONFIG = {
  width: 800,
  height: 500,
  pageWidth: 350,     // 页面内容宽度
  pageHeight: 460,    // 页面内容高度（减去边距）
  fontSizePx: 16,
  lineHeight: 1.5,
  padding: 20,
  animationDuration: 600, // 翻页动画持续时间
  debounceDuration: 500,  // 字体调整防抖时间
};

// 分页断句符号列表
export const NATURAL_BREAKS = [
  "。", "，", "！", "？", "；", "：", " ", ")", "）", "》", "\u201D",
  ".", ",", "!", "?", ";", ":", " ", ">", '"',
]; 