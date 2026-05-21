function formatMoney(value){
  return Number(value).toLocaleString('vi-VN') + 'đ';
}
function getBookingHistory(){
  return JSON.parse(localStorage.getItem('bookingHistory') || '[]');
}
function saveBookingHistory(bookings){
  localStorage.setItem('bookingHistory', JSON.stringify(bookings));
}
function getBookingStatus(item){
  return item.status || 'pending';
}
function formatBookingStatus(status){
  if (status === 'confirmed') return 'Đã xác nhận';
  if (status === 'cancelled') return 'Đã huỷ';
  return 'Chờ xác nhận';
}
const adminCourts = ['Sân A1', 'Sân A2', 'Sân B1', 'Sân B2'];
const adminDefaultSlots = ['06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00'];
function getAdminSlots(){
  const saved = JSON.parse(localStorage.getItem('adminTimeSlots') || 'null');
  if (Array.isArray(saved) && saved.length) return Array.from(new Set([...adminDefaultSlots, ...saved]));
  return adminDefaultSlots;
}
function addAdminSlot(slot){
  const clean = slot.trim();
  if (!clean) return;
  const slots = Array.from(new Set([...getAdminSlots(), clean]));
  localStorage.setItem('adminTimeSlots', JSON.stringify(slots));
}
function getSelectedDate(){
  const stored = localStorage.getItem('adminSelectedScheduleDate');
  if (stored) return new Date(stored);
  return new Date();
}
function setSelectedDate(date){
  localStorage.setItem('adminSelectedScheduleDate', date.toISOString());
}
function formatDateLabel(date){
  const dayMap = ['CN', 'T2','T3','T4','T5','T6','T7'];
  return `${dayMap[date.getDay()]} ${date.getDate()}/${date.getMonth()+1}`;
}
function getScheduleDays(){
  const base = getSelectedDate();
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return Array.from({length: 5}, (_,index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index + 1);
    return d;
  });
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
function filterScheduleBookings(bookings, period, status){
  const now = new Date();
  return bookings.filter(item => {
    const date = new Date(item.date);
    if (period === 'today') {
      if (date.toDateString() !== now.toDateString()) return false;
    }
    if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      if (!(date >= startOfWeek && date <= endOfWeek)) return false;
    }
    if (status && status !== 'all' && item.status !== status) {
      return false;
    }
    return true;
  });
}
function updateBookingStatus(id, status){
  const bookings = getBookingHistory();
  const updated = bookings.map(item => item.id === Number(id) || item.id === id ? {...item, status} : item);
  saveBookingHistory(updated);
  return updated;
}
function renderSchedule(){
  const bookings = getBookingHistory().map(item => ({...item, status: getBookingStatus(item)}));
  const container = document.getElementById('scheduleList');
  const pendingCount = document.getElementById('pendingCount');
  const filter = document.getElementById('scheduleFilter')?.value || 'all';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  if (!container) return;
  const visibleBookings = filterScheduleBookings(bookings, filter, statusFilter);
  const pendingBookings = bookings.filter(item => item.status === 'pending');
  if (visibleBookings.length === 0) {
    container.innerHTML = '<div class="admin-empty">Không có lịch đặt phù hợp.</div>';
    if (pendingCount) pendingCount.textContent = String(pendingBookings.length);
    return;
  }
  if (pendingCount) pendingCount.textContent = String(pendingBookings.length);
  const statusOrder = {pending: 0, confirmed: 1, cancelled: 2};
  visibleBookings.sort((a,b) => statusOrder[a.status] - statusOrder[b.status] || new Date(a.date) - new Date(b.date));
  container.innerHTML = visibleBookings.map(item => {
    const isPending = item.status === 'pending';
    const badge = `<span class="status-pill status-pill--${item.status}">${formatBookingStatus(item.status)}</span>`;
    const actions = isPending ? `
      <button class="button button--primary" data-confirm="${item.id}">Xác nhận đặt sân</button>
      <button class="button button--danger" data-reject="${item.id}">Từ chối đặt sân</button>` :
      `<button class="button button--secondary" disabled>${item.status === 'confirmed' ? 'Đã xác nhận' : 'Đã huỷ'}</button>`;
    return `
      <article class="schedule-card">
        <div class="schedule-header">
          <div>
            <h3>${item.user?.fullName || 'Khách ẩn danh'}</h3>
            <p class="schedule-meta">${item.user?.email || '-'} · ${item.user?.phone || '-'}</p>
          </div>
          <div class="schedule-tag">${badge}</div>
        </div>
        <div class="schedule-row"><span>Mã đặt</span><strong>${item.id}</strong></div>
        <div class="schedule-row"><span>Sân</span><strong>${item.court.name}</strong></div>
        <div class="schedule-row"><span>Ngày</span><strong>${new Date(item.date).toLocaleDateString('vi-VN')}</strong></div>
        <div class="schedule-row"><span>Giờ</span><strong>${item.time}</strong></div>
        <div class="schedule-row"><span>Dịch vụ</span><strong>${item.service?.name || 'Không'}</strong></div>
        <div class="schedule-row"><span>Thanh toán</span><strong>${item.method || '-'}</strong></div>
        <div class="schedule-row"><span>Tổng</span><strong>${formatMoney(item.total)}</strong></div>
        <div class="schedule-actions">${actions}</div>
      </article>`;
  }).join('');
  container.querySelectorAll('button[data-confirm]').forEach(btn => btn.addEventListener('click', () => {
    updateBookingStatus(btn.dataset.confirm, 'confirmed');
    renderSchedule();
  }));
  container.querySelectorAll('button[data-reject]').forEach(btn => btn.addEventListener('click', () => {
    updateBookingStatus(btn.dataset.reject, 'cancelled');
    renderSchedule();
  }));
}
function renderRevenue(){
  const bookings = getBookingHistory().filter(b => (b.status || 'pending') === 'confirmed');
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
  const maxVal = Math.max(...Object.values(grouped), 1);
  chart.innerHTML = days.map(day => {
    const amount = grouped[day];
    const height = Math.min(100, Math.round((amount / maxVal) * 100));
    return `<div class="bar" style="height:${height}%"><div class="bar-amount">${formatMoney(amount)}</div><span class="bar-label">${day}</span></div>`;
  }).join('');
}

