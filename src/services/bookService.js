import { convertImg, extractParagraphs } from '../utils/textUtils';
import { paginateContent } from '../utils/paginationUtils';

/**
 * 从原始内容中提取章节信息
 * @param {String} content - 原始内容
 * @returns {Array} - 章节数组
 */
export function extractSections(content) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const text = tempDiv.innerHTML;
  
  // 按段落分割
  const paragraphs = text.split("<br><br>");
  
  // 提取章节
  const sections = [];
  let currentSection = { title: "", content: [] };

  paragraphs.forEach((paragraph) => {
    currentSection.content.push(paragraph);
  });

  // 添加最后一个章节
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
}

/**
 * 计算分页内容
 * @param {String} rawContent - 原始内容
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} fontSize - 字体大小
 * @returns {Array} - 分页后的内容
 */
export function calculatePages(rawContent, testContainer, fontSize) {
  // 解析原始内容为DOM元素，以便更精确计算
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = rawContent;
  const allParagraphs = extractParagraphs(contentDiv);

  // 分页处理
  return paginateContent(allParagraphs, testContainer, fontSize);
}

/**
 * 生成目录
 * @param {Array} pages - 分页后的内容
 * @returns {Array} - 目录数组
 */
export function generateTableOfContents(pages) {
  const pageCount = 3; // 从第3页开始计算（封面是1，目录是2）
  
  // 提取所有章节标题及其所在页面
  return pages.reduce((acc, pageContent, index) => {
    const titleMatch = pageContent.match(/<h2>(.*?)<\/h2>/);
    if (titleMatch) {
      acc.push({
        title: titleMatch[1],
        page: pageCount + index,
      });
    }
    return acc;
  }, []);
}

/**
 * 加载并处理书本内容
 * @param {Object} contentData - 书本原始内容
 * @param {HTMLElement} testContainer - 测试容器
 * @param {Number} fontSize - 字体大小
 * @returns {Object} - {pages, tableOfContents}
 */
export function processBookContent(contentData, testContainer, fontSize) {
  // 处理内容中的图片
  const processedContent = convertImg(contentData);
  
  // 计算分页
  const pages = calculatePages(processedContent, testContainer, fontSize);
  
  // 生成目录
  const tableOfContents = generateTableOfContents(pages);
  
  return { pages, tableOfContents };
} 