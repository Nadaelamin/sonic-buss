const API = '/api';
const logo = '/assets/logo.png';
const DEMO_KEY = 'sonic_buss_demo_state_v1';

const demoSeed = {
    users: [
        { id: 1, name: 'Sonic Bus Admin', phone: '01000000000', password: 'Admin@123', role: 'Admin', cancellationCount: 0, bannedUntil: null },
        { id: 2, name: 'أحمد محمد', phone: '01111111111', password: '123456', role: 'Student', cancellationCount: 0, bannedUntil: null }
    ],
    trips: [
        { id: 1, name: 'أسوان → جامعة أسوان', from: 'أسوان', to: 'جامعة أسوان', departureAt: new Date(Date.now() + 86400000).toISOString(), totalSeats: 30, price: 20, bookingOpensAt: new Date(Date.now() - 3600000).toISOString(), bookingClosesAt: new Date(Date.now() + 64800000).toISOString(), cancellationClosesAt: new Date(Date.now() + 57600000).toISOString(), status: 'Open', availableSeats: 30, driver: { name: 'محمد حسن', phone: '01012345678', vehicleType: 'أتوبيس', vehiclePlate: 'أسوان 1234' }, stops: [{ id: 1, name: 'محطة القطار', order: 1 }, { id: 2, name: 'موقف الأقاليم', order: 2 }, { id: 3, name: 'السيل', order: 3 }] }
    ],
    bookings: [], nextBooking: 1001
};

function state() {
    let s = localStorage.getItem(DEMO_KEY); if (!s) { localStorage.setItem(DEMO_KEY, JSON.stringify(demoSeed)); s = JSON.stringify(demoSeed) } return JSON.parse(s)
}
function saveState(s) { localStorage.setItem(DEMO_KEY, JSON.stringify(s)) }
function token() { return localStorage.getItem('sb_token') }
function me() { try { return JSON.parse(localStorage.getItem('sb_user')) } catch { return null } }
function setAuth(data) { localStorage.setItem('sb_token', data.token || 'demo'); localStorage.setItem('sb_user', JSON.stringify(data.user)) }
function logout() { localStorage.removeItem('sb_token'); localStorage.removeItem('sb_user'); location.hash = '#/'; render() }
function esc(s) { return String(s ?? '').replace(/[&<>'"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[m])) }
function fmt(d) { return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d)) }
function money(n) { return `${Number(n).toLocaleString('ar-EG')} جنيه` }
function toast(msg, error = false) { const el = document.getElementById('toast'); el.textContent = msg; el.className = 'toast show ' + (error ? 'error' : 'success'); setTimeout(() => el.className = 'toast', 3200) }
async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }; if (token()) headers.Authorization = 'Bearer ' + token();
    const r = await fetch(API + path, { ...opts, headers }); const data = await r.json().catch(() => ({})); if (!r.ok) throw new Error(data.message || 'حدث خطأ غير متوقع'); return data;
}

function shell(content, active = 'home') {
    const u = me();
    return `<header class="topbar"><div class="container nav"><a class="brand" href="#/"><img src="${logo}" alt="Sonic Bus"><span>Sonic Bus</span></a><nav class="navlinks">
 <button onclick="location.hash='#/'">الرئيسية</button>${u?.role === 'Student' ? `<button onclick="location.hash='#/trips'">الرحلات</button><button onclick="location.hash='#/bookings'">حجوزاتي</button>` : ''}${u?.role === 'Admin' ? `<button onclick="location.hash='#/admin'">لوحة الإدارة</button>` : ''}
 ${u ? `<button class="btn btn-outline" onclick="logout()">تسجيل خروج</button>` : `<button class="btn btn-primary" onclick="location.hash='#/login'">دخول</button>`}</nav></div></header>${content}<footer class="footer">Sonic Bus © 2026 — تنقل أسهل للطلاب</footer>`;
}

