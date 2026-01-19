
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bắt lỗi runtime để tránh trang trắng mà không có thông báo
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error captured:", message, "at", source, lineno);
  return false;
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Không tìm thấy phần tử #root trong index.html";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>Lỗi khởi tạo</h1><p>${errorMsg}</p></div>`;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Render Error:", err);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>Lỗi nạp ứng dụng</h1><pre>${err.message}</pre></div>`;
  }
}
