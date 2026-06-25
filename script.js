'use strict';

const MONTH_NAMES = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TODAY       = new Date();
const TODAY_START = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());

let calendarYear  = TODAY.getFullYear();
let calendarMonth = TODAY.getMonth();
let selectedDate  = null;
let selectedSlot  = null;

const bookingMap = {};

function seedDemoBookings() {
  for (let i = 1; i <= 90; i++) {
    const d = new Date(TODAY); d.setDate(TODAY.getDate() + i);
    const isWE = d.getDay() === 0 || d.getDay() === 6;
    const top = isWE ? Math.random() > 0.38 : Math.random() > 0.62;
    const bot = isWE ? Math.random() > 0.32 : Math.random() > 0.58;
    if (top || bot) bookingMap[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = { top, bot };
  }
}

function getBooking(y, m, d) { return bookingMap[`${y}-${m}-${d}`] || { top:false, bot:false }; }
function slotClass(isPast, isBooked, isSel) {
  if (isPast)   return 'slot-is-past';
  if (isBooked) return 'slot-is-booked';
  if (isSel)    return 'slot-is-selected';
  return 'slot-is-free';
}

/* ── CALENDAR ── */
function renderCalendar() {
  const lbl  = document.getElementById('calendarMonthLabel');
  if (lbl) lbl.textContent = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const fw     = new Date(calendarYear, calendarMonth, 1).getDay();
  const blanks = fw === 0 ? 6 : fw - 1;
  const days   = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  for (let i = 0; i < blanks; i++) { const b = document.createElement('div'); b.className = 'day-cell is-empty'; grid.appendChild(b); }
  for (let d = 1; d <= days; d++) {
    const dt    = new Date(calendarYear, calendarMonth, d);
    const isPast  = dt < TODAY_START;
    const isToday = dt.getTime() === TODAY_START.getTime();
    const bk = getBooking(calendarYear, calendarMonth, d);
    const isSel = selectedDate && selectedDate.year === calendarYear && selectedDate.month === calendarMonth && selectedDate.day === d;
    const topSel = isSel && (selectedSlot === 'top' || selectedSlot === 'both');
    const botSel = isSel && (selectedSlot === 'bot' || selectedSlot === 'both');
    const cell = document.createElement('div');
    cell.className = 'day-cell' + (isPast ? ' is-past' : '') + (isToday ? ' is-today' : '');
    const halves = document.createElement('div'); halves.className = 'day-halves';
    const ts = document.createElement('div'); ts.className = 'day-slot-top ' + slotClass(isPast, bk.top, topSel);
    const bs = document.createElement('div'); bs.className = 'day-slot-bot ' + slotClass(isPast, bk.bot, botSel);
    halves.appendChild(ts); halves.appendChild(bs);
    const num = document.createElement('div'); num.className = 'day-number'; num.textContent = d;
    cell.appendChild(halves); cell.appendChild(num);
    if (!isPast) {
      if (!bk.top) ts.addEventListener('click', e => { e.stopPropagation(); handleSlot(calendarYear, calendarMonth, d, 'top'); });
      if (!bk.bot) bs.addEventListener('click', e => { e.stopPropagation(); handleSlot(calendarYear, calendarMonth, d, 'bot'); });
    }
    grid.appendChild(cell);
  }
}

function handleSlot(y, m, d, slot) {
  const same = selectedDate && selectedDate.year === y && selectedDate.month === m && selectedDate.day === d;
  if (same) {
    if (selectedSlot === slot) { selectedDate = null; selectedSlot = null; }
    else if (selectedSlot === 'both') { selectedSlot = slot === 'top' ? 'bot' : 'top'; }
    else { const bk = getBooking(y,m,d); if (!(slot==='top'?bk.top:bk.bot)) selectedSlot = 'both'; }
  } else { selectedDate = {year:y,month:m,day:d}; selectedSlot = slot; }
  renderCalendar(); updateSummary();
}

function updateSummary() {
  const el = document.getElementById('selectionSummary'); if (!el) return;
  if (!selectedDate) { el.style.display = 'none'; return; }
  const label = selectedSlot==='top'?'Gündüz (13:00–17:00)':selectedSlot==='bot'?'Akşam (19:00–23:00)':'Gündüz + Akşam (Tam Gün)';
  el.style.display = 'block';
  el.innerHTML = `<strong>Seçilen Tarih:</strong> ${selectedDate.day} ${MONTH_NAMES[selectedDate.month]} ${selectedDate.year}&nbsp;&nbsp;·&nbsp;&nbsp;<strong>Vakit:</strong> ${label}`;
}

function goToPrevMonth() { if (calendarMonth===0){calendarMonth=11;calendarYear--;}else calendarMonth--; renderCalendar(); }
function goToNextMonth() { if (calendarMonth===11){calendarMonth=0;calendarYear++;}else calendarMonth++; renderCalendar(); }

/* ── NAVIGATION ── */
function navigateToPage(pageId) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('is-active'); p.style.display='none'; });
  const t = document.getElementById(`page-${pageId}`);
  if (t) { t.style.display='block'; void t.offsetWidth; t.classList.add('is-active'); }
  window.scrollTo({top:0,behavior:'smooth'});
  if (pageId === 'rezervasyon') {
    calendarYear = TODAY.getFullYear(); calendarMonth = TODAY.getMonth();
    setTimeout(renderCalendar, 100);
    const f = document.getElementById('reservationForm'); const s = document.getElementById('successState');
    if (f) f.style.display=''; if (s) s.style.display='none';
  }
  closeMobileMenu();
}