function home() { return shell(`<main class="page"><section class="hero"><div class="container hero-grid"><div><span class="eyebrow"> تنقل جامعي أذكى</span><h1>مشوارك للجامعة<br><span>أسهل مع Sonic Bus</span></h1><p>احجز رحلتك بسهولة، اختار نقطة الركوب المناسبة ليك، واعرف تفاصيل الرحلة قبل ما تتحرك.</p><div class="hero-actions"></div><div class="stats"><div class="stat"><b>حجز سريع</b><span>تأكيد فوري</span></div><div class="stat"><b>Stops متعددة</b><span>اختار أقرب نقطة</span></div><div class="stat"><b>دفع نقدي</b><span>عند الركوب</span></div></div></div><div class="mascot"><img src="${logo}" alt="Sonic Bus mascot"></div></div></section><section class="section"><div class="container"><div class="section-title"><div><h2>ليه Sonic Bus؟</h2><p>حل بسيط لمشكلة المواصلات اليومية للطلاب.</p></div></div><div class="cards"><div class="card"><h3>اعرف الرحلة</h3><p>كل تفاصيل الرحلة والسائق ونقاط الركوب في مكان واحد.</p></div><div class="card"><h3>احجز في وقتك</h3><p>كل رحلة لها فترة حجز محددة يحددها فريق Sonic Bus.</p></div><div class="card"><h3>حجز موثّق</h3><p>بعد الحجز تحصل على كود فريد خاص بالحجز.</p></div></div></div></section></main>`) }
function authPage(register = false) { return `<main class="auth-wrap"><div class="auth"><div class="auth-logo"><img src="${logo}" alt="Sonic Bus"></div><h1>${register ? 'إنشاء حساب' : 'تسجيل الدخول'}</h1><p class="muted">${register ? 'سجل بياناتك وابدأ حجز رحلاتك.' : 'أهلاً بيك في Sonic Bus.'}</p><form onsubmit="submitAuth(event,${register})">${register ? `<div class="field"><label>الاسم</label><input name="name" required placeholder="اكتب اسمك الكامل"></div>` : ''}<div class="field"><label>رقم الهاتف</label><input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx"></div><div class="field"><label>كلمة المرور</label><input name="password" type="password" required minlength="6" placeholder="••••••••"></div><button class="btn btn-primary" style="width:100%">${register ? 'إنشاء الحساب' : 'دخول'}</button></form><div class="auth-switch">${register ? 'عندك حساب بالفعل؟' : 'لسه معندكش حساب؟'} <span class="link" onclick="location.hash='${register ? '#/login' : '#/register'}'">${register ? 'سجل دخول' : 'إنشاء حساب'}</span></div><div class="auth-switch"><span class="link" onclick="location.hash='#/'">العودة للرئيسية</span></div></div></main>` }
async function submitAuth(e, register) {
    e.preventDefault();

    const f = new FormData(e.target);
    const body = Object.fromEntries(f.entries());

    try {
        const data = await api(
            register ? '/auth/register' : '/auth/login',
            {
                method: 'POST',
                body: JSON.stringify(body)
            }
        );

        setAuth(data);

        toast(
            register
                ? 'تم إنشاء الحساب بنجاح'
                : 'تم تسجيل الدخول بنجاح'
        );

        location.hash =
            data.user.role === 'Admin'
                ? '#/admin'
                : '#/trips';

        render();

    } catch (err) {
        console.error('AUTH ERROR:', err);
        toast(err.message || 'حدث خطأ أثناء تسجيل الدخول.', true);
    }
} function demoAuth(register, b) { const s = state(); let u = s.users.find(x => x.phone === b.phone); if (register) { if (u) throw new Error('رقم الهاتف مستخدم بالفعل.'); u = { id: Date.now(), name: b.name, phone: b.phone, password: b.password, role: 'Student', cancellationCount: 0, bannedUntil: null }; s.users.push(u); saveState(s); return { token: 'demo', user: { id: u.id, name: u.name, phone: u.phone, role: u.role, cancellationCount: 0, bannedUntil: null } } } if (!u || u.password !== b.password) throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة.'); return { token: 'demo', user: u } }

function tripsPage() { return shell(`<main class="page"><section class="dashboard-head"><div class="container"><h1>الرحلات المتاحة</h1><p>اختار الرحلة ونقطة الركوب المناسبة ليك.</p></div></section><section class="section"><div class="container"><div id="trip-list" class="cards"><div class="empty">جاري تحميل الرحلات...</div></div></div></section></main>`, 'trips') }
async function loadTrips() {
    try {
        const trips = await api('/trips');

        console.log('TRIPS FROM API:', trips);

        const currentUser = me();
        const isAdmin = currentUser?.role === 'Admin';

        let confirmedTripIds = new Set();

        if (!isAdmin) {
            try {
                const bookings = await api('/bookings/mine');

                confirmedTripIds = new Set(
                    bookings
                        .filter(b => b.status === 'Confirmed')
                        .map(b => Number(b.trip?.id))
                );
            } catch (error) {
                console.error('BOOKINGS FOR CHAT ERROR:', error);
            }
        }

        renderTripList(trips, confirmedTripIds);

    } catch (e) {
        console.error('TRIPS ERROR:', e);

        const s = state();
        const u = me();

        const confirmedTripIds = new Set(
            s.bookings
                .filter(b =>
                    b.userId === u?.id &&
                    b.status === 'Confirmed'
                )
                .map(b => Number(b.tripId))
        );

        renderTripList(
            s.trips,
            confirmedTripIds
        );
    }
}

function renderTripList(trips, confirmedTripIds = new Set()) {
    const el = document.getElementById('trip-list');
    if (!el) return;

    const currentUser = me();
    const isAdmin = currentUser?.role === 'Admin';

    // إخفاء الرحلات المنتهية عن الطالب فقط
    const visibleTrips = isAdmin
        ? trips
        : trips.filter(t => {
            if (!t.departureAt) return true;
            return new Date(t.departureAt).getTime() > Date.now();
        });

    if (!visibleTrips.length) {
        el.innerHTML = '<div class="empty">لا توجد رحلات متاحة حاليًا.</div>';
        return;
    }

    el.innerHTML = visibleTrips.map(t => {
        const departure = t.departureAt
            ? new Date(t.departureAt)
            : null;

        const day = departure
            ? departure.toLocaleDateString('ar-EG', {
                weekday: 'long'
            })
            : '—';

        const date = departure
            ? departure.toLocaleDateString('ar-EG', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : '—';

        const time = departure
            ? departure.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '—';

        return `
            <article class="card trip-card">

                <div class="trip-head">
                    <div class="trip-title">
                        ${esc(t.name)}
                    </div>

                    <span class="badge">
                        ${t.availableSeats > 0
                ? 'متاح للحجز'
                : 'مكتمل'}
                    </span>
                </div>

                <div class="route">
                    <span>${esc(t.from)}</span>
                    <span class="route-line"></span>
                    <span>${esc(t.to)}</span>
                </div>

                <div class="details">

                    <div class="detail">
                        اليوم
                        <b>${day}</b>
                    </div>

                    <div class="detail">
                        التاريخ
                        <b>${date}</b>
                    </div>

                    <div class="detail">
                        الوقت
                        <b>${time}</b>
                    </div>

                    <div class="detail">
                        المقاعد
                        <b>${t.availableSeats} متاح</b>
                    </div>

                    <div class="detail">
                        السعر
                        <b>${money(t.price)}</b>
                    </div>

                    <div class="detail">
                        السائق
                        <b>${esc(t.driver?.name || '—')}</b>
                    </div>

                </div>

                <div class="trip-footer">

                    <span class="price">
                        ${money(t.price)}
                        <span>عند الركوب</span>
                    </span>

                    <div style="
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                        justify-content:flex-end;
                    ">

                       ${
            isAdmin || confirmedTripIds.has(Number(t.id))
                ? `
            <button
                class="btn"
                onclick="location.hash='#/trip-chat/${t.id}'">
                💬 شات الرحلة
            </button>
          `
                : ''
}

                        <button
                            class="btn btn-primary"
                            ${t.availableSeats <= 0 ? 'disabled' : ''}
                            onclick='openTrip(${JSON.stringify(t).replace(/'/g, "&#39;")})'>
                            عرض التفاصيل
                        </button>

                    </div>

                </div>

            </article>
        `;
    }).join('');
}
    function openTrip(t) {
        const departure = t.departureAt ? new Date(t.departureAt) : null;

        const day = departure
            ? departure.toLocaleDateString('ar-EG', {
                weekday: 'long'
            })
            : '—';

        const date = departure
            ? departure.toLocaleDateString('ar-EG', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : '—';

        const time = departure
            ? departure.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '—';

        document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-backdrop" id="modal">
            <div class="modal">

                <div class="modal-head">
                    <h2>${esc(t.name)}</h2>
                    <button class="close" onclick="document.getElementById('modal').remove()">×</button>
                </div>

                <div class="trip-modal-date">
                    <div class="detail">
                        اليوم
                        <b>${day}</b>
                    </div>

                    <div class="detail">
                        التاريخ
                        <b>${date}</b>
                    </div>

                    <div class="detail">
                        الوقت
                        <b>${time}</b>
                    </div>
                </div>

                <div class="card" style="box-shadow:none;margin:12px 0">

                    <p>
                        <b>من:</b> ${esc(t.from)}
                        &nbsp;
                        <b>إلى:</b> ${esc(t.to)}
                    </p>

                    <p>
                        <b>السائق:</b>
                        ${esc(t.driver?.name || '—')}
                    </p>

                    <p>
                        <b>نوع المركبة:</b>
                        ${esc(t.driver?.vehicleType || '—')}
                    </p>

                    <p>
                        <b>رقم العربية:</b>
                        ${esc(t.driver?.vehiclePlate || '—')}
                    </p>

                    <p>
                        <b>الحجز:</b>
                        حتى ${fmt(t.bookingClosesAt)}
                    </p>

                    <p>
                        <b>الإلغاء:</b>
                        حتى ${fmt(t.cancellationClosesAt)}
                    </p>

                </div>

                <h3>اختار نقطة الركوب</h3>

                <div class="list">
                    ${(t.stops || [])
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(s => `
                            <label class="detail">
                                <input
                                    type="radio"
                                    name="stop"
                                    value="${s.id}"
                                    ${s.order === 1 ? 'checked' : ''}
                                >
                                ${esc(s.name)}
                            </label>
                        `)
                .join('')}
                </div>

                <button
                    class="btn btn-primary"
                    style="width:100%;margin-top:16px"
                    onclick="bookTrip(${t.id})">
                    تأكيد الحجز — ${money(t.price)}
                </button>

            </div>
        </div>
    `);
    } async function bookTrip(tripId) {
    if (!me()) {
        document.getElementById('modal')?.remove();
        toast('سجل الدخول أولاً عشان تقدر تحجز.', true);
        setTimeout(() => location.hash = '#/login', 1200);
        return;
    }

    const stop = Number(document.querySelector('input[name=stop]:checked')?.value);

    if (!stop) {
        return toast('اختار نقطة الركوب أولاً', true);
    }

    try {
        let r;

        try {
            r = await api('/bookings', {
                method: 'POST',
                body: JSON.stringify({ tripId, stopId: stop })
            });
        } catch (e) {
            r = demoBook(tripId, stop);
        }

        document.getElementById('modal')?.remove();
        toast('تم تأكيد الحجز — الكود ' + r.bookingCode);
        location.hash = '#/bookings';
        render();

    } catch (e) {
        toast(e.message, true);
    }
} function demoBook(tripId, stopId) { const s = state(), u = s.users.find(x => x.id === me().id), t = s.trips.find(x => x.id === tripId); if (!t) throw new Error('الرحلة غير موجودة.'); if (t.availableSeats <= 0) throw new Error('اكتملت مقاعد الرحلة.'); if (s.bookings.some(b => b.userId === u.id && b.tripId === tripId && b.status === 'Confirmed')) throw new Error('لا يمكنك حجز نفس الرحلة مرتين.'); const code = 'B' + s.nextBooking++; const b = { id: Date.now(), bookingCode: code, userId: u.id, tripId, stopId, status: 'Confirmed', createdAt: new Date().toISOString() }; s.bookings.push(b); t.availableSeats--; saveState(s); return { bookingCode: code } }

function bookingsPage() { return shell(`<main class="page"><section class="dashboard-head"><div class="container"><h1>حجوزاتي</h1><p>تابع حجوزاتك وأكواد الرحلات.</p></div></section><section class="section"><div class="container"><div id="booking-list" class="list"><div class="empty">جاري التحميل...</div></div></div></section></main>`) }
async function loadBookings() { try { const b = await api('/bookings/mine'); renderBookings(b) } catch { const s = state(), u = me(); renderBookings(s.bookings.filter(b => b.userId === u.id).map(b => { const t = s.trips.find(x => x.id === b.tripId), st = t?.stops.find(x => x.id === b.stopId); return { id: b.id, bookingCode: b.bookingCode, status: b.status, createdAt: b.createdAt, cancelledAt: b.cancelledAt, trip: { ...t, driver: t.driver }, stop: { name: st?.name } } })) } }
function renderBookings(rows) { const el = document.getElementById('booking-list'); if (!el) return; if (!rows.length) { el.innerHTML = '<div class="empty">لسه معندكش حجوزات.</div>'; return } el.innerHTML = rows.map(b => `<article class="booking"><div><div class="booking-code">${esc(b.bookingCode)}</div><b>${esc(b.trip.name)}</b><div><small>${fmt(b.trip.departureAt)} • ${esc(b.stop?.name || '')}</small></div><div class="${b.status === 'Confirmed' ? 'status-confirmed' : 'status-cancelled'}">${b.status === 'Confirmed' ? 'مؤكد' : 'ملغي'}</div></div>${b.status === 'Confirmed' && b.trip.tripStatus !== 'Cancelled' ? `<button class="btn btn-danger" onclick="cancelBooking(${b.id})">إلغاء الحجز</button>` : ''}</article>`).join('') }
async function cancelBooking(id) { if (!confirm('هل أنت متأكد من إلغاء الحجز؟')) return; try { try { await api('/bookings/' + id + '/cancel', { method: 'POST' }) } catch (e) { demoCancel(id) } toast('تم إلغاء الحجز وإعادة المقعد'); loadBookings() } catch (e) { toast(e.message, true) } }
function demoCancel(id) { const s = state(), u = s.users.find(x => x.id === me().id), b = s.bookings.find(x => x.id === id); if (!b || b.userId !== u.id) throw new Error('الحجز غير موجود.'); if (b.status === 'Cancelled') throw new Error('الحجز ملغي بالفعل.'); const t = s.trips.find(x => x.id === b.tripId); if (new Date() > new Date(t.cancellationClosesAt)) throw new Error('انتهى موعد إلغاء الحجز.'); b.status = 'Cancelled'; b.cancelledAt = new Date().toISOString(); t.availableSeats++; u.cancellationCount++; if (u.cancellationCount >= 10) { u.bannedUntil = new Date(Date.now() + 90 * 86400000).toISOString(); u.cancellationCount = 0 } saveState(s) }

function adminPage() { return shell(`<main class="page"><section class="dashboard-head"><div class="container"><h1>لوحة إدارة Sonic Bus</h1><p>إدارة الرحلات والحجوزات والطلاب.</p></div></section><section class="section"><div class="container"><div id="metrics" class="panel-grid"><div class="metric"><small>الطلاب</small><strong>—</strong></div><div class="metric"><small>الرحلات</small><strong>—</strong></div><div class="metric"><small>الحجوزات</small><strong>—</strong></div><div class="metric"><small>الحجوزات الملغاة</small><strong>—</strong></div></div><div class="admin-grid" style="margin-top:28px"><div class="card form-card"><h3>إنشاء رحلة جديدة</h3><form onsubmit="createTrip(event)"><div class="field"><label>اسم الرحلة</label><input name="name" required placeholder="أسوان → جامعة أسوان"></div><div class="two"><div class="field"><label>من</label><input name="from" required></div><div class="field"><label>إلى</label><input name="to" required></div></div><div class="two"><div class="field"><label>التاريخ والوقت</label><input type="datetime-local" name="departureAt" required></div><div class="field"><label>عدد المقاعد</label><input type="number" min="1" name="totalSeats" required></div></div><div class="field"><label>السعر</label><input type="number" min="0" step="0.01" name="price" required></div><div class="two"><div class="field"><label>فتح الحجز</label><input type="datetime-local" name="bookingOpensAt" required></div><div class="field"><label>إغلاق الحجز</label><input type="datetime-local" name="bookingClosesAt" required></div></div><div class="field"><label>آخر موعد للإلغاء</label><input type="datetime-local" name="cancellationClosesAt" required></div><h3>بيانات السائق</h3><div class="two"><div class="field"><label>اسم السائق</label><input name="driverName" required></div><div class="field"><label>رقم الهاتف</label><input name="driverPhone" required></div><div class="field"><label>نوع المركبة</label><input name="vehicleType" required placeholder="أتوبيس"></div><div class="field"><label>رقم المركبة / اللوحة</label><input name="vehiclePlate" required></div></div><h3>نقاط الركوب</h3><div id="stop-inputs" class="stops"><div class="stop-row"><input name="stops" required placeholder="نقطة الركوب 1"><button type="button" onclick="this.parentElement.remove()">×</button></div></div><button type="button" class="btn btn-outline" style="margin-top:8px" onclick="addStop()">+ إضافة نقطة</button><button class="btn btn-primary" style="width:100%;margin-top:14px">إنشاء الرحلة</button></form></div><div class="card"><div class="section-title"><div><h3>الرحلات</h3><p>اضغط على «الحجوزات» لرؤية الطلاب.</p></div></div><div id="admin-trips" class="list"><div class="empty">جاري التحميل...</div></div></div></div></div></section></main>`) }
function addStop() { document.getElementById('stop-inputs').insertAdjacentHTML('beforeend', '<div class="stop-row"><input name="stops" required placeholder="نقطة الركوب"><button type="button" onclick="this.parentElement.remove()">×</button></div>') }
async function loadAdmin() { try { const [m, trips] = await Promise.all([api('/admin/dashboard'), api('/admin/trips')]); renderMetrics(m); renderAdminTrips(trips) } catch { const s = state(); renderMetrics({ students: s.users.filter(u => u.role === 'Student').length, trips: s.trips.length, bookings: s.bookings.filter(b => b.status === 'Confirmed').length, cancelledBookings: s.bookings.filter(b => b.status === 'Cancelled').length }); renderAdminTrips(s.trips.map(t => ({ ...t, status: t.status, driver: t.driver }))) } }
function renderMetrics(m) { const el = document.getElementById('metrics'); if (!el) return; el.innerHTML = [['الطلاب', m.students], ['الرحلات', m.trips], ['الحجوزات', m.bookings], ['الحجوزات الملغاة', m.cancelledBookings]].map(x => `<div class="metric"><small>${x[0]}</small><strong>${Number(x[1]).toLocaleString('ar-EG')}</strong></div>`).join('') }
function renderAdminTrips(rows) {
    const el = document.getElementById('admin-trips');
    if (!el) return;

    if (!rows.length) {
        el.innerHTML = '<div class="empty">لا توجد رحلات.</div>';
        return;
    }

    el.innerHTML = rows.map(t => `
        <div class="booking">

            <div>
                <b>${esc(t.name)}</b>

                <div>
                    <small>
                        ${fmt(t.departureAt)} •
                        ${t.availableSeats}/${t.totalSeats} مقعد متاح
                    </small>
                </div>

                <div>
                    <small>
                        السائق: ${esc(t.driver?.name || '—')}
                    </small>
                </div>

                <div class="${t.status === 'Cancelled'
            ? 'status-cancelled'
            : 'status-confirmed'}">
                    ${t.status === 'Cancelled' ? 'ملغاة' : 'نشطة'}
                </div>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap">

                <button
                    class="btn"
                    onclick="location.hash='#/trip-chat/${t.id}'">
                    💬 شات الرحلة
                </button>

                <button
                    class="btn btn-outline"
                    onclick="showAdminBookings(${t.id})">
                    الحجوزات
                </button>

                ${t.status !== 'Cancelled'
            ? `
                        <button
                            class="btn btn-danger"
                            onclick="cancelTrip(${t.id})">
                            إلغاء الرحلة
                        </button>
                    `
            : ''
        }

            </div>

        </div>
    `).join('');
} async function createTrip(e) { e.preventDefault(); const f = new FormData(e.target); const g = n => f.get(n); const stops = [...document.querySelectorAll('input[name=stops]')].map(x => x.value.trim()).filter(Boolean); const req = { name: g('name'), from: g('from'), to: g('to'), departureAt: new Date(g('departureAt')).toISOString(), totalSeats: Number(g('totalSeats')), price: Number(g('price')), bookingOpensAt: new Date(g('bookingOpensAt')).toISOString(), bookingClosesAt: new Date(g('bookingClosesAt')).toISOString(), cancellationClosesAt: new Date(g('cancellationClosesAt')).toISOString(), driver: { name: g('driverName'), phone: g('driverPhone'), vehicleType: g('vehicleType'), vehiclePlate: g('vehiclePlate') }, stops }; try { try { await api('/trips', { method: 'POST', body: JSON.stringify(req) }) } catch (e) { demoCreate(req) } toast('تم إنشاء الرحلة بنجاح'); e.target.reset(); document.getElementById('stop-inputs').innerHTML = '<div class="stop-row"><input name="stops" required placeholder="نقطة الركوب 1"><button type="button" onclick="this.parentElement.remove()">×</button></div>'; loadAdmin() } catch (e) { toast(e.message, true) } }
function demoCreate(r) { const s = state(), id = Math.max(0, ...s.trips.map(x => x.id)) + 1; s.trips.push({ id, ...r, status: 'Open', availableSeats: r.totalSeats, driver: r.driver, stops: r.stops.map((name, i) => ({ id: Date.now() + i, name, order: i + 1 })) }); saveState(s) }
async function showAdminBookings(tripId) { try { let rows; try { rows = await api('/admin/trips/' + tripId + '/bookings') } catch { const s = state(); rows = s.bookings.filter(b => b.tripId === tripId).map(b => { const u = s.users.find(x => x.id === b.userId), t = s.trips.find(x => x.id === tripId), st = t.stops.find(x => x.id === b.stopId); return { id: b.id, bookingCode: b.bookingCode, status: b.status, student: { name: u.name, phone: u.phone }, stop: st.name, createdAt: b.createdAt } }) } document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="admin-modal"><div class="modal"><div class="modal-head"><h2>طلاب الرحلة</h2><button class="close" onclick="document.getElementById('admin-modal').remove()">×</button></div><div class="table-wrap"><table class="table"><thead><tr><th>الطالب</th><th>الهاتف</th><th>الكود</th><th>النقطة</th><th>الحالة</th></tr></thead><tbody>${rows.map(b => `<tr><td>${esc(b.student?.name)}</td><td>${esc(b.student?.phone)}</td><td><b>${esc(b.bookingCode)}</b></td><td>${esc(b.stop)}</td><td>${b.status === 'Confirmed' ? 'مؤكد' : 'ملغي'}</td></tr>`).join('')}</tbody></table></div></div></div>`) } catch (e) { toast(e.message, true) } }
async function cancelTrip(id) { if (!confirm('إلغاء الرحلة سيظهر لجميع الطلاب كرحلة ملغاة. هل أنت متأكد؟')) return; try { try { await api('/trips/' + id + '/cancel', { method: 'POST' }) } catch (e) { const s = state(), t = s.trips.find(x => x.id === id); if (t) t.status = 'Cancelled'; saveState(s) } toast('تم إلغاء الرحلة'); loadAdmin() } catch (e) { toast(e.message, true) } }

