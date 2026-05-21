function saveUser(user){localStorage.setItem('pickleballUser', JSON.stringify(user));}
function getUser(){return JSON.parse(localStorage.getItem('pickleballUser')||'null');}
function initAuthForms(){
  const registerForm=document.getElementById('registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', e=>{
      e.preventDefault();
      const fullName=document.getElementById('fullName').value.trim();
      const email=document.getElementById('email').value.trim();
      const phone=document.getElementById('phone').value.trim();
      const password=document.getElementById('password').value;
      if(fullName && email && phone && password.length>=6){
        saveUser({fullName,email,phone});
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        window.location.href='login.html';
      }
    });
  }
  const loginForm=document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email=document.getElementById('loginEmail').value.trim();
      const password=document.getElementById('loginPassword').value;
      const user=getUser();
      const message=document.getElementById('loginMessage');
      if(user && user.email===email && password.length>=6){
        localStorage.setItem('pickleballLoggedIn','true');
        window.location.href='../HTML/courts.html';
      } else {
        message.textContent='Email hoặc mật khẩu không đúng.';
      }
    });
  }
}
function initProfile(){
  const profileName=document.getElementById('profileName');
  const profileEmail=document.getElementById('profileEmail');
  const detailName=document.getElementById('detailName');
  const detailEmail=document.getElementById('detailEmail');
  const detailPhone=document.getElementById('detailPhone');
  const user=getUser();
  if(user && profileName){
    profileName.textContent=user.fullName;
    profileEmail.textContent=user.email;
    detailName.textContent=user.fullName;
    detailEmail.textContent=user.email;
    detailPhone.textContent=user.phone;
  }
}
window.addEventListener('DOMContentLoaded', ()=>{initAuthForms();initProfile();});
