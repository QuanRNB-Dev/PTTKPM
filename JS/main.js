const defaultAdmin = {
  fullName: 'Quản trị viên PickleBall',
  email: 'admin@pickleball.com',
  password: 'admin123',
  phone: '0388888888',
  role: 'admin',
  registeredAt: '2026-05-21T00:00:00.000Z'
};
function getRegisteredUsers(){
  return JSON.parse(localStorage.getItem('pickleballUsers') || '[]');
}
function getUser(){
  return JSON.parse(localStorage.getItem('pickleballUser') || 'null');
}
function saveUser(user){
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('pickleballUsers', JSON.stringify(users));
  localStorage.setItem('pickleballUser', JSON.stringify(user));
}
function findUserByEmail(email){
  return getRegisteredUsers().find(user => user.email === email);
}
function ensureAdminUser(){
  const users = getRegisteredUsers();
  if (!users.some(user => user.email === defaultAdmin.email)) {
    users.push(defaultAdmin);
    localStorage.setItem('pickleballUsers', JSON.stringify(users));
  }
}
function isAdmin(){
  return localStorage.getItem('pickleballLoggedIn') === 'admin';
}
function isLoggedIn(){
  return localStorage.getItem('pickleballLoggedIn') === 'true' || isAdmin();
}
function isProtectedPage(){
  const path = window.location.pathname;
  return path.includes('/HTML/') && !path.endsWith('/login.html') && !path.endsWith('/register.html');
}
function ensureAuthPage(){
  ensureAdminUser();
  const path = window.location.pathname;
  if (path.includes('/HTML/admin-') && !isAdmin()) {
    window.location.href = 'login.html';
    return;
  }
  if (isProtectedPage() && !isLoggedIn()) {
    window.location.href = 'login.html';
  }
}
function initAuthForms(){
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const message = document.getElementById('registerMessage');
      if (!fullName || !email || !phone || password.length < 6) {
        if (message) message.textContent = 'Vui lòng nhập đầy đủ thông tin và mật khẩu ít nhất 6 ký tự.';
        return;
      }
      if (findUserByEmail(email)) {
        if (message) message.textContent = 'Email đã được sử dụng. Vui lòng chọn email khác.';
        return;
      }
      saveUser({ fullName, email, phone, password, role: 'user', registeredAt: new Date().toISOString() });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = 'login.html';
    });
  }
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const message = document.getElementById('loginMessage');
      if (email === defaultAdmin.email && password === defaultAdmin.password) {
        localStorage.setItem('pickleballLoggedIn', 'admin');
        localStorage.setItem('pickleballUser', JSON.stringify(defaultAdmin));
        window.location.href = 'admin-schedule.html';
        return;
      }
      const user = findUserByEmail(email);
      if (user && user.password === password) {
        localStorage.setItem('pickleballLoggedIn', 'true');
        localStorage.setItem('pickleballUser', JSON.stringify(user));
        window.location.href = 'courts.html';
      } else {
        if (message) message.textContent = 'Email hoặc mật khẩu không đúng.';
      }
    });
  }
}
function initProfile(){
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const detailName = document.getElementById('detailName');
  const detailEmail = document.getElementById('detailEmail');
  const detailPhone = document.getElementById('detailPhone');
  const avatar = document.querySelector('.profile-avatar');
  const user = getUser();
  if (user && profileName) {
    profileName.textContent = user.fullName;
    profileEmail.textContent = user.email;
    detailName.textContent = user.fullName;
    detailEmail.textContent = user.email;
    detailPhone.textContent = user.phone || '-';
    if (avatar) {
      avatar.textContent = user.fullName.split(' ').pop().charAt(0).toUpperCase();
    }
  }
}
function initLogout(){
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('pickleballLoggedIn');
      localStorage.removeItem('pickleballUser');
      window.location.href = 'login.html';
    });
  }
}
window.addEventListener('DOMContentLoaded', () => {
  ensureAuthPage();
  initAuthForms();
  initProfile();
  initLogout();
});
