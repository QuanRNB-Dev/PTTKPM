const courtData = [
  {id:'court1',name:'Sân A1',address:'Sân đơn · 80.000đ/h',price:80000,tag:'Phổ biến',rating:'4.9',status:'Còn trống',description:'Sân đơn tiêu chuẩn, phù hợp cho 1-2 người.'},
  {id:'court2',name:'Sân A2',address:'Sân đơn · 80.000đ/h',price:80000,tag:'Gần bạn',rating:'4.7',status:'Đã đặt',description:'Sân đơn gần trung tâm, phù hợp đặt trước.'},
  {id:'court3',name:'Sân B1',address:'Sân đôi · 120.000đ/h',price:120000,tag:'Sân mới',rating:'4.8',status:'Còn trống',description:'Sân đôi rộng rãi, phù hợp nhóm 4 người.'},
  {id:'court4',name:'Sân B2',address:'Sân đôi · 120.000đ/h',price:120000,tag:'Tiết kiệm',rating:'4.6',status:'Sắp đặt',description:'Sân đôi với mức giá tốt cho cuối tuần.'}
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
    const statusMatch = filter === 'all'
      || (filter === 'available' && c.status === 'Còn trống')
      || (filter === 'booked' && c.status !== 'Còn trống');
    return matchedQuery && statusMatch;
  });
  if (filtered.length === 0) {
    container.innerHTML = '<div class="history-item"><div>Không tìm thấy sân phù hợp.</div></div>';
    return;
  }
  container.innerHTML = filtered.map(c => {
    const statusClass = c.status === 'Còn trống' ? 'court-status--available' : c.status === 'Đã đặt' ? 'court-status--booked' : 'court-status--upcoming';
    return `
      <article class="court-card">
        <div class="court-photo"></div>
        <div class="court-meta">
          <div class="court-details">
            <div class="court-status ${statusClass}">${c.status}</div>
            <h3>${c.name}</h3>
            <p>${c.address}</p>
            <p class="court-description">${c.description}</p>
          </div>
          <div class="court-price">${c.price.toLocaleString()}đ/giờ · ${c.rating} ★</div>
        </div>
        <button class="button button--primary" data-court="${c.id}">Đặt sân ngay</button>
      </article>`;
  }).join('');
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
  const searchButton = document.querySelector('.search-button');
  const update = () => {
    const active = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
    renderCourtList(active, searchInput ? searchInput.value : '');
  };
  if (searchInput) {
    searchInput.addEventListener('input', update);
  }
  if (searchButton) {
    searchButton.addEventListener('click', update);
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
  const storedCourt = JSON.parse(localStorage.getItem('selectedCourt') || 'null');
  const defaultCourt = courtData[0];
  let activeCourt = storedCourt || defaultCourt;
  const courtSelect = document.getElementById('courtSelect');
  const selectedCourtContainer = document.getElementById('selectedCourt');
  const dateSelect = document.getElementById('dateSelect');
  const serviceSelect = document.getElementById('serviceSelect');
  const services = getServices();
  const slotGrid = document.getElementById('slotGrid');
  const summaryCourt = document.getElementById('summaryCourt');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryTotalInline = document.getElementById('summaryTotalInline');
  const selectedSummaryText = document.getElementById('selectedSummaryText');
  const continueButton = document.getElementById('continueBooking');

  const updateSummary = () => {
    const activeSlot = slotGrid ? slotGrid.querySelector('.slot-item.active') : null;
    const selectedService = serviceSelect ? services.find(item => item.id === serviceSelect.value) || {name:'Không chọn',price:0} : {name:'Không chọn',price:0};
    const totalPrice = activeCourt.price + selectedService.price;
    const formattedDate = dateSelect ? new Date(dateSelect.value).toLocaleDateString('vi-VN') : '-';
    if (summaryCourt) summaryCourt.textContent = activeCourt.name;
    if (summaryDate) summaryDate.textContent = formattedDate;
    if (summaryTime) summaryTime.textContent = activeSlot ? activeSlot.textContent : '-';
    if (summaryPrice) summaryPrice.textContent = `${activeCourt.price.toLocaleString()}đ`;
    if (summaryTotal) summaryTotal.textContent = `${totalPrice.toLocaleString()}đ`;
    if (summaryTotalInline) summaryTotalInline.textContent = `${totalPrice.toLocaleString()}đ`;
    if (selectedSummaryText) selectedSummaryText.textContent = `Sân: ${activeCourt.name} · Ngày: ${formattedDate} · Giờ: ${activeSlot ? activeSlot.textContent : '-'}`;
    if (continueButton) continueButton.disabled = !activeSlot;
    if (slotGrid) {
      localStorage.setItem('bookingDraft', JSON.stringify({
        court: activeCourt,
        date: dateSelect ? dateSelect.value : '',
        time: activeSlot ? activeSlot.textContent : '',
        price: activeCourt.price,
        service: selectedService,
        servicePrice: selectedService.price,
        total: totalPrice
      }));
    }
  };

  const updateSelectedCourt = () => {
    if (selectedCourtContainer) {
      selectedCourtContainer.innerHTML = `
        <h2>${activeCourt.name}</h2>
        <p>${activeCourt.address}</p>
        <p>${activeCourt.description}</p>
        <div class="court-price">${activeCourt.price.toLocaleString()}đ/giờ</div>`;
    }
    if (courtSelect) courtSelect.value = activeCourt.id;
    updateSummary();
  };

  if (courtSelect) {
    courtSelect.innerHTML = courtData.map(c => `<option value="${c.id}">${c.name} (${c.address})</option>`).join('');
    courtSelect.value = activeCourt.id;
    courtSelect.addEventListener('change', () => {
      activeCourt = courtData.find(c => c.id === courtSelect.value) || defaultCourt;
      localStorage.setItem('selectedCourt', JSON.stringify(activeCourt));
      updateSelectedCourt();
    });
  }

  if (serviceSelect) {
    serviceSelect.innerHTML = services.map(service => `<option value="${service.id}">${service.name} (+${service.price.toLocaleString()}đ)</option>`).join('');
  }

  if (dateSelect) {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(today.getDate() + i);
      dates.push(day);
    }
    dateSelect.value = dates[0].toISOString().slice(0,10);
  }

  if (slotGrid) {
    const slots = ['06:00 - 07:00','07:00 - 08:00','08:00 - 09:00','09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 13:00','13:00 - 14:00'];
    slotGrid.innerHTML = slots.map((slot, index) => `<button class="slot-item ${index===0 ? 'active' : ''}" type="button">${slot}</button>`).join('');
    slotGrid.querySelectorAll('.slot-item').forEach(btn => btn.addEventListener('click', () => {
      slotGrid.querySelectorAll('.slot-item').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      updateSummary();
    }));
  }

  if (dateSelect) dateSelect.addEventListener('change', updateSummary);
  if (serviceSelect) serviceSelect.addEventListener('change', updateSummary);
  if (continueButton) continueButton.addEventListener('click', () => { window.location.href = 'payment.html'; });

  updateSelectedCourt();
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
function parseBookingDate(item){
  if (!item?.date) return new Date(NaN);
  const [year, month, day] = item.date.split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  const [hour = 0, minute = 0] = item.time ? item.time.split(' - ')[0].split(':').map(Number) : [];
  return new Date(year, month - 1, day, hour, minute);
}

