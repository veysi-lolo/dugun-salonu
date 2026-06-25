// ==================== CALENDAR ====================
let calYear = 2026, calMonth = 5;
let selectedDate = '', selectedTime = '';

const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                 'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const today = new Date();

function renderCal() {
  const label = document.getElementById('cal-month-label');
  if (label) label.textContent = months[calMonth] + ' ' + calYear;

  const grid = document.getElementById('cal-days');
  if (!grid) return;
  grid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = (firstDay === 0) ? 6 : firstDay - 1;
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= totalDays; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;
    const thisDate = new Date(calYear, calMonth, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (thisDate < todayStart) {
      el.classList.add('past');
    } else {
      const ds = calYear + '-' + (calMonth + 1) + '-' + d;
      if (ds === selectedDate) el.classList.add('selected');
      el.addEventListener('click', () => selectDay(d, el));
    }
    grid.appendChild(el);
  }
}

function selectDay(d, el) {
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = calYear + '-' + (calMonth + 1) + '-' + d;
  const display = document.getElementById('selected-date-display');
  if (display) {
    display.textContent = 'Seçilen Tarih: ' + d + ' ' + months[calMonth] + ' ' + calYear;
    display.style.color = '#D4AF37';
  }
}

function prevMonth() {
  if (calMonth === 0) { calMonth = 11; calYear--; }
  else calMonth--;
  renderCal();
}

function nextMonth() {
  if (calMonth === 11) { calMonth = 0; calYear++; }
  else calMonth++;
  renderCal();
}

// ==================== TIME SLOT ====================
function selectTime(t) {
  selectedTime = t;
  const gunduz = document.getElementById('tc-gunduz');
  const aksam  = document.getElementById('tc-aksam');
  if (gunduz) gunduz.classList.toggle('selected', t === 'gunduz');
  if (aksam)  aksam.classList.toggle('selected',  t === 'aksam');
}

// ==================== PAGE NAVIGATION ====================
function showPage(p) {
  document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
  const target = document.getElementById('page-' + p);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (p === 'rezervasyon') {
    setTimeout(renderCal, 50);
    // Reset form view
    const formContainer = document.getElementById('rezv-form-container');
    const successBox    = document.getElementById('success-box');
    if (formContainer) formContainer.style.display = '';
    if (successBox)    successBox.style.display = 'none';
  }
  // Close mobile menu
  const menu = document.getElementById('nav-menu');
  if (menu) menu.classList.remove('open');
}

function navTo(sectionId) {
  showPage('home');
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function openRezervasyon(salon) {
  showPage('rezervasyon');
  setTimeout(() => {
    const sel = document.getElementById('salon-select');
    if (sel) sel.value = salon;
  }, 150);
}

// ==================== HAMBURGER MENU ====================
function toggleMenu() {
  const menu = document.getElementById('nav-menu');
  if (menu) menu.classList.toggle('open');
}

// ==================== FORM SUBMIT ====================
function submitForm() {
  const name  = (document.getElementById('f-name')  || {}).value?.trim();
  const phone = (document.getElementById('f-phone') || {}).value?.trim();
  const email = (document.getElementById('f-email') || {}).value?.trim();
  const salon = (document.getElementById('salon-select') || {}).value;

  if (!name || !phone || !email) {
    alert('Lütfen ad, telefon ve e-posta alanlarını doldurunuz.');
    return;
  }
  if (!selectedDate) {
    alert('Lütfen bir tarih seçiniz.');
    return;
  }
  if (!salon) {
    alert('Lütfen bir salon seçiniz.');
    return;
  }
  if (!selectedTime) {
    alert('Lütfen zaman dilimi seçiniz.');
    return;
  }

  const timeLabel = selectedTime === 'gunduz'
    ? 'Gündüz Grubu (13:00 – 17:00)'
    : 'Akşam Grubu (19:00 – 23:00)';

  const parts   = selectedDate.split('-');
  const dateStr = parts[2] + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];

  const detail = document.getElementById('success-detail');
  if (detail) {
    detail.innerHTML =
      '<div><strong>Salon:</strong>' + salon + '</div>' +
      '<div><strong>Tarih:</strong>' + dateStr + '</div>' +
      '<div><strong>Zaman:</strong>' + timeLabel + '</div>' +
      '<div><strong>Ad Soyad:</strong>' + name + '</div>' +
      '<div><strong>Telefon:</strong>' + phone + '</div>';
  }

  const formContainer = document.getElementById('rezv-form-container');
  const successBox    = document.getElementById('success-box');
  if (formContainer) formContainer.style.display = 'none';
  if (successBox)    successBox.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  // Sticky nav shadow on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 20
        ? '0 4px 20px rgba(0,0,0,0.6)'
        : 'none';
    }
  });
});