async function render() {
    const route = location.hash || '#/';
    const u = me();
    let html = '';

    if (route === '#/' || route === '#') {
        html = home();
    }
    else if (route === '#/login') {
        html = authPage(false);
    }
    else if (route === '#/register') {
        html = authPage(true);
    }
    else if (route === '#/trips') {
        html = tripsPage();
    }
    else if (route === '#/bookings') {
        if (!u || u.role !== 'Student') {
            return location.hash = '#/login';
        }

        html = bookingsPage();
    }
    else if (route === '#/admin') {
        if (!u || u.role !== 'Admin') {
            return location.hash = '#/login';
        }

        html = adminPage();
    }
    else if (route.startsWith('#/trip-chat/')) {
        if (!u) {
            return location.hash = '#/login';
        }

        const tripId = Number(
            route.split('/')[2]
        );

        if (!tripId) {
            return location.hash = '#/trips';
        }

        html = tripChatPage(tripId);
    }
    else {
        html = home();
    }

    document.getElementById('app').innerHTML = html;

    if (route === '#/trips') {
        loadTrips();
    }

    if (route === '#/bookings') {
        loadBookings();
    }

    if (route === '#/admin') {
        loadAdmin();
    }

    if (route.startsWith('#/trip-chat/')) {
        const tripId = Number(
            route.split('/')[2]
        );

        await loadTripChat(tripId);

        try {
            await connectTripChat(
                tripId,
                addTripChatMessage
            );
        }
        catch (error) {
            console.error(
                'Trip chat connection failed:',
                error
            );
        }
    }
}
    window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