function renderHistory(filter = 'all'){
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const container = document.getElementById('historyList');
  if (!container) return;
  const now = new Date();
  const filtered = history.slice().reverse().filter(item => {
    const itemDate = parseBookingDate(item);
    const validDate = !Number.isNaN(itemDate.getTime());
    if (filter === 'upcoming') return validDate ? itemDate >= now : true;
    if (filter === 'past') return validDate ? itemDate < now : false;
    return true;
  });
  if (filtered.length === 0) {
    container.innerHTML = '<div class="history-empty"><p>Không có lịch đặt phù hợp.</p></div>';
    return;
  }
  container.innerHTML = filtered.map(item => {
    const itemDate = parseBookingDate(item);
    const status = !Number.isNaN(itemDate.getTime()) && itemDate >= now ? 'upcoming' : 'past';
    const statusLabel = status === 'upcoming' ? 'Sắp tới' : 'Đã qua';
    const statusClass = status === 'upcoming' ? 'history-status-upcoming' : 'history-status-past';
    return `
      <article class="history-item-card">
        <div class="history-item-top">
          <div>
            <div class="history-item-title">${item.court.name}</div>
            <div class="history-item-subtitle">${item.court.address}</div>
          </div>
          <div class="history-item-status ${statusClass}">${statusLabel}</div>
        </div>
        <div class="history-item-details">
          <div>Ngày: ${new Date(item.date).toLocaleDateString('vi-VN')}</div>
          <div>Khung giờ: ${item.time}</div>
          <div>Thanh toán: ${item.method}</div>
        </div>
        <div class="history-item-footer">
          <div class="history-price">${item.total.toLocaleString()}đ</div>
          <div class="history-actions"><button class="button button--secondary" data-cancel="${item.id}">Hủy</button></div>
        </div>
      </article>`;
  }).join('');
  container.querySelectorAll('button[data-cancel]').forEach(btn => btn.addEventListener('click', () => {
    localStorage.setItem('cancelBookingId', btn.dataset.cancel);
    window.location.href = 'cancel-booking.html';
  }));
}
function initHistoryTabs(){
  const tabButtons = document.querySelectorAll('.history-tab');
  tabButtons.forEach(button => {
    const filter = button.dataset.filter;
    if (filter === 'all') button.classList.add('active');
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderHistory(filter);
    });
  });
}
function initCancelPage(){
  const cancelId = localStorage.getItem('cancelBookingId');
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const item = history.find(b => String(b.id) === cancelId);
  const container = document.getElementById('cancelInfo');
  const confirm = document.getElementById('cancelConfirm');
  if (!item || !container || !confirm) return;
  container.innerHTML = `
    <div class="cancel-card-inner">
      <div class="cancel-alert">
        <div class="cancel-alert-top">
          <div class="cancel-alert-icon">!</div>
          <div>
            <h2 class="cancel-alert-title">Xác nhận hủy sân</h2>
            <p class="cancel-alert-text">Sân: ${item.court.name} · ${new Date(item.date).toLocaleDateString('vi-VN')} · ${item.time}</p>
          </div>
        </div>
      </div>
      <div class="cancel-info-box">
        <div class="cancel-info-row"><span>Mã đặt</span><strong>${item.id}</strong></div>
        <div class="cancel-info-row"><span>Sân</span><strong>${item.court.name}</strong></div>
        <div class="cancel-info-row"><span>Ngày</span><strong>${new Date(item.date).toLocaleDateString('vi-VN')}</strong></div>
        <div class="cancel-info-row"><span>Giờ</span><strong>${item.time}</strong></div>
        <div class="cancel-info-row"><span>Giá</span><strong>${item.total.toLocaleString()}đ</strong></div>
      </div>
      <label class="cancel-field">
        <span>Lý do hủy</span>
        <select id="cancelReason">
          <option value="">Chọn lý do</option>
          <option value="Bận đột xuất">Bận đột xuất</option>
          <option value="Thời tiết xấu">Thời tiết xấu</option>
          <option value="Đổi kế hoạch">Đổi kế hoạch</option>
          <option value="Khác">Khác</option>
        </select>
      </label>
      <label class="cancel-field">
        <span>Ghi chú thêm</span>
        <textarea id="cancelNote" placeholder="Nhập lý do cụ thể..."></textarea>
      </label>
      <div class="cancel-policy">
        <strong>Chính sách hủy:</strong>
        <ul>
          <li>Hủy trước 24h: hoàn tiền 100%</li>
          <li>Hủy trước 2h: hoàn 50%</li>
          <li>Hủy trong 2h: không hoàn tiền</li>
        </ul>
      </div>
    </div>`;
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
  if (document.getElementById('historyList')) { renderHistory(); initHistoryTabs(); }
  if (document.getElementById('cancelInfo')) { initCancelPage(); }
});
