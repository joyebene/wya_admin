document.addEventListener('DOMContentLoaded', () => {
    const createAdminBtn = document.getElementById('create-admin-btn');
    if (createAdminBtn) {
        createAdminBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('new-admin-email');
            const passwordInput = document.getElementById('new-admin-password');

            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                alert('Please provide both an email and a password.');
                return;
            }

            try {
                // We need to create a JSON body for this request
                const response = await api.post('/admin/register', JSON.stringify({ email, password }), 'application/json');
                alert('Admin created successfully!');
                emailInput.value = '';
                passwordInput.value = '';
            } catch (error) {
                console.error('Failed to create admin:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }
});