function initAdminProfile(){
  const profile = document.getElementById('adminProfile');
  const menu = document.getElementById('adminProfileMenu');
  const avatar = profile?.querySelector('.profile-avatar');
  const nameEl = profile?.querySelector('.profile-name');
  const user = JSON.parse(localStorage.getItem('pickleballUser') || 'null');
  if (user) {
    if (avatar) avatar.textContent = (user.fullName || 'A').split(' ').pop().charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.fullName || 'Admin';
  }
  if (!profile || !menu) return;
  profile.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });
  document.addEventListener('click', () => menu.classList.add('hidden'));
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('pickleballLoggedIn');
      localStorage.removeItem('pickleballUser');
      window.location.href = 'login.html';
    });
  }
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
  if (document.getElementById('scheduleList')) {
    renderSchedule();
    const scheduleFilter = document.getElementById('scheduleFilter');
    const courtFilter = document.getElementById('courtFilter');
    const addSlotButton = document.getElementById('addSlot');
    const scheduleTabs = document.getElementById('scheduleTabs');
    const statusFilter = document.getElementById('statusFilter');
    if (scheduleFilter) scheduleFilter.addEventListener('change', renderSchedule);
    if (courtFilter) courtFilter.addEventListener('change', renderSchedule);
    if (statusFilter) statusFilter.addEventListener('change', renderSchedule);
    if (addSlotButton) addSlotButton.addEventListener('click', () => {
      const slot = window.prompt('Nhập khung giờ mới (vd: 14:00 - 15:00)');
      if (slot && slot.trim()) {
        addAdminSlot(slot.trim());
        renderSchedule();
      }
    });
    if (scheduleTabs) {
      const days = getScheduleDays();
      scheduleTabs.innerHTML = days.map(day => `
        <button class="button button--tab" data-date="${day.toISOString().slice(0,10)}">${formatDateLabel(day)}</button>
      `).join('');
      scheduleTabs.querySelectorAll('button[data-date]').forEach(btn => {
        if (btn.dataset.date === getSelectedDate().toISOString().slice(0,10)) btn.classList.add('active');
        btn.addEventListener('click', () => {
          setSelectedDate(new Date(btn.dataset.date));
          scheduleTabs.querySelectorAll('button[data-date]').forEach(x => x.classList.remove('active'));
          btn.classList.add('active');
          renderSchedule();
        });
      });
    }
  }
  if (document.getElementById('totalRevenue')) { renderRevenue(); }
  initAdminProfile();
  if (document.getElementById('customerList')) {
    renderCustomers();
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) customerSearch.addEventListener('input', renderCustomers);
  }
  if (document.getElementById('serviceList')) { initServicesPage(); }
});
