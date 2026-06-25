/* ═══════════════════════════════════════════════════════════════
   ALTIN SARAY  ·  script.js v3
   Clean English variable names, Turkish UI text preserved
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Constants ──────────────────────────────────────────────── */
const MONTH_NAMES = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
];

const TODAY       = new Date();
const TODAY_START = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());

/* ── Calendar state ─────────────────────────────────────────── */
let calendarYear  = TODAY.getFullYear();
let calendarMonth = TODAY.getMonth();

let selectedDate = null; // { year, month, day }
let selectedSlot = null; // 'top' | 'bot' | 'both'

/* ── Booking data ───────────────────────────────────────────── */
// Key format: "YYYY-M-D"  |  value: { top: bool, bot: bool }
// In a real project this comes from an API / Supabase etc.
const bookingMap = {};

function seedDemoBookings() {
  for (let offsetDays = 1; offsetDays <= 90; offsetDays++) {
    const date     = new Date(TODAY);
    date.setDate(TODAY.getDate() + offsetDays);
    const isWeekend = (date.getDay() === 0 || date.getDay() === 6);
    const topBooked = isWeekend ? Math.random() > 0.38 : Math.random() > 0.62;
    const botBooked = isWeekend ? Math.random() > 0.32 : Math.random() > 0.58;
    if (topBooked || botBooked) {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      bookingMap[key] = { top: topBooked, bot: botBooked };
    }
  }
}

function getBookingStatus(year, month, day) {
  return bookingMap[`${year}-${month}-${day}`] || { top: false, bot: false };
}

/* ── Slot class resolver ────────────────────────────────────── */
function resolveSlotClass(isPast, isBooked, isSelected) {
  if (isPast)     return 'slot-is-past';
  if (isBooked)   return 'slot-is-booked';
  if (isSelected) return 'slot-is-selected';
  return 'slot-is-free';
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR
   ═══════════════════════════════════════════════════════════════ */
function renderCalendar() {
  const monthLabel = document.getElementById('calendarMonthLabel');
  if (monthLabel) {
    monthLabel.textContent = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;
  }

  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay();
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const daysInMonth   = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  // Leading blank cells
  for (let i = 0; i < leadingBlanks; i++) {
    const blank = document.createElement('div');
    blank.className = 'day-cell is-empty';
    grid.appendChild(blank);
  }

  // Day cells
  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
    const cellDate  = new Date(calendarYear, calendarMonth, dayNumber);
    const isPast    = cellDate < TODAY_START;
    const isToday   = cellDate.getTime() === TODAY_START.getTime();
    const booking   = getBookingStatus(calendarYear, calendarMonth, dayNumber);

    const isThisDaySelected =
      selectedDate &&
      selectedDate.year  === calendarYear &&
      selectedDate.month === calendarMonth &&
      selectedDate.day   === dayNumber;

    const topSelected = isThisDaySelected && (selectedSlot === 'top' || selectedSlot === 'both');
    const botSelected = isThisDaySelected && (selectedSlot === 'bot' || selectedSlot === 'both');

    // Build cell
    const cell = document.createElement('div');
    cell.className = 'day-cell' +
      (isPast   ? ' is-past'  : '') +
      (isToday  ? ' is-today' : '');
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `${dayNumber} ${MONTH_NAMES[calendarMonth]}`);

    // Two-slot container
    const halves = document.createElement('div');
    halves.className = 'day-halves';

    const topSlot = document.createElement('div');
    topSlot.className = 'day-slot-top ' + resolveSlotClass(isPast, booking.top, topSelected);
    topSlot.setAttribute('aria-label', 'Gündüz 13:00–17:00');
    topSlot.setAttribute('role', 'button');
    topSlot.setAttribute('tabindex', isPast || booking.top ? '-1' : '0');

    const botSlot = document.createElement('div');
    botSlot.className = 'day-slot-bot ' + resolveSlotClass(isPast, booking.bot, botSelected);
    botSlot.setAttribute('aria-label', 'Akşam 19:00–23:00');
    botSlot.setAttribute('role', 'button');
    botSlot.setAttribute('tabindex', isPast || booking.bot ? '-1' : '0');

    halves.appendChild(topSlot);
    halves.appendChild(botSlot);

    // Day number label
    const label = document.createElement('div');
    label.className = 'day-number';
    label.textContent = dayNumber;
    label.setAttribute('aria-hidden', 'true');

    cell.appendChild(halves);
    cell.appendChild(label);

    // Event listeners
    if (!isPast) {
      if (!booking.top) {
        topSlot.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSlotSelection(calendarYear, calendarMonth, dayNumber, 'top');
        });
        topSlot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSlotSelection(calendarYear, calendarMonth, dayNumber, 'top');
          }
        });
      }
      if (!booking.bot) {
        botSlot.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSlotSelection(calendarYear, calendarMonth, dayNumber, 'bot');
        });
        botSlot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSlotSelection(calendarYear, calendarMonth, dayNumber, 'bot');
          }
        });
      }
    }

    grid.appendChild(cell);
  }
}

