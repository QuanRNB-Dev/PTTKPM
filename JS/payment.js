function formatCurrency(value){
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}
function initPaymentPage(){
  const draft = JSON.parse(localStorage.getItem('bookingDraft') || 'null');
  const payButton = document.getElementById('payButton');
  const paymentMessage = document.getElementById('paymentMessage');
  const successSection = document.getElementById('paymentSuccess');
  if (!draft || !payButton || !paymentMessage || !successSection) {
    return;
  }
  const payCourt = document.getElementById('payCourt');
  const payDate = document.getElementById('payDate');
  const payTime = document.getElementById('payTime');
  const payService = document.getElementById('payService');
  const payAmount = document.getElementById('payAmount');
  const successCourt = document.getElementById('successCourt');
  const successDate = document.getElementById('successDate');
  const successTime = document.getElementById('successTime');
  const successService = document.getElementById('successService');
  const successAmount = document.getElementById('successAmount');
  payCourt.textContent = draft.court.name;
  payDate.textContent = new Date(draft.date).toLocaleDateString('vi-VN');
  payTime.textContent = draft.time;
  payService.textContent = draft.service?.name || 'Không chọn';
  payAmount.textContent = formatCurrency(draft.total || draft.price);
  successCourt.textContent = draft.court.name;
  successDate.textContent = new Date(draft.date).toLocaleDateString('vi-VN');
  successTime.textContent = draft.time;
  successService.textContent = draft.service?.name || 'Không chọn';
  successAmount.textContent = formatCurrency(draft.total || draft.price);
  payButton.addEventListener('click', () => {
    const method = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = method ? method.value : 'VNPay';
    const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    history.push({ ...draft, method: paymentMethod, id: Date.now() });
    localStorage.setItem('bookingHistory', JSON.stringify(history));
    paymentMessage.textContent = 'Thanh toán thành công! Chuyển tới lịch sử...';
    successSection.classList.remove('hidden');
    payButton.disabled = true;
    window.setTimeout(() => {
      window.location.href = 'booking-history.html';
    }, 1200);
  });
}
window.addEventListener('DOMContentLoaded', () => {
  initPaymentPage();
});
