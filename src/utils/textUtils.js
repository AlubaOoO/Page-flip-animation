import { NATURAL_BREAKS } from './constants';

/**
 * 转换图片内容
 * @param {String} content - 原始内容
 * @returns {String} - 转换后的内容
 */
export function convertImg(content) {
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
}

/**
 * 提取内容中的段落
 * @param {HTMLElement} contentDiv - 内容元素
 * @returns {Array} - 段落数组
 */
export function extractParagraphs(contentDiv) {
  const html = contentDiv.innerHTML;
  const paragraphs = html.split("<br><br>");
  
  return paragraphs
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(content => ({
      isTitle: false,
      content
    }));
}

/**
 * 判断是否为图片段落
 * @param {String} content - 段落内容
 * @returns {Boolean}
 */
export function isImageParagraph(content) {
  return content.includes('<div class="source-card"') && content.includes('<img');
}

/**
 * 查找自然断句点
 * @param {String} content - 内容
 * @param {Number} position - 当前位置
 * @returns {Number} - 断句点位置
 */
export function findNaturalBreakPoint(content, position) {
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
} 