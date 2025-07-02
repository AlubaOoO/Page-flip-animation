import { BOOK_CONFIG } from './constants';
import { isImageParagraph, findNaturalBreakPoint } from './textUtils';

/**
 * 寻找最优分割点
 * @param {String} content - 段落内容
 * @param {String} currentPage - 当前页面内容
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} maxHeight - 最大高度
 * @returns {Object} - {firstPart, remainingPart}
 */
export function findOptimalSplitPoint(content, currentPage, testContainer, maxHeight) {
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
    let breakPoint = findNaturalBreakPoint(content, mid);

    // 分割段落
    const firstPart = content.substring(0, breakPoint);
    const remainingPart = content.substring(breakPoint);

    return { firstPart, remainingPart };
  } else {
    // 无法找到合适的分割点
    return { firstPart: "", remainingPart: content };
  }
}

/**
 * 处理图片段落
 * @param {Object} item - 段落对象
 * @param {String} currentPage - 当前页面内容
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} maxHeight - 最大高度
 * @returns {String} - 处理后的当前页内容
 */
export function handleImageParagraph(item, currentPage, testContainer, maxHeight) {
  testContainer.innerHTML = currentPage;
  const currentHeight = testContainer.offsetHeight;
  
  // 如果当前页已经达到最大高度的75%以上，先保存当前页，然后将图片放在新页面上
  if (currentHeight > maxHeight * 0.75) {
    // 保存当前页
    return {
      shouldBreak: true,
      currentPage,
      newPage: `<p>${item.content}</p>`
    };
  }
  
  // 测试添加图片后的高度
  const testContent = currentPage + `<p>${item.content}</p>`;
  testContainer.innerHTML = testContent;
  const newHeight = testContainer.offsetHeight;
  
  // 如果添加这个图片会超出页面高度
  if (newHeight > maxHeight) {
    if (currentPage.trim()) {
      return {
        shouldBreak: true,
        currentPage,
        newPage: `<p>${item.content}</p>`
      };
    } else {
      // 如果当前页为空，说明图片太大，直接作为一页
      return {
        shouldBreak: true,
        currentPage: `<p>${item.content}</p>`,
        newPage: ""
      };
    }
  } else {
    // 图片可以添加到当前页面
    return {
      shouldBreak: false,
      currentPage: currentPage + `<p>${item.content}</p>`,
      newPage: ""
    };
  }
}

/**
 * 处理普通文本段落
 * @param {Object} item - 段落对象
 * @param {String} currentPage - 当前页面内容
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} maxHeight - 最大高度
 * @returns {Object} - {shouldBreak, currentPage, newPage}
 */
export function handleTextParagraph(item, currentPage, testContainer, maxHeight) {
  // 测试添加到当前页后的高度
  const testContent = currentPage + `<p>${item.content}</p>`;
  testContainer.innerHTML = testContent;
  const newHeight = testContainer.offsetHeight;

  // 如果添加这个段落会超出页面高度
  if (newHeight > maxHeight) {
    // 尝试在段落内找到合适的分割点
    const { firstPart, remainingPart } = findOptimalSplitPoint(
      item.content, currentPage, testContainer, maxHeight
    );

    // 将第一部分添加到当前页
    const updatedCurrentPage = currentPage + `<p>${firstPart}</p>`;
    
    return {
      shouldBreak: true,
      currentPage: updatedCurrentPage,
      newPage: remainingPart ? `<p>${remainingPart}</p>` : ""
    };
  } else {
    // 段落可以添加到当前页面
    return {
      shouldBreak: false,
      currentPage: currentPage + `<p>${item.content}</p>`,
      newPage: ""
    };
  }
}

/**
 * 设置用于测试内容高度的容器
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} fontSize - 字体大小
 */
export function setupTestContainer(testContainer, fontSize) {
  Object.assign(testContainer.style, {
    width: `${BOOK_CONFIG.pageWidth}px`,
    height: "auto",
    visibility: "hidden",
    position: "absolute",
    fontSize: `${fontSize}px`,
    lineHeight: String(BOOK_CONFIG.lineHeight),
    padding: `${BOOK_CONFIG.padding}px`,
    boxSizing: "border-box",
  });
}

/**
 * 分页处理内容
 * @param {Array} paragraphs - 段落数组
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} fontSize - 字体大小
 * @returns {Array} - 分页后的内容数组
 */
export function paginateContent(paragraphs, testContainer, fontSize) {
  setupTestContainer(testContainer, fontSize);
  const maxHeight = BOOK_CONFIG.pageHeight;
  let currentPage = "";
  const pages = [];

  for (let index = 0; index < paragraphs.length; index++) {
    const item = paragraphs[index];
    
    // 检查是否为图片段落
    const hasImage = isImageParagraph(item.content);
    
    let result;
    // 图片段落特殊处理
    if (hasImage) {
      result = handleImageParagraph(item, currentPage, testContainer, maxHeight);
    } else {
      // 普通段落处理
      result = handleTextParagraph(item, currentPage, testContainer, maxHeight);
    }
    
    if (result.shouldBreak) {
      pages.push(result.currentPage);
      currentPage = result.newPage;
    } else {
      currentPage = result.currentPage;
    }
    
    // 如果这是最后一个段落，保存当前页面
    if (index === paragraphs.length - 1 && currentPage) {
      pages.push(currentPage);
    }
  }
  
  return pages;
} 