/* ============================================================
   ALTIN SARAY — script.js v2
   Takvim: her gün iki yarıya bölünmüş (gündüz / akşam)
   ============================================================ */

const MONTHS = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
];
const TODAY = new Date();

let cY = TODAY.getFullYear();
let cM = TODAY.getMonth();

/* ----------------------------------------------------------------
   BOOKINGS DATA
   key  → "YYYY-M-D"
   val  → { top: bool, bot: bool }   (top=gündüz, bot=akşam)
   Gerçek projede bu veri API/backend'den gelir.
---------------------------------------------------------------- */
const bookings = {};

function seedBookings() {
  const base = new Date(TODAY);
  for (let i = 1; i <= 60; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const isWeekend = (d.getDay() === 6 || d.getDay() === 0);
    const topBooked = isWeekend ? Math.random() > 0.35 : Math.random() > 0.60;
    const botBooked = isWeekend ? Math.random() > 0.30 : Math.random() > 0.55;
    if (topBooked || botBooked) {
      const key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
      bookings[key] = { top: topBooked, bot: botBooked };
    }
  }
}
seedBookings();

function getBooking(y, m, d) {
  return bookings[y + '-' + m + '-' + d] || { top: false, bot: false };
}

/* ---- Selection state ---- */
let selDate = null;   // { y, m, d }
let selSlot = null;   // 'top' | 'bot' | 'both'

/* ================================================================
   CALENDAR RENDER
================================================================ */
function renderCal() {
  const lbl = document.getElementById('cal-lbl');
  if (lbl) lbl.textContent = MONTHS[cM] + ' ' + cY;

  const grid = document.getElementById('cal-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const firstDay = new Date(cY, cM, 1).getDay();
  const offset   = (firstDay === 0) ? 6 : firstDay - 1;
  const total    = new Date(cY, cM + 1, 0).getDate();
  const todayMid = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());

  /* Empty leading cells */
  for (let i = 0; i < offset; i++) {
    const el = document.createElement('div');
    el.className = 'cday empty';
    grid.appendChild(el);
  }

  /* Day cells */
  for (let d = 1; d <= total; d++) {
    const thisDate = new Date(cY, cM, d);
    const isPast   = thisDate < todayMid;
    const isToday  = thisDate.getTime() === todayMid.getTime();
    const bk       = getBooking(cY, cM, d);
    const isSel    = selDate && selDate.y === cY && selDate.m === cM && selDate.d === d;

    const cell = document.createElement('div');
    cell.className = 'cday' + (isPast ? ' past' : '') + (isToday ? ' today' : '');

    /* Inner div holding top & bottom halves */
    const inner = document.createElement('div');
    inner.className = 'day-inner';

    const topEl = document.createElement('div');
    const botEl = document.createElement('div');
    topEl.className = 'slot-top ' + slotClass(isPast, bk.top, isSel && (selSlot === 'top' || selSlot === 'both'));
    botEl.className = 'slot-bot ' + slotClass(isPast, bk.bot, isSel && (selSlot === 'bot' || selSlot === 'both'));

    inner.appendChild(topEl);
    inner.appendChild(botEl);

    /* Day number label */
    const num = document.createElement('div');
    num.className = 'day-num';
    num.textContent = d;

    cell.appendChild(inner);
    cell.appendChild(num);

    /* Click handlers (only for future days) */
    if (!isPast) {
      topEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (bk.top) return;
        handleSlotClick(cY, cM, d, 'top');
      });
      botEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (bk.bot) return;
        handleSlotClick(cY, cM, d, 'bot');
      });
    }

    grid.appendChild(cell);
  }
}

function slotClass(isPast, isBooked, isSelected) {
  if (isPast)       return 'slot-past';
  if (isBooked)     return 'slot-booked';
  if (isSelected)   return 'slot-selected';
  return 'slot-free';
}

/* ----------------------------------------------------------------
   Slot click logic
   Same day → toggle / combine selections
   Different day → start fresh
---------------------------------------------------------------- */
function handleSlotClick(y, m, d, slot) {
  if (selDate && selDate.y === y && selDate.m === m && selDate.d === d) {
    if (selSlot === slot) {
      /* Clicked same slot → deselect everything */
      selDate = null;
      selSlot = null;
    } else if (selSlot === 'both') {
      /* Deselect one of the two */
      selSlot = (slot === 'top') ? 'bot' : 'top';
    } else {
      /* Different slot on same day → combine if both free */
      const bk = getBooking(y, m, d);
      const otherBooked = (slot === 'top') ? bk.top : bk.bot;
      if (!otherBooked) selSlot = 'both';
    }
  } else {
    /* New day */
    selDate = { y, m, d };
    selSlot = slot;
  }
  renderCal();
  updateSelSummary();
}

