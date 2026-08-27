export function showLoginRedirect() {
  const overlay = document.createElement('div');
  overlay.className = 'lp-login-redirect';
  overlay.innerHTML = '<div><span>🔐</span><h2>กรุณาเข้าสู่ระบบก่อน</h2><p>ระบบกำลังพาคุณไปยังหน้าเข้าสู่ระบบ</p><i></i></div>';
  document.body.append(overlay);
  return () => overlay.remove();
}