function scrollToSection(id) {
  navigateToPage('home');
  setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({behavior:'smooth'}); }, 180);
}

function openReservationFor(name) {
  navigateToPage('rezervasyon');
  setTimeout(() => { const s = document.getElementById('venueSelect'); if (s) s.value = name; }, 200);
}

function toggleMobileMenu() { const m = document.getElementById('navMenu'); const b = document.getElementById('hamburgerBtn'); if (!m) return; const o = m.classList.toggle('is-open'); if (b) b.setAttribute('aria-expanded', o.toString()); }
function closeMobileMenu() { const m = document.getElementById('navMenu'); const b = document.getElementById('hamburgerBtn'); if (m) m.classList.remove('is-open'); if (b) b.setAttribute('aria-expanded','false'); }

/* ── FORM SUBMIT ── */
function submitReservation() {
  const name  = document.getElementById('fullName')?.value.trim()||'';
  const phone = document.getElementById('phoneNumber')?.value.trim()||'';
  const email = document.getElementById('emailAddress')?.value.trim()||'';
  const venue = document.getElementById('venueSelect')?.value||'';
  if (!name||!phone||!email) { alert('Lütfen ad, telefon ve e-posta alanlarını doldurunuz.'); return; }
  if (!selectedDate) { alert('Lütfen takvimden bir tarih ve vakit seçiniz.'); return; }
  if (!venue) { alert('Lütfen bir salon seçiniz.'); return; }
  const label = selectedSlot==='top'?'Gündüz (13:00–17:00)':selectedSlot==='bot'?'Akşam (19:00–23:00)':'Gündüz + Akşam (Tam Gün)';
  const date  = `${selectedDate.day} ${MONTH_NAMES[selectedDate.month]} ${selectedDate.year}`;
  const det   = document.getElementById('successDetails');
  if (det) det.innerHTML = `<dd><strong>Salon:</strong>${venue.split(' —')[0]}</dd><dd><strong>Tarih:</strong>${date}</dd><dd><strong>Vakit:</strong>${label}</dd><dd><strong>Ad Soyad:</strong>${name}</dd><dd><strong>Telefon:</strong>${phone}</dd>`;
  document.getElementById('reservationForm').style.display = 'none';
  document.getElementById('successState').style.display    = 'block';
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ── CINEMATIC PARALLAX ZOOM ── */
function initCinematicHero() {
  const bg     = document.getElementById('heroBg');
  const section= document.getElementById('heroSection');
  if (!bg || !section) return;

  // Image URL via Pollinations AI (Nano Banana)
  const imageUrl = 'https://image.pollinations.ai/prompt/elegant%20wedding%20couple%20holding%20hands%20golden%20hour%20luxury%20venue%20bokeh%20romantic%20cinematic%20film%20photography%20dark%20moody%20warm%20tones%20Istanbul%20palace?width=1600&height=1000&seed=77&nologo=true&enhance=true';
  bg.style.backgroundImage = `url('${imageUrl}')`;

  const heroHeight = () => section.offsetHeight;

  function onScroll() {
    const scrollY   = window.scrollY;
    const progress  = Math.min(scrollY / heroHeight(), 1); // 0 = top, 1 = bottom of hero

    // Scale: starts at 1.15 (zoomed in / close to couple), scrolls out to 1.0 (wide shot)
    const scale = 1.15 - (progress * 0.15);

    // Vertical drift: image moves up slightly as user scrolls down (parallax)
    const yShift = scrollY * 0.35;

    bg.style.transform = `scale(${scale}) translateY(${yShift * (1/scale)}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial state
}

/* ── STICKY NAV ── */
function initNavbarScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── PARTICLES ── */
function initParticles() {
  const field = document.getElementById('dustField'); if (!field) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div'); p.className = 'dust';
    const sz = 1 + Math.random() * 2.5;
    const dx = (Math.random() - 0.5) * 60;
    p.style.cssText = `left:${Math.random()*100}%;top:${20+Math.random()*65}%;width:${sz}px;height:${sz}px;--dur:${8+Math.random()*9}s;--del:${Math.random()*7}s;--dx:${dx}px`;
    field.appendChild(p);
  }
}

/* ── REVEAL ── */
function initReveal() {
  setTimeout(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('show'), parseInt(e.target.dataset.d||'0'));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }, 100);
}

/* ── COUNTERS ── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; const target = parseInt(el.dataset.t); const dur = 1400; const st = performance.now();
      const tick = now => { const p = Math.min((now-st)/dur,1); el.textContent = Math.round((1-Math.pow(1-p,3))*target).toLocaleString('tr-TR'); if(p<1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-t]').forEach(el => obs.observe(el));
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  seedDemoBookings();
  document.querySelectorAll('.page:not(.is-active)').forEach(p => { p.style.display = 'none'; });
  initCinematicHero();
  initNavbarScroll();
  initParticles();
  initReveal();
  initCounters();
});
