import { api } from './api.js';
import '../../src/index.css';

document.addEventListener('DOMContentLoaded', () => {
    if (!api.isAdmin()) {
        window.location.href = '/';
        return;
    }

    const eventsList = document.getElementById('admin-events-list');
    const bookingsList = document.getElementById('admin-bookings-list');
    const eventModal = document.getElementById('event-modal');
    const eventForm = document.getElementById('event-form');
    const addEventBtn = document.getElementById('add-event-btn');
    const closeEventModal = document.getElementById('close-event-modal');
    const logoutBtn = document.getElementById('logout-btn');

    document.getElementById('admin-name').textContent = api.user.name;

    loadDashboard();

    async function loadDashboard() {
        try {
            const [eventsRes, bookingsRes, cancelledRes, usersRes] = await Promise.all([
                api.request('/events'),
                api.request('/bookings'),
                api.request('/bookings/cancelled'),
                api.request('/auth/users')
            ]);

            renderEvents(eventsRes.data);
            renderBookings(bookingsRes.data);
            renderCancellations(cancelledRes.data);
            renderUsers(usersRes.data);
            updateStats(eventsRes.data, bookingsRes.data);
        } catch (error) {
            console.error(error);
        }
    }

    function updateStats(events, bookings) {
        if (document.getElementById('stat-events')) document.getElementById('stat-events').textContent = events.length;
        if (document.getElementById('stat-bookings')) document.getElementById('stat-bookings').textContent = new Set(bookings.map(b => b.user?._id || b.user)).size;
        if (document.getElementById('stat-seats')) document.getElementById('stat-seats').textContent = bookings.length;
    }

    function renderCancellations(list) {
        const cancellationsList = document.getElementById('admin-cancellations-list');
        if (!cancellationsList) return;
        cancellationsList.innerHTML = list.map(c => `
             <tr class="hover:bg-red-400/5 transition-colors border-b border-white/5">
                <td class="py-5 font-bold text-white text-sm">
                    ${c.userName} <br>
                    <span class="text-[10px] text-gray-500 font-medium">${c.userEmail}</span>
                </td>
                <td class="py-5 text-gray-400 text-sm font-medium tracking-tight">${c.eventTitle}</td>
                <td class="py-5 text-right text-[10px] text-red-500 font-black uppercase tracking-widest">
                    ${new Date(c.cancelledAt).toLocaleString()}
                </td>
            </tr>
        `).join('');
    }

    function renderUsers(list) {
        const usersListEl = document.getElementById('admin-users-list');
        if (!usersListEl) return;
        usersListEl.innerHTML = list.map(u => `
            <tr class="hover:bg-secondary/5 transition-colors border-b border-white/5">
                <td class="py-5 font-bold text-white text-sm">
                    ${u.name} <br>
                    <span class="text-[10px] text-gray-500 font-medium">${u.email}</span>
                </td>
                <td class="py-5">
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-800 text-gray-400 border border-white/5'}">
                        ${u.role}
                    </span>
                </td>
                <td class="py-5 text-right text-[10px] text-gray-500 font-medium tracking-widest">
                    ${new Date(u.createdAt).toLocaleDateString()}
                </td>
            </tr>
        `).join('');
    }

    function renderEvents(events) {
        eventsList.innerHTML = events.map(ev => {
            const date = new Date(ev.date);
            return `
                <tr class="hover:bg-primary/5 transition-colors border-b border-white/5">
                    <td class="py-5 font-black text-white italic tracking-tight">${ev.title}</td>
                    <td class="py-5 text-gray-500 text-xs font-bold uppercase tracking-widest">
                         ${ev.location} <br>
                         <span class="text-primary">${date.toLocaleDateString()}</span>
                    </td>
                    <td class="py-5">
                        <span class="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black border border-primary/20">
                            ${ev.availableSeats} / ${ev.maxSeats}
                        </span>
                    </td>
                    <td class="py-5 text-right space-x-3">
                        <button onclick="editEvent('${ev._id}')" class="text-gray-500 hover:text-white transition-colors"><i data-lucide="edit-3" class="w-5 h-5"></i></button>
                        <button onclick="deleteEvent('${ev._id}')" class="text-gray-600 hover:text-red-400 transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    }

    function renderBookings(bookings) {
        bookingsList.innerHTML = bookings.map(b => {
             return `
                 <tr class="hover:bg-accent/5 transition-colors border-b border-white/5">
                    <td class="py-5 font-bold text-white text-sm">
                        ${b.name} <br>
                        <span class="text-[10px] text-gray-500 font-medium">${b.email}</span>
                    </td>
                    <td class="py-5 text-accent font-black text-[10px] uppercase tracking-widest leading-relaxed">${b.event ? b.event.title : 'Ouchirilgan tadbir'}</td>
                    <td class="py-5 text-right">
                        <button onclick="cancelBooking('${b._id}')" class="text-gray-600 hover:text-red-400 transition-all active:scale-90"><i data-lucide="x-circle" class="w-5 h-5"></i></button>
                    </td>
                </tr>
             `;
        }).join('');
        lucide.createIcons();
    }

    // Modal Handling
    addEventBtn.onclick = () => {
        document.getElementById('event-modal-title').textContent = "Yangi Tadbir Yaratish";
        document.getElementById('event-id').value = '';
        eventForm.reset();
        eventModal.classList.remove('hidden');
    };

    closeEventModal.onclick = () => eventModal.classList.add('hidden');

    eventForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('event-id').value;
        const payload = {
            title: document.getElementById('ev-title').value,
            description: document.getElementById('ev-description').value,
            date: document.getElementById('ev-date').value,
            maxSeats: document.getElementById('ev-maxSeats').value,
            location: document.getElementById('ev-location').value,
        };

        try {
            if (id) {
                await api.request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await api.request('/events', { method: 'POST', body: JSON.stringify(payload) });
            }
            eventModal.classList.add('hidden');
            loadDashboard();
        } catch (error) {
            alert(error.message);
        }
    };

    window.editEvent = async (id) => {
        const res = await api.request(`/events/${id}`);
        const ev = res.data;
        
        document.getElementById('event-modal-title').textContent = "Tadbirni Tahrirlash";
        document.getElementById('event-id').value = ev._id;
        document.getElementById('ev-title').value = ev.title;
        document.getElementById('ev-description').value = ev.description;
        
        // Format date for datetime-local
        const d = new Date(ev.date);
        const dateStr = d.toISOString().slice(0, 16);
        document.getElementById('ev-date').value = dateStr;
        
        document.getElementById('ev-maxSeats').value = ev.maxSeats;
        document.getElementById('ev-location').value = ev.location;

        eventModal.classList.remove('hidden');
    };

    window.deleteEvent = async (id) => {
        if (confirm('Ishonchingiz komilmi? Ushbu tadbirga tegishli barcha bronlar ham o\'chib ketadi.')) {
            await api.request(`/events/${id}`, { method: 'DELETE' });
            loadDashboard();
        }
    };

    window.cancelBooking = async (id) => {
        if (confirm('Bronni bekor qilmoqchimisiz?')) {
            await api.request(`/bookings/${id}`, { method: 'DELETE' });
            loadDashboard();
        }
    };

    logoutBtn.onclick = () => api.logout();
});
