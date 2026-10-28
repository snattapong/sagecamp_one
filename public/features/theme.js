// โมดูล H — ธีมมืด/สว่าง + เวลาแบบสัมพัทธ์  ·  branch: feature/theme
// หน้าเว็บของฟีเจอร์ — ดูเครื่องมือที่ใช้ได้ใน ctx ที่หัวไฟล์ public/app.js

const STORAGE_KEY = 'announcement-theme';

// คืนข้อความเวลาแบบสัมพัทธ์ภาษาไทย — ไม่แตะ document เพื่อให้ test ใน Node.js เรียกได้
export function relativeTime(date, now = new Date()) {
  const then = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(then.getTime())) return '';

  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'เมื่อสักครู่';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;

  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

const DARK_STYLE = `
:root[data-theme="dark"] {
  --bg: #0f172a;
  --card: #1e293b;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --border: #334155;
}`;

function readSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    // บางเบราว์เซอร์ปิด storage — ใช้ค่าเริ่มต้นแทน
    return 'light';
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // บันทึกไม่ได้ก็ยังสลับธีมได้ตามปกติ
  }
}

export function init(ctx) {
  const style = document.createElement('style');
  style.textContent = DARK_STYLE;
  document.head.append(style);

  let theme = readSavedTheme();
  document.documentElement.dataset.theme = theme;

  const button = document.createElement('button');
  button.type = 'button';

  function showCurrent() {
    button.textContent = theme === 'dark' ? '☀️ โหมดสว่าง' : '🌙 โหมดมืด';
  }

  button.onclick = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
    showCurrent();
  };

  showCurrent();
  ctx.header.append(button);

  ctx.addItemHook((item, parts) => {
    const text = relativeTime(item.createdAt);
    if (!text) return;
    parts.time.textContent = text;
    parts.time.title = new Date(item.createdAt).toLocaleString('th-TH');
  });
}
