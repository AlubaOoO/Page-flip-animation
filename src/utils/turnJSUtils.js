import { BOOK_CONFIG } from './constants';

/**
 * 初始化TurnJS实例
 * @param {HTMLElement} element - 书本元素
 * @param {Object} callbacks - 回调函数对象
 * @returns {Object|null} - TurnJS实例或null
 */
export function initTurnJS(element, callbacks = {}) {
  if (!element) {
    console.error("Book element reference not available");
    return null;
  }
  
  if (!window.$) {
    console.error("jQuery not available");
    return null;
  }
  
  try {
    // 如果已存在实例，先销毁
    cleanupTurnJS(element);
    
    // TurnJS配置
    const options = {
      width: BOOK_CONFIG.width,
      height: BOOK_CONFIG.height,
      autoCenter: true,
      display: "double",
      acceleration: true,
      elevation: 50,
      gradients: true,
      duration: BOOK_CONFIG.animationDuration,
      margin: 0,
      when: callbacks
    };
    
    // 初始化TurnJS
    const instance = window.$(element).turn(options);
    console.log("Turn.js initialized successfully");
    return instance;
    
  } catch (err) {
    console.error("Error initializing turn.js:", err);
    return null;
  }
}

/**
 * 清理TurnJS实例
 * @param {HTMLElement} element - 书本元素
 */
export function cleanupTurnJS(element) {
  try {
    // 确保元素存在
    if (element && window.$ && window.$(element).data().turn) {
      console.log("Destroying turn.js instance");
      window.$(element).turn("destroy");
    }
  } catch (err) {
    console.error("Error cleaning up turn.js instance:", err);
  }
} 