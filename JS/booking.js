const courtData = [
  {id:'court1',name:'Sân Pickleball Cầu Giấy',address:'36 Thái Hà, Hà Nội',price:120000,tag:'Phổ biến',rating:'4.9',description:'Sân tiêu chuẩn với mặt sân chất lượng cao, phục vụ 4 người.'},
  {id:'court2',name:'Pickleball Cầu Giấy - Sân 2',address:'36 Thái Hà, Hà Nội',price:100000,tag:'Gần bạn',rating:'4.7',description:'Sân rộng rãi, phù hợp nhóm nhỏ và luyện tập hàng ngày.'},
  {id:'court3',name:'Pickleball Long Biên',address:'Số 7 Nguyễn Văn Cừ, Hà Nội',price:110000,tag:'Sân mới',rating:'4.8',description:'Sân mới, thiết kế đẹp, ánh sáng tốt cho buổi tối.'},
  {id:'court4',name:'Pickleball Hoàng Mai',address:'10 Linh Nam, Hà Nội',price:90000,tag:'Tiết kiệm',rating:'4.6',description:'Giá mềm, gần khu dân cư, phù hợp đặt sân cuối tuần.'}
];
const defaultServices = [
  {id:'service1',name:'Thuê vợt',description:'Bộ 2 vợt và 4 quả bóng chính hãng.',price:15000},
  {id:'service2',name:'Thuê giày',description:'Giày thể thao size chuẩn, an toàn khi di chuyển.',price:10000},
  {id:'service3',name:'Hướng dẫn viên',description:'Hướng dẫn viên chuyên nghiệp hỗ trợ 1 giờ.',price:80000}
];
function getServices(){
  const stored = JSON.parse(localStorage.getItem('bookingServices') || 'null');
  if (Array.isArray(stored) && stored.length) return stored;
  localStorage.setItem('bookingServices', JSON.stringify(defaultServices));
  return defaultServices;
}
function saveServices(services){
  localStorage.setItem('bookingServices', JSON.stringify(services));
}
function renderCourtList(filter='all', query=''){
  const container = document.getElementById('courtList');
  if (!container) return;
  const filtered = courtData.filter(c => {
    const matchedQuery = query ? c.name.toLowerCase().includes(query.toLowerCase()) || c.address.toLowerCase().includes(query.toLowerCase()) : true;
    return matchedQuery && (filter === 'all' || c.tag.toLowerCase().includes(filter) || (filter === 'nearby' && c.tag === 'Gần bạn') || (filter === 'popular' && c.tag === 'Phổ biến'));
  });
  if (filtered.length === 0) {
    container.innerHTML = '<div class="history-item"><div>Không tìm thấy sân phù hợp.</div></div>';
    return;
  }
  container.innerHTML = filtered.map(c => `
    <article class="court-card">
      <div class="court-photo"></div>
      <div class="court-meta">
        <h3>${c.name}</h3>
        <p>${c.address}</p>
        <p>${c.description}</p>
        <div class="court-price">${c.price.toLocaleString()}đ/giờ · ${c.rating} ★</div>
      </div>
      <button class="button button--primary" data-court="${c.id}">Xem chi tiết</button>
    </article>`).join('');
  container.querySelectorAll('button[data-court]').forEach(btn => btn.addEventListener('click', () => {
    const selected = courtData.find(c => c.id === btn.dataset.court);
    localStorage.setItem('selectedCourt', JSON.stringify(selected));
    window.location.href = 'court-detail.html';
  }));
}
function initCourtFilters(){
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(btn => btn.classList.remove('active'));
    chip.classList.add('active');
    renderCourtList(chip.dataset.filter, document.getElementById('searchInput').value);
  }));
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const active = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
      renderCourtList(active, searchInput.value);
    });
  }
}
function initCourtDetail(){
  const court = JSON.parse(localStorage.getItem('selectedCourt') || 'null');
  const container = document.getElementById('detailCourt');
  if (!court || !container) {
    if (container) container.innerHTML = '<p>Chưa chọn sân. Quay lại <a href="courts.html">Danh sách sân</a>.</p>';
    return;
  }
  container.innerHTML = `
    <div class="booking-card">
      <h2>${court.name}</h2>
      <p>${court.address}</p>
      <p>${court.description}</p>
      <div class="court-price">${court.price.toLocaleString()}đ/giờ · ${court.rating} ★</div>
      <div class="summary-row"><span>Tag</span><span>${court.tag}</span></div>
      <div class="summary-row"><span>Thời gian hoạt động</span><span>08:00 - 22:00</span></div>
      <button id="goToBooking" class="button button--primary">Đặt sân ngay</button>
    </div>`;
  document.getElementById('goToBooking').addEventListener('click', () => {
    window.location.href = 'booking.html';
  });
}
function initBookingPage(){
  const court = JSON.parse(localStorage.getItem('selectedCourt') || 'null');
  const container = document.getElementById('selectedCourt');
  if (!court || !container) {
    if (container) container.innerHTML = '<p>Chưa chọn sân. Quay lại <a href="courts.html">Danh sách sân</a>.</p>';
    return;
  }
  const services = getServices();
  container.innerHTML = `
    <h2>${court.name}</h2>
    <p>${court.address}</p>
    <p>${court.description}</p>
    <div class="court-price">${court.price.toLocaleString()}đ/giờ</div>`;
  const dateSelect = document.getElementById('dateSelect');
  const serviceSelect = document.getElementById('serviceSelect');
  const dates = [];
  for (let i = 0; i < 7; i++) { const day = new Date(); day.setDate(day.getDate() + i); dates.push(day); }
  dateSelect.innerHTML = dates.map(d => `<option value="${d.toISOString().slice(0,10)}">${d.toLocaleDateString('vi-VN')}</option>`).join('');
  serviceSelect.innerHTML = services.map(service => `<option value="${service.id}">${service.name} (+${service.price.toLocaleString()}đ)</option>`).join('');
  const slotGrid = document.getElementById('slotGrid');
  const slots = ['08:00 - 09:00','09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 13:00','13:00 - 14:00','14:00 - 15:00'];
  slotGrid.innerHTML = slots.map((slot,index) => `<button class="slot-item ${index===0?'active':''}" type="button">${slot}</button>`).join('');
  const summaryCourt = document.getElementById('summaryCourt');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryService = document.getElementById('summaryService');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryTotal = document.getElementById('summaryTotal');
  const continueButton = document.getElementById('continueBooking');
  const getSelectedService = () => services.find(item => item.id === serviceSelect.value) || {name:'Không chọn',price:0};
  const updateSummary = () => {
    const active = slotGrid.querySelector('.slot-item.active');
    const selectedService = getSelectedService();
    const totalPrice = court.price + selectedService.price;
    summaryCourt.textContent = court.name;
    summaryDate.textContent = dateSelect.options[dateSelect.selectedIndex].text;
    summaryTime.textContent = active ? active.textContent : '-';
    summaryService.textContent = selectedService.name;
    summaryPrice.textContent = `${court.price.toLocaleString()}đ`;
    if (summaryTotal) summaryTotal.textContent = `${totalPrice.toLocaleString()}đ`;
    continueButton.disabled = !active;
    localStorage.setItem('bookingDraft', JSON.stringify({court,date:dateSelect.value,time:active?active.textContent:'',price:court.price,service:selectedService,servicePrice:selectedService.price,total:totalPrice}));
  };
  slotGrid.querySelectorAll('.slot-item').forEach(btn => btn.addEventListener('click', () => { slotGrid.querySelectorAll('.slot-item').forEach(x => x.classList.remove('active')); btn.classList.add('active'); updateSummary(); }));
  dateSelect.addEventListener('change', updateSummary);
  serviceSelect.addEventListener('change', updateSummary);
  updateSummary();
  continueButton.addEventListener('click', () => { window.location.href = 'payment.html'; });
}
function initPaymentPage(){
  const draft = JSON.parse(localStorage.getItem('bookingDraft') || 'null');
  if (!draft) return;
  document.getElementById('payCourt').textContent = draft.court.name;
  document.getElementById('payDate').textContent = new Date(draft.date).toLocaleDateString('vi-VN');
  document.getElementById('payTime').textContent = draft.time;
  document.getElementById('payService').textContent = draft.service?.name || 'Không chọn';
  document.getElementById('payAmount').textContent = `${draft.price.toLocaleString()}đ`;
  document.getElementById('payServiceFee').textContent = `${(draft.servicePrice || 0).toLocaleString()}đ`;
  document.getElementById('payTotal').textContent = `${draft.total.toLocaleString()}đ`;
  document.getElementById('successCourt').textContent = draft.court.name;
  document.getElementById('successDate').textContent = new Date(draft.date).toLocaleDateString('vi-VN');
  document.getElementById('successTime').textContent = draft.time;
  document.getElementById('successService').textContent = draft.service?.name || 'Không chọn';
  document.getElementById('successAmount').textContent = `${draft.total.toLocaleString()}đ`;
  document.getElementById('payButton').addEventListener('click', () => {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!method) return;
    const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const user = JSON.parse(localStorage.getItem('pickleballUser') || 'null');
    history.push({...draft, method, id: Date.now(), user });
    localStorage.setItem('bookingHistory', JSON.stringify(history));
    document.getElementById('paymentMessage').textContent = 'Thanh toán thành công!';
    document.getElementById('paymentSuccess').classList.remove('hidden');
  });
}
function renderHistory(){
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const container = document.getElementById('historyList');
  if (!container) return;
  if (history.length === 0) {
    container.innerHTML = '<div class="history-item"><div>Chưa có lịch đặt nào.</div></div>';
    return;
  }
  container.innerHTML = history.slice().reverse().map(item => `
    <article class="history-item">
      <div class="history-meta">
        <h3>${item.court.name}</h3>
        <span>${new Date(item.date).toLocaleDateString('vi-VN')} · ${item.time}</span>
        <span>${item.court.address}</span>
        <span>Dịch vụ: ${item.service?.name || 'Không chọn'}</span>
        <span>Thanh toán: ${item.method} · ${item.total.toLocaleString()}đ</span>
      </div>
      <div class="history-actions"><button class="button button--secondary" data-cancel="${item.id}">Hủy</button></div>
    </article>`).join('');
  container.querySelectorAll('button[data-cancel]').forEach(btn => btn.addEventListener('click', () => {
    localStorage.setItem('cancelBookingId', btn.dataset.cancel);
    window.location.href = 'cancel-booking.html';
  }));
}
function initCancelPage(){
  const cancelId = localStorage.getItem('cancelBookingId');
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const item = history.find(b => String(b.id) === cancelId);
  const container = document.getElementById('cancelInfo');
  const confirm = document.getElementById('cancelConfirm');
  if (!item || !container || !confirm) return;
  container.innerHTML = `
    <h2>Bạn có chắc chắn muốn hủy?</h2>
    <div><span>Sân</span><span>${item.court.name}</span></div>
    <div><span>Ngày</span><span>${new Date(item.date).toLocaleDateString('vi-VN')}</span></div>
    <div><span>Giờ</span><span>${item.time}</span></div>
    <div><span>Dịch vụ</span><span>${item.service?.name || 'Không chọn'}</span></div>
    <div><span>Giá</span><span>${item.total.toLocaleString()}đ</span></div>`;
  confirm.addEventListener('click', () => {
    const updated = history.filter(b => String(b.id) !== cancelId);
    localStorage.setItem('bookingHistory', JSON.stringify(updated));
    window.location.href = 'booking-history.html';
  });
}
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('courtList')) { initCourtFilters(); renderCourtList(); }
  if (document.getElementById('detailCourt')) { initCourtDetail(); }
  if (document.getElementById('selectedCourt')) { initBookingPage(); }
  if (document.getElementById('payButton')) { initPaymentPage(); }
  if (document.getElementById('historyList')) { renderHistory(); }
  if (document.getElementById('cancelInfo')) { initCancelPage(); }
});
