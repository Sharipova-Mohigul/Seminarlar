document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await api.request('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                api.setAuth(data.token, data.user);
                
                if (data.user.role === 'admin') {
                    window.location.href = '/frontend/pages/dashboard.html';
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            try {
                const data = await api.request('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, role })
                });

                api.setAuth(data.token, data.user);
                
                if (data.user.role === 'admin') {
                    window.location.href = '/frontend/pages/dashboard.html';
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }
});
