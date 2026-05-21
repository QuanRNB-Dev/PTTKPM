const courtData=[
  {id:'court1',name:'Sân Pickleball Cầu Giấy',address:'36 Thái Hà, Hà Nội',price:120000,tag:'Phổ biến',rating:'4.9'},
  {id:'court2',name:'Pickleball Cầu Giấy - Sân 2',address:'36 Thái Hà, Hà Nội',price:100000,tag:'Gần bạn',rating:'4.7'},
  {id:'court3',name:'Pickleball Long Biên',address:'Số 7 Nguyễn Văn Cừ, Hà Nội',price:110000,tag:'Sân mới',rating:'4.8'},
  {id:'court4',name:'Pickleball Hoàng Mai',address:'10 Linh Nam, Hà Nội',price:90000,tag:'Tiết kiệm',rating:'4.6'}
];
function renderCourtList(filter='all', query=''){
  const container=document.getElementById('courtList');
  if(!container) return;
  const filtered=courtData.filter(c=>{
    const matchedQuery=query? c.name.toLowerCase().includes(query.toLowerCase())||c.address.toLowerCase().includes(query.toLowerCase()) : true;
    return matchedQuery && (filter==='all' || c.tag.toLowerCase().includes(filter) || (filter==='nearby' && c.tag==='Gần bạn') || (filter==='popular' && c.tag==='Phổ biến'));
  });
  container.innerHTML=filtered.map(c=>`<article class="court-card"><div class="court-photo"></div><div class="court-meta"><h3>${c.name}</h3><p>${c.address}</p><div class="court-price">${c.price.toLocaleString()}đ/giờ · ${c.rating} ★</div></div><button class="button button--primary" data-court="${c.id}">Xem chi tiết</button></article>`).join('');
  container.querySelectorAll('button[data-court]').forEach(btn=>btn.addEventListener('click', ()=>{
    const selected=courtData.find(c=>c.id===btn.dataset.court);
    localStorage.setItem('selectedCourt', JSON.stringify(selected));
    window.location.href='booking.html';
  }));
}
function initCourtFilters(){
  const chips=document.querySelectorAll('.filter-chip');
  chips.forEach(chip=>chip.addEventListener('click', ()=>{
    chips.forEach(btn=>btn.classList.remove('active'));
    chip.classList.add('active');
    renderCourtList(chip.dataset.filter, document.getElementById('searchInput').value);
  }));
  const searchInput=document.getElementById('searchInput');
  if(searchInput){
    searchInput.addEventListener('input', ()=>{
      const active=document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
      renderCourtList(active, searchInput.value);
    });
  }
}
function initBookingPage(){
  const court=JSON.parse(localStorage.getItem('selectedCourt')||'null');
  if(!court){document.getElementById('selectedCourt').innerHTML='<p>Chưa chọn sân. Quay lại <a href="courts.html">Danh sách sân</a>.</p>'; return;}
  document.getElementById('selectedCourt').innerHTML=`<h2>${court.name}</h2><p>${court.address}</p><div class="court-price">${court.price.toLocaleString()}đ/giờ</div>`;
  const dateSelect=document.getElementById('dateSelect');
  const dates=[];
  for(let i=0;i<5;i++){ const day=new Date(); day.setDate(day.getDate()+i); dates.push(day);}  
  dateSelect.innerHTML=dates.map(d=>`<option value="${d.toISOString().slice(0,10)}">${d.toLocaleDateString('vi-VN')}</option>`).join('');
  const slotGrid=document.getElementById('slotGrid');
  const slots=['08:00 - 09:00','09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 13:00','13:00 - 14:00'];
  slotGrid.innerHTML=slots.map((slot,index)=>`<button class="slot-item ${index===0?'active':''}" type="button">${slot}</button>`).join('');
  const summaryCourt=document.getElementById('summaryCourt');
  const summaryDate=document.getElementById('summaryDate');
  const summaryTime=document.getElementById('summaryTime');
  const summaryPrice=document.getElementById('summaryPrice');
  const continueButton=document.getElementById('continueBooking');
  const updateSummary=()=>{
    const active=document.querySelector('.slot-item.active');
    summaryCourt.textContent=court.name;
    summaryDate.textContent=dateSelect.options[dateSelect.selectedIndex].text;
    summaryTime.textContent=active?active.textContent:'-';
    summaryPrice.textContent=`${court.price.toLocaleString()}d`;
    continueButton.disabled=!active;
    localStorage.setItem('bookingDraft', JSON.stringify({court,date:dateSelect.value,time:active?active.textContent:'',price:court.price}));
  };
  slotGrid.querySelectorAll('.slot-item').forEach(btn=>btn.addEventListener('click', ()=>{slotGrid.querySelectorAll('.slot-item').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); updateSummary();}));
  dateSelect.addEventListener('change', updateSummary);
  updateSummary();
  continueButton.addEventListener('click', ()=>{window.location.href='payment.html';});
}
function initPaymentPage(){
  const draft=JSON.parse(localStorage.getItem('bookingDraft')||'null');
  if(!draft){return;}
  document.getElementById('payCourt').textContent=draft.court.name;
  document.getElementById('payDate').textContent=new Date(draft.date).toLocaleDateString('vi-VN');
  document.getElementById('payTime').textContent=draft.time;
  document.getElementById('payAmount').textContent=`${draft.price.toLocaleString()}d`;
  document.getElementById('payTotal').textContent=`${draft.price.toLocaleString()}d`;
  document.getElementById('successCourt').textContent=draft.court.name;
  document.getElementById('successDate').textContent=new Date(draft.date).toLocaleDateString('vi-VN');
  document.getElementById('successTime').textContent=draft.time;
  document.getElementById('successAmount').textContent=`${draft.price.toLocaleString()}d`;
  document.getElementById('payButton').addEventListener('click', ()=>{
    const method=document.querySelector('input[name="paymentMethod"]:checked').value;
    const history=JSON.parse(localStorage.getItem('bookingHistory')||'[]');
    history.push({...draft,method,id:Date.now()});
    localStorage.setItem('bookingHistory', JSON.stringify(history));
    document.getElementById('paymentMessage').textContent='Thanh toán thành công!';
    document.getElementById('paymentSuccess').classList.remove('hidden');
  });
}
function renderHistory(){
  const history=JSON.parse(localStorage.getItem('bookingHistory')||'[]');
  const container=document.getElementById('historyList');
  if(!container) return;
  if(history.length===0){container.innerHTML='<div class="history-item"><div>Chưa có lịch đặt nào.</div></div>'; return;}
  container.innerHTML=history.reverse().map(item=>`
    <article class="history-item">
      <div class="history-meta">
        <h3>${item.court.name}</h3>
        <span>${new Date(item.date).toLocaleDateString('vi-VN')} · ${item.time}</span>
        <span>${item.court.address}</span>
        <span>Thanh toán: ${item.method} · ${item.price.toLocaleString()}đ</span>
      </div>
      <div class="history-actions"><button class="button button--secondary" data-cancel="${item.id}">Hủy</button></div>
    </article>`).join('');
  container.querySelectorAll('button[data-cancel]').forEach(btn=>btn.addEventListener('click', ()=>{
    localStorage.setItem('cancelBookingId', btn.dataset.cancel);
    window.location.href='cancel-booking.html';
  }));
}
function initCancelPage(){
  const cancelId=localStorage.getItem('cancelBookingId');
  const history=JSON.parse(localStorage.getItem('bookingHistory')||'[]');
  const item=history.find(b=>String(b.id)===cancelId);
  const container=document.getElementById('cancelInfo');
  const confirm=document.getElementById('cancelConfirm');
  if(!item || !container || !confirm){return;}
  container.innerHTML=`<h2>Bạn có chắc chắn muốn hủy?</h2><div><span>Sân</span><span>${item.court.name}</span></div><div><span>Ngày</span><span>${new Date(item.date).toLocaleDateString('vi-VN')}</span></div><div><span>Giờ</span><span>${item.time}</span></div><div><span>Giá</span><span>${item.price.toLocaleString()}đ</span></div>`;
  confirm.addEventListener('click', ()=>{
    const updated=history.filter(b=>String(b.id)!==cancelId);
    localStorage.setItem('bookingHistory', JSON.stringify(updated));
    window.location.href='booking-history.html';
  });
}
window.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('courtList')){initCourtFilters(); renderCourtList();}
  if(document.getElementById('selectedCourt')){initBookingPage();}
  if(document.getElementById('payButton')){initPaymentPage();}
  if(document.getElementById('historyList')){renderHistory();}
  if(document.getElementById('cancelInfo')){initCancelPage();}
});