let tripChatConnection = null;
let currentChatTripId = null;

async function connectTripChat(tripId, onMessage) {
    currentChatTripId = tripId;

    if (tripChatConnection) {
        try {
            await tripChatConnection.stop();
        } catch {
        }
    }

    tripChatConnection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/trip-chat', {
            accessTokenFactory: () => token() || ''        })
        .withAutomaticReconnect()
        .build();

    tripChatConnection.on('ReceiveMessage', message => {
        if (message.tripId !== currentChatTripId) return;

        if (typeof onMessage === 'function') {
            onMessage(message);
        }
    });

    await tripChatConnection.start();

    await tripChatConnection.invoke(
        'JoinTrip',
        tripId
    );
}

async function disconnectTripChat() {
    if (!tripChatConnection) return;

    try {
        if (currentChatTripId) {
            await tripChatConnection.invoke(
                'LeaveTrip',
                currentChatTripId
            );
        }
    } catch {
    }

    try {
        await tripChatConnection.stop();
    } catch {
    }

    tripChatConnection = null;
    currentChatTripId = null;
}


function tripChatPage(tripId) {
    return shell(`
        <main class="auth-wrap">
            <div class="auth" style="max-width:700px;width:100%;">

                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                    <button
                        class="btn"
                        onclick="history.back()">
                        ← رجوع
                    </button>

                    <h1 style="margin:0;">
                        💬 شات الرحلة
                    </h1>
                </div>

                <div id="trip-chat-messages"
                     style="
                        height:400px;
                        overflow-y:auto;
                        padding:15px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        margin-bottom:15px;
                        background:#fafafa;
                     ">
                    <div class="muted" style="text-align:center;">
                        جاري تحميل الرسائل...
                    </div>
                </div>

                <form onsubmit="sendTripChatMessage(event)"
                      style="display:flex;gap:10px;">

                    <input
                        id="trip-chat-input"
                        type="text"
                        placeholder="اكتب رسالتك..."
                        autocomplete="off"
                        required
                        style="flex:1;">

                    <button
                        type="submit"
                        class="btn btn-primary">
                        إرسال
                    </button>

                </form>

            </div>
        </main>
    `);
}

