document.addEventListener('DOMContentLoaded', () => {
    if (!api.isAuthenticated()) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    const bookingsList = document.getElementById('bookings-list');
    const noBookings = document.getElementById('no-bookings');
    const logoutBtn = document.getElementById('logout-btn');
    const updateModal = document.getElementById('update-modal');
    const updateForm = document.getElementById('update-form');
    const closeUpdateModal = document.getElementById('close-update-modal');

    loadMyBookings();

    async function loadMyBookings() {
        try {
            const res = await api.request('/bookings');
            
            if (res.data.length === 0) {
                noBookings.classList.remove('hidden');
                bookingsList.innerHTML = '';
            } else {
                noBookings.classList.add('hidden');
                renderBookings(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderBookings(bookings) {
        bookingsList.innerHTML = bookings.map(b => {
             const event = b.event || { title: 'Ouchirilgan tadbir', location: '-', date: new Date() };
             const date = new Date(event.date);
             return `
                 <div class="card-vibrant bg-gray-900 border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 group">
                    <div class="flex items-center gap-10">
                        <div class="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5">
                            <i data-lucide="ticket" class="w-12 h-12"></i>
                        </div>
                        <div>
                            <h3 class="text-3xl font-display font-black text-white italic tracking-tighter group-hover:text-primary transition-colors italic">${event.title}</h3>
                            <div class="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500 mt-3 italic">
                                <span class="flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 text-secondary"></i> ${date.toLocaleDateString()}</span>
                                <span class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-secondary"></i> ${event.location}</span>
                            </div>
                            <div class="mt-6 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 inline-block">
                                <p class="text-[9px] uppercase tracking-widest font-black text-gray-400">
                                    BRON EGASI: <span class="text-white">${b.name}</span> | <span class="text-white">${b.email}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button onclick="openUpdateModal('${b._id}', '${b.name}', '${b.email}')" class="btn-vibrant border border-white/10 text-white hover:bg-white/5 hover:border-white/20 !px-8">O'zgartirish</button>
                        <button onclick="cancelBooking('${b._id}')" class="btn-vibrant bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all !px-8">Bekor qilish</button>
                    </div>
                 </div>
             `;
        }).join('');
        lucide.createIcons();
    }

    window.openUpdateModal = (id, name, email) => {
        document.getElementById('update-id').value = id;
        document.getElementById('update-name').value = name;
        document.getElementById('update-email').value = email;
        updateModal.classList.remove('hidden');
    };

    closeUpdateModal.onclick = () => updateModal.classList.add('hidden');

    updateForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('update-id').value;
        const name = document.getElementById('update-name').value;
        const email = document.getElementById('update-email').value;

        try {
            await api.request(`/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, email })
            });

            showToast('Malumotlar yangilandi!');
            updateModal.classList.add('hidden');
            loadMyBookings();
        } catch (error) {
            alert(error.message);
        }
    };

    window.cancelBooking = async (id) => {
        if (confirm('Rostdan ham ushbu bronni bekor qilmoqchimisiz?')) {
            try {
                await api.request(`/bookings/${id}`, { method: 'DELETE' });
                showToast('Bron bekor qilindi');
                loadMyBookings();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    logoutBtn.onclick = () => api.logout();
});
