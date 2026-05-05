const API_URL = '/api/v1';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();

            if (!response.ok) {
                // If token is invalid/expired
                if (response.status === 401 && !endpoint.includes('/auth/login')) {
                    this.logout();
                }
                throw new Error(data.message || data.error || 'Nimadir xato ketdi');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    isAuthenticated() {
        return !!this.token;
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }
}

const api = new ApiService();

// Toast helper
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    toastMessage.textContent = message;
    
    // Change style based on type
    const wrapper = toast.querySelector('div');
    if (type === 'error') {
        wrapper.classList.replace('border-indigo-500', 'border-red-500');
        toastIcon.classList.replace('text-indigo-500', 'text-red-500');
        toastIcon.setAttribute('data-lucide', 'alert-circle');
    } else {
        wrapper.classList.replace('border-red-500', 'border-indigo-500');
        toastIcon.classList.replace('text-red-500', 'text-indigo-500');
        toastIcon.setAttribute('data-lucide', 'check-circle');
    }

    lucide.createIcons();
    
    toast.classList.remove('translate-y-24');
    toast.classList.add('translate-y-0');

    setTimeout(() => {
        toast.classList.remove('translate-y-0');
        toast.classList.add('translate-y-24');
    }, 3000);
}