async function loadTripChat(tripId) {
    const container =
        document.getElementById('trip-chat-messages');

    if (!container) return;

    try {
        const response = await fetch(
            `/api/trips/${tripId}/messages`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token()}`
                }
            }
        );

        if (!response.ok) {
            if (response.status === 403) {
                container.innerHTML = `
                    <div class="muted" style="text-align:center;">
                        لا يمكنك الدخول إلى شات هذه الرحلة.
                    </div>
                `;
                return;
            }

            throw new Error('Failed to load messages');
        }

        const messages = await response.json();

        container.innerHTML = '';

        messages.forEach(message => {
            addTripChatMessage(message);
        });

        container.scrollTop = container.scrollHeight;

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <div class="muted" style="text-align:center;">
                حدث خطأ أثناء تحميل الرسائل.
            </div>
        `;
    }
}

function addTripChatMessage(message) {
    const container =
        document.getElementById('trip-chat-messages');

    if (!container) return;

    const currentUser = me();

    const isMine =
        currentUser &&
        Number(currentUser.id) === Number(message.userId);

    const messageElement = document.createElement('div');

    messageElement.style.cssText = `
        display:flex;
        justify-content:${isMine ? 'flex-end' : 'flex-start'};
        margin-bottom:10px;
    `;

    messageElement.innerHTML = `
        <div style="
            max-width:75%;
            padding:10px 14px;
            border-radius:12px;
            background:${isMine ? '#ff9f1c' : '#ffffff'};
            color:${isMine ? '#ffffff' : '#222'};
            border:1px solid #ddd;
        ">
            <div style="
                font-size:12px;
                font-weight:bold;
                margin-bottom:4px;
            ">
                ${message.userName}
            </div>

            <div>
                ${message.message}
            </div>

            <div style="
                font-size:10px;
                opacity:.7;
                margin-top:5px;
            ">
                ${new Date(message.createdAt).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
    })}
            </div>
        </div>
    `;

    container.appendChild(messageElement);

    container.scrollTop = container.scrollHeight;
}


async function sendTripChatMessage(event) {
    event.preventDefault();

    const input = document.getElementById('trip-chat-input');
    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    if (
        !tripChatConnection ||
        tripChatConnection.state !== signalR.HubConnectionState.Connected
    ) {
        console.error(
            'Trip chat is not connected. Current state:',
            tripChatConnection?.state
        );
        return;
    }

    const tripId =
        Number(location.hash.split('/').pop());

    try {
        await tripChatConnection.invoke(
            'SendMessage',
            tripId,
            message
        );

        input.value = '';
        input.focus();

    } catch (error) {
        console.error('SEND CHAT ERROR:', error);
    }
}