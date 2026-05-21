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
  const payServiceFee = document.getElementById('payServiceFee');
  const payAmount = document.getElementById('payAmount');
  const payTotal = document.getElementById('payTotal');
  const successCourt = document.getElementById('successCourt');
  const successDate = document.getElementById('successDate');
  const successTime = document.getElementById('successTime');
  const successService = document.getElementById('successService');
  const successAmount = document.getElementById('successAmount');
  payCourt.textContent = draft.court.name;
  payDate.textContent = new Date(draft.date).toLocaleDateString('vi-VN');
  payTime.textContent = draft.time;
  payService.textContent = draft.service?.name || 'Không chọn';
  payServiceFee.textContent = formatCurrency(draft.servicePrice || 0);
  payAmount.textContent = formatCurrency(draft.price);
  payTotal.textContent = formatCurrency(draft.total || draft.price);
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
    paymentMessage.textContent = 'Thanh toán thành công!';
    successSection.classList.remove('hidden');
    payButton.disabled = true;
  });
}
window.addEventListener('DOMContentLoaded', () => {
  initPaymentPage();
});
