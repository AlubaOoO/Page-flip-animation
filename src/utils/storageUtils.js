/**
 * 加载保存的设置
 * @returns {Object} - 设置对象
 */
export function loadSettings() {
  const defaultSettings = {
    isDarkTheme: false,
    fontSize: 16
  };
  
  try {
    // 从本地存储中读取设置
    const savedSettings = localStorage.getItem('turnbook-settings');
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  
  return defaultSettings;
}

/**
 * 保存设置到本地存储
 * @param {Object} settings - 设置对象
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem('turnbook-settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
} 