function updateSelSummary() {
  const box = document.getElementById('sel-summary');
  if (!box) return;
  if (!selDate) { box.style.display = 'none'; return; }

  const slotLabel =
    selSlot === 'top'  ? 'Gündüz (13:00 – 17:00)' :
    selSlot === 'bot'  ? 'Akşam (19:00 – 23:00)'  :
                         'Gündüz + Akşam (Tam Gün)';

  box.style.display = 'block';
  box.innerHTML =
    '<strong>Seçilen Tarih:</strong> ' +
    selDate.d + ' ' + MONTHS[selDate.m] + ' ' + selDate.y +
    '&nbsp;&nbsp;·&nbsp;&nbsp;<strong>Vakit:</strong> ' + slotLabel;
}

/* ---- Month navigation ---- */
function PM() {
  if (cM === 0) { cM = 11; cY--; } else cM--;
  renderCal();
}
function NM() {
  if (cM === 11) { cM = 0; cY++; } else cM++;
  renderCal();
}

/* ================================================================
   PAGE NAVIGATION
================================================================ */
function SP(p) {
  document.querySelectorAll('.page').forEach(pg => {
    pg.classList.remove('active');
    pg.style.display = 'none';
  });

  const target = document.getElementById('page-' + p);
  if (target) {
    target.style.display = 'block';
    /* Trigger reflow so animation fires */
    void target.offsetWidth;
    target.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (p === 'rezervasyon') {
    /* Sync calendar to current month */
    cY = TODAY.getFullYear();
    cM = TODAY.getMonth();
    setTimeout(renderCal, 80);

    /* Reset form / success state */
    const form    = document.getElementById('rezv-form');
    const success = document.getElementById('success-box');
    if (form)    form.style.display    = '';
    if (success) success.style.display = 'none';
  }

  /* Close mobile menu */
  const menu = document.getElementById('nav-menu');
  if (menu) menu.classList.remove('open');
}

function NT(sectionId) {
  SP('home');
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 160);
}

function OR(salonName) {
  SP('rezervasyon');
  setTimeout(() => {
    const sel = document.getElementById('salon-sel');
    if (!sel) return;
    for (const opt of sel.options) {
      if (opt.value === salonName) { sel.value = salonName; break; }
    }
  }, 180);
}

/* ================================================================
   HAMBURGER MENU
================================================================ */
function toggleMenu() {
  const menu = document.getElementById('nav-menu');
  if (menu) menu.classList.toggle('open');
}

/* ================================================================
   FORM SUBMIT
================================================================ */
function SUB() {
  const name  = (document.getElementById('f-name')  || {}).value?.trim() || '';
  const phone = (document.getElementById('f-phone') || {}).value?.trim() || '';
  const email = (document.getElementById('f-email') || {}).value?.trim() || '';
  const salon = (document.getElementById('salon-sel') || {}).value || '';

  if (!name || !phone || !email) {
    alert('Lütfen ad, telefon ve e-posta alanlarını doldurunuz.');
    return;
  }
  if (!selDate) {
    alert('Lütfen takvimden bir tarih ve vakit seçiniz.');
    return;
  }
  if (!salon) {
    alert('Lütfen bir salon seçiniz.');
    return;
  }

  const slotLabel =
    selSlot === 'top'  ? 'Gündüz (13:00 – 17:00)' :
    selSlot === 'bot'  ? 'Akşam (19:00 – 23:00)'  :
                         'Gündüz + Akşam (Tam Gün)';

  const dateStr = selDate.d + ' ' + MONTHS[selDate.m] + ' ' + selDate.y;
  const salonShort = salon.split(' —')[0];

  document.getElementById('suc-detail').innerHTML =
    '<div><strong>Salon:</strong>'     + salonShort + '</div>' +
    '<div><strong>Tarih:</strong>'     + dateStr    + '</div>' +
    '<div><strong>Vakit:</strong>'     + slotLabel  + '</div>' +
    '<div><strong>Ad Soyad:</strong>'  + name       + '</div>' +
    '<div><strong>Telefon:</strong>'   + phone      + '</div>';

  const form    = document.getElementById('rezv-form');
  const success = document.getElementById('success-box');
  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Hide inactive pages without animation on load */
  document.querySelectorAll('.page:not(.active)').forEach(p => {
    p.style.display = 'none';
  });

  /* Sticky nav shadow */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 24
        ? '0 4px 24px rgba(0,0,0,.70)'
        : 'none';
    }
  });
});
