function formatMoney(value){
  return Number(value).toLocaleString('vi-VN') + 'đ';
}
function getBookingHistory(){
  return JSON.parse(localStorage.getItem('bookingHistory') || '[]');
}
function getUsers(){
  return JSON.parse(localStorage.getItem('pickleballUsers') || '[]');
}
function getServices(){
  return JSON.parse(localStorage.getItem('bookingServices') || '[]');
}
function saveServices(services){
  localStorage.setItem('bookingServices', JSON.stringify(services));
}
function highlightAdminNav(){
  const path = window.location.pathname;
  document.querySelectorAll('.admin-sidebar nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (path.endsWith(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
function renderSchedule(){
  const bookings = getBookingHistory();
  const container = document.getElementById('scheduleList');
  const pendingCount = document.getElementById('pendingCount');
  if (!container) return;
  if (bookings.length === 0) {
    container.innerHTML = '<div class="admin-empty">Chưa có lịch đặt nào.</div>';
    if (pendingCount) pendingCount.textContent = '0';
    return;
  }
  if (pendingCount) pendingCount.textContent = String(bookings.length);
  container.innerHTML = bookings.slice().reverse().map(item => `
    <article class="schedule-card">
      <div class="schedule-row"><strong>${item.court.name}</strong><span>${new Date(item.date).toLocaleDateString('vi-VN')}</span></div>
      <div class="schedule-row"><span>Khung giờ</span><strong>${item.time}</strong></div>
      <div class="schedule-row"><span>Khách hàng</span><strong>${item.user?.fullName || 'Khách ẩn danh'}</strong></div>
      <div class="schedule-row"><span>Email</span><strong>${item.user?.email || '-'}</strong></div>
      <div class="schedule-row"><span>Dịch vụ</span><strong>${item.service?.name || 'Không'}</strong></div>
      <div class="schedule-row"><span>Tổng tiền</span><strong>${formatMoney(item.total)}</strong></div>
      <div class="schedule-actions"><button class="button button--danger" data-cancel="${item.id}">Hủy lịch</button></div>
    </article>`).join('');
  container.querySelectorAll('button[data-cancel]').forEach(btn => btn.addEventListener('click', () => {
    const bookings = getBookingHistory();
    const updated = bookings.filter(b => String(b.id) !== btn.dataset.cancel);
    localStorage.setItem('bookingHistory', JSON.stringify(updated));
    renderSchedule();
  }));
}
function renderRevenue(){
  const bookings = getBookingHistory();
  const totalRevenue = bookings.reduce((sum, item) => sum + (item.total || 0), 0);
  const count = bookings.length;
  const average = count ? Math.round(totalRevenue / count) : 0;
  const revenueTotal = document.getElementById('totalRevenue');
  const revenueCount = document.getElementById('revenueCount');
  const revenueAverage = document.getElementById('revenueAverage');
  if (revenueTotal) revenueTotal.textContent = formatMoney(totalRevenue);
  if (revenueCount) revenueCount.textContent = String(count);
  if (revenueAverage) revenueAverage.textContent = formatMoney(average);
  const chart = document.getElementById('revenueChart');
  if (!chart) return;
  const grouped = {};
  bookings.forEach(item => {
    const day = new Date(item.date).toLocaleDateString('vi-VN');
    grouped[day] = (grouped[day] || 0) + (item.total || 0);
  });
  const days = Object.keys(grouped).sort((a,b) => new Date(a) - new Date(b));
  chart.innerHTML = days.map(day => {
    const amount = grouped[day];
    const height = Math.min(100, Math.round((amount / Math.max(...Object.values(grouped), 1)) * 100));
    return `<div class="bar" style="height:${height}%"><span>${day}</span><strong>${formatMoney(amount)}</strong></div>`;
  }).join('');
}
function renderCustomers(){
  const allUsers = getUsers().filter(user => user.role !== 'admin');
  const searchInput = document.getElementById('customerSearch');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const users = query ? allUsers.filter(user => user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) : allUsers;
  const container = document.getElementById('customerList');
  const totalLabel = document.getElementById('customerTotal');
  const newLabel = document.getElementById('customerNew');
  const activeLabel = document.getElementById('customerActive');
  if (totalLabel) totalLabel.textContent = String(allUsers.length);
  if (newLabel) {
    const recent = allUsers.filter(user => {
      const registeredAt = new Date(user.registeredAt);
      return Date.now() - registeredAt.getTime() <= 7 * 24 * 60 * 60 * 1000;
    });
    newLabel.textContent = String(recent.length);
  }
  if (activeLabel) activeLabel.textContent = String(users.length);
  if (!container) return;
  if (users.length === 0) {
    container.innerHTML = '<div class="admin-empty">Chưa có khách hàng đăng ký.</div>';
    return;
  }
  container.innerHTML = users.map(user => `
    <article class="customer-card">
      <div><h3>${user.fullName}</h3><p>${user.email}</p><p>${user.phone || '-'}</p></div>
      <div class="customer-meta"><span>Đăng ký: ${new Date(user.registeredAt).toLocaleDateString('vi-VN')}</span></div>
    </article>`).join('');
}
function initServicesPage(){
  const services = getServices();
  const list = document.getElementById('serviceList');
  const form = document.getElementById('serviceForm');
  const nameInput = document.getElementById('serviceName');
  const descInput = document.getElementById('serviceDescription');
  const priceInput = document.getElementById('servicePrice');
  const message = document.getElementById('serviceMessage');
  const searchInput = document.getElementById('serviceSearch');
  const render = (items) => {
    if (!list) return;
    if (items.length === 0) {
      list.innerHTML = '<div class="admin-empty">Không có dịch vụ.</div>';
      return;
    }
    list.innerHTML = items.map(service => `
      <article class="service-card">
        <div>
          <h3>${service.name}</h3>
          <p>${service.description}</p>
        </div>
        <div class="service-meta"><strong>${formatMoney(service.price)}</strong><button class="button button--secondary" data-delete="${service.id}">Xóa</button></div>
      </article>`).join('');
    list.querySelectorAll('button[data-delete]').forEach(btn => btn.addEventListener('click', () => {
      const updated = getServices().filter(item => item.id !== btn.dataset.delete);
      saveServices(updated);
      render(updated);
    }));
  };
  render(services);
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      render(getServices().filter(item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)));
    });
  }
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const description = descInput.value.trim();
      const price = Number(priceInput.value);
      if (!name || !description || !(price > 0)) {
        if (message) message.textContent = 'Nhập đầy đủ tên, mô tả và giá dịch vụ.';
        return;
      }
      const current = getServices();
      current.push({id: `service-${Date.now()}`, name, description, price});
      saveServices(current);
      render(current);
      if (message) message.textContent = 'Đã thêm dịch vụ mới.';
      form.reset();
    });
  }
}
window.addEventListener('DOMContentLoaded', () => {
  highlightAdminNav();
  if (document.getElementById('scheduleList')) { renderSchedule(); }
  if (document.getElementById('totalRevenue')) { renderRevenue(); }
  if (document.getElementById('customerList')) {
    renderCustomers();
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) customerSearch.addEventListener('input', renderCustomers);
  }
  if (document.getElementById('serviceList')) { initServicesPage(); }
});