/* ── Slot selection logic ───────────────────────────────────── */
function handleSlotSelection(year, month, day, slotClicked) {
  const isSameDay =
    selectedDate &&
    selectedDate.year  === year &&
    selectedDate.month === month &&
    selectedDate.day   === day;

  if (isSameDay) {
    if (selectedSlot === slotClicked) {
      // Deselect entirely
      selectedDate = null;
      selectedSlot = null;
    } else if (selectedSlot === 'both') {
      // Remove one half
      selectedSlot = slotClicked === 'top' ? 'bot' : 'top';
    } else {
      // Combine into full-day if other slot is free
      const booking     = getBookingStatus(year, month, day);
      const otherBooked = slotClicked === 'top' ? booking.top : booking.bot;
      if (!otherBooked) {
        selectedSlot = 'both';
      }
    }
  } else {
    // New day selected
    selectedDate = { year, month, day };
    selectedSlot = slotClicked;
  }

  renderCalendar();
  updateSelectionSummary();
}

function updateSelectionSummary() {
  const summaryEl = document.getElementById('selectionSummary');
  if (!summaryEl) return;

  if (!selectedDate) {
    summaryEl.style.display = 'none';
    return;
  }

  const slotLabel =
    selectedSlot === 'top'  ? 'Gündüz (13:00 – 17:00)'     :
    selectedSlot === 'bot'  ? 'Akşam (19:00 – 23:00)'      :
                              'Gündüz + Akşam (Tam Gün)';

  summaryEl.style.display = 'block';
  summaryEl.innerHTML =
    `<strong>Seçilen Tarih:</strong> ${selectedDate.day} ${MONTH_NAMES[selectedDate.month]} ${selectedDate.year}` +
    `&nbsp;&nbsp;·&nbsp;&nbsp;<strong>Vakit:</strong> ${slotLabel}`;
}

/* ── Month navigation ───────────────────────────────────────── */
function goToPrevMonth() {
  if (calendarMonth === 0) { calendarMonth = 11; calendarYear--; }
  else calendarMonth--;
  renderCalendar();
}

function goToNextMonth() {
  if (calendarMonth === 11) { calendarMonth = 0; calendarYear++; }
  else calendarMonth++;
  renderCalendar();
}

/* ═══════════════════════════════════════════════════════════════
   PAGE NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function navigateToPage(pageId) {
  // Remove active state from all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('is-active');
    page.style.display = 'none';
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (!targetPage) return;

  targetPage.style.display = 'block';
  // Trigger reflow to allow animation restart
  void targetPage.offsetWidth;
  targetPage.classList.add('is-active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageId === 'rezervasyon') {
    // Reset calendar to current month
    calendarYear  = TODAY.getFullYear();
    calendarMonth = TODAY.getMonth();
    setTimeout(renderCalendar, 100);

    // Reset form/success visibility
    const formEl    = document.getElementById('reservationForm');
    const successEl = document.getElementById('successState');
    if (formEl)    formEl.style.display    = '';
    if (successEl) successEl.style.display = 'none';
  }

  // Close mobile menu
  closeMobileMenu();
}

function scrollToSection(sectionId) {
  navigateToPage('home');
  setTimeout(() => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }, 180);
}

function openReservationFor(venueName) {
  navigateToPage('rezervasyon');
  setTimeout(() => {
    const venueSelect = document.getElementById('venueSelect');
    if (!venueSelect) return;
    for (const option of venueSelect.options) {
      if (option.value === venueName) {
        venueSelect.value = venueName;
        break;
      }
    }
  }, 200);
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════════════════ */
function toggleMobileMenu() {
  const menu   = document.getElementById('navMenu');
  const button = document.getElementById('hamburgerBtn');
  if (!menu) return;

  const isOpen = menu.classList.toggle('is-open');
  if (button) button.setAttribute('aria-expanded', isOpen.toString());
}

