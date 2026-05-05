document.addEventListener('DOMContentLoaded', () => {
    const eventsGrid = document.getElementById('events-grid');
    const userNav = document.getElementById('user-nav');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const closeModal = document.getElementById('close-modal');

    let currentEventId = null;

    // Initialize UI
    updateNav();
    loadEvents();

    function updateNav() {
        if (api.isAuthenticated()) {
            userNav.innerHTML = `
                <a href="/frontend/pages/my-bookings.html" class="text-sm font-bold text-gray-400 hover:text-white transition-colors">Mening Bronlarim</a>
                ${api.isAdmin() ? `<a href="/frontend/pages/dashboard.html" class="px-5 py-2 text-sm font-black text-secondary bg-secondary/10 border border-secondary/20 rounded-xl hover:bg-secondary/20 transition">Boshqaruv</a>` : ''}
                <button onclick="api.logout()" class="px-6 py-2 text-sm font-black text-white bg-gray-800 border border-white/5 rounded-xl hover:bg-gray-700 transition">Chiqish</button>
            `;
        } else {
            userNav.innerHTML = `
                <a href="/frontend/pages/login.html" class="text-sm font-bold text-gray-400 hover:text-white transition-colors">Kirish</a>
                <a href="/frontend/pages/register.html" class="btn-vibrant btn-primary !py-2 !px-6 text-sm">Ro'yxatdan o'tish</a>
            `;
        }
    }

    async function loadEvents(search = '') {
        const loading = document.getElementById('events-loading');
        if (!eventsGrid) return;
        eventsGrid.innerHTML = '';
        if (loading) loading.classList.remove('hidden');

        try {
            const res = await api.request(`/events?search=${search}`);
            if (loading) loading.classList.add('hidden');

            if (res.data.length === 0) {
                eventsGrid.innerHTML = '<p class="col-span-full text-center py-20 text-gray-600 font-black uppercase tracking-widest italic opacity-50">Hech qanday tadbir topilmadi.</p>';
                return;
            }

            res.data.forEach(event => {
                const card = document.createElement('div');
                card.className = "card-vibrant group bg-gray-900 border-white/5";
                
                const date = new Date(event.date);
                const isFull = event.availableSeats <= 0;

                card.innerHTML = `
                    <div class="relative h-60 bg-gray-800/50 rounded-[2rem] flex items-center justify-center overflow-hidden mb-6">
                        <i data-lucide="sparkles" class="w-16 h-16 text-white/5 rotate-12"></i>
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
                        <div class="absolute top-4 right-4 bg-primary px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-xl shadow-primary/30 border border-white/10 uppercase tracking-widest">
                            ${event.availableSeats} / ${event.maxSeats} joy qoldi
                        </div>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 text-[10px] font-black text-secondary mb-3 uppercase tracking-widest">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            ${date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <h3 class="text-2xl font-display font-black text-white mb-3 tracking-tighter group-hover:text-primary transition-colors italic">${event.title}</h3>
                        <p class="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">${event.description}</p>
                        
                        <div class="flex items-center gap-2 text-xs text-gray-400 mb-8 border-t border-white/5 pt-6">
                            <i data-lucide="map-pin" class="w-4 h-4 text-primary"></i>
                            ${event.location}
                        </div>

                        <button 
                            onclick="window.openBookingModal('${event._id}', '${event.title.replace(/'/g, "\\'")}')"
                            ${isFull ? 'disabled' : ''}
                            class="w-full btn-vibrant ${isFull ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-white/5' : 'btn-accent !rounded-2xl tracking-tighter text-lg font-black uppercase'} "
                        >
                            ${isFull ? 'Joylar qolmagan' : 'Joy band qilish'}
                        </button>
                    </div>
                `;
                eventsGrid.appendChild(card);
            });
            lucide.createIcons();
        } catch (error) {
            if (loading) loading.classList.add('hidden');
            eventsGrid.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">${error.message}</p>`;
        }
    }

    // Search events
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadEvents(e.target.value);
        }, 300);
    });

    searchBtn.addEventListener('click', () => loadEvents(searchInput.value));

    // Global helper for opening modal
    window.openBookingModal = (id, title) => {
        if (!api.isAuthenticated()) {
            window.location.href = '/frontend/pages/login.html';
            return;
        }

        currentEventId = id;
        document.getElementById('modal-event-name').textContent = title;
        document.getElementById('book-name').value = api.user.name;
        document.getElementById('book-email').value = api.user.email;
        
        bookingModal.classList.remove('hidden');
    };

    closeModal.addEventListener('click', () => {
        bookingModal.classList.add('hidden');
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('book-name').value;
        const email = document.getElementById('book-email').value;

        try {
            await api.request(`/events/${currentEventId}/bookings`, {
                method: 'POST',
                body: JSON.stringify({ name, email })
            });

            showToast('Muvaffaqiyatli band qilindi!');
            bookingModal.classList.add('hidden');
            loadEvents(searchInput.value);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
});