function closeMobileMenu() {
  const menu   = document.getElementById('navMenu');
  const button = document.getElementById('hamburgerBtn');
  if (menu)   menu.classList.remove('is-open');
  if (button) button.setAttribute('aria-expanded', 'false');
}

/* ═══════════════════════════════════════════════════════════════
   FORM SUBMISSION
   ═══════════════════════════════════════════════════════════════ */
function submitReservation() {
  const fullName    = document.getElementById('fullName')?.value.trim()    || '';
  const phoneNumber = document.getElementById('phoneNumber')?.value.trim() || '';
  const emailAddress= document.getElementById('emailAddress')?.value.trim()|| '';
  const venueName   = document.getElementById('venueSelect')?.value        || '';

  // Validation
  if (!fullName || !phoneNumber || !emailAddress) {
    alert('Lütfen ad, telefon ve e-posta alanlarını doldurunuz.');
    return;
  }
  if (!selectedDate) {
    alert('Lütfen takvimden bir tarih ve vakit seçiniz.');
    return;
  }
  if (!venueName) {
    alert('Lütfen bir salon seçiniz.');
    return;
  }

  const slotLabel =
    selectedSlot === 'top'  ? 'Gündüz (13:00 – 17:00)' :
    selectedSlot === 'bot'  ? 'Akşam (19:00 – 23:00)'  :
                              'Gündüz + Akşam (Tam Gün)';

  const formattedDate =
    `${selectedDate.day} ${MONTH_NAMES[selectedDate.month]} ${selectedDate.year}`;

  const venueShortName = venueName.split(' —')[0];

  // Populate success screen
  const detailsEl = document.getElementById('successDetails');
  if (detailsEl) {
    detailsEl.innerHTML =
      `<dd><strong>Salon:</strong>${venueShortName}</dd>` +
      `<dd><strong>Tarih:</strong>${formattedDate}</dd>` +
      `<dd><strong>Vakit:</strong>${slotLabel}</dd>` +
      `<dd><strong>Ad Soyad:</strong>${fullName}</dd>` +
      `<dd><strong>Telefon:</strong>${phoneNumber}</dd>`;
  }

  // Switch views
  const formEl    = document.getElementById('reservationForm');
  const successEl = document.getElementById('successState');
  if (formEl)    formEl.style.display    = 'none';
  if (successEl) successEl.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS (Intersection Observer — replaces Framer Motion)
   ═══════════════════════════════════════════════════════════════ */
function initRevealAnimations() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal-item').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ── Counter animation for stats ───────────────────────────── */
function animateStatCounters() {
  const statFigures = document.querySelectorAll('.stat-figure[data-target]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed  = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased    = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target).toLocaleString('tr-TR');
          if (progress < 1) requestAnimationFrame(updateCounter);
        }

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  statFigures.forEach(el => counterObserver.observe(el));
}

/* ── Particles ──────────────────────────────────────────────── */
function initHeroParticles() {
  const field = document.getElementById('particleField');
  if (!field) return;

  const PARTICLE_COUNT = 18;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';

    const xPos     = Math.random() * 100;
    const yPos     = 30 + Math.random() * 60;
    const duration = 7 + Math.random() * 8;
    const delay    = Math.random() * 6;
    const size     = 1 + Math.random() * 2;

    particle.style.cssText = `
      left: ${xPos}%;
      top: ${yPos}%;
      width: ${size}px;
      height: ${size}px;
      --duration: ${duration}s;
      --delay: ${delay}s;
    `;

    field.appendChild(particle);
  }
}

/* ── Sticky nav shadow ──────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const scrollHandler = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
}

/* ── Page visibility init (hide inactive pages) ─────────────── */
function initPageVisibility() {
  document.querySelectorAll('.page:not(.is-active)').forEach(page => {
    page.style.display = 'none';
  });
}

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  seedDemoBookings();
  initPageVisibility();
  initNavbarScroll();
  initHeroParticles();
  initRevealAnimations();
  animateStatCounters();
});
