const API_BASE_URL = 'https://wya-backend-vv7q.onrender.com/api/v1';

// Helper functions for localStorage
const storeTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};


const api = {
    async _fetchWithAuth(url, options = {}) {
        // Add Authorization header to all authenticated requests
        const token = getAccessToken();
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
            };
        }

        let response = await fetch(url, options);

        // If token is expired (401), try to refresh it
        if (response.status === 401) {
            console.log('Access token expired. Trying to refresh...');

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                console.log('No refresh token available. Logging out.');
                clearTokens();
                window.location.href = '/admin/index.html';
                throw new Error('Session expired');
            }

            const refreshResponse = await fetch(`${API_BASE_URL}/admin/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
                console.log('Token refreshed, retrying original request...');
                const { accessToken: newAccessToken } = await refreshResponse.json();
                storeTokens(newAccessToken, refreshToken); // Update the stored access token

                // Retry the original request with the new token
                options.headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(url, options);
            } else {
                console.log('Refresh failed. Logging out...');
                clearTokens();
                window.location.href = '/admin/index.html';
                throw new Error('Session expired');
            }
        }

        return response;
    },

    async get(endpoint) {
        const response = await this._fetchWithAuth(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        return response.json();
    },

    async post(endpoint, body, isFormData = false) {
        const options = {
            method: 'POST',
            headers: {}
        };

        if (isFormData) {
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        // Login is a special case, it doesn't need auth headers
        if (endpoint === '/admin/login') {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            }
            const data = await response.json();
            // Store tokens after successful login
            if (data.accessToken && data.refreshToken) {
                storeTokens(data.accessToken, data.refreshToken);
            }
            return data;
        }

        const response = await this._fetchWithAuth(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        return response.json();
    },

    async put(endpoint, body, isFormData = false) {
        const options = {
            method: 'PUT',
            headers: {}
        };

        if (isFormData) {
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await this._fetchWithAuth(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return response.json();
    },

    async delete(endpoint) {
        const response = await this._fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return response.json();
    },

    // A new, simple logout method
    async logout() {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            try {
                // Inform the backend that the token is no longer in use
                await this.post('/admin/logout', { refreshToken });
            } catch (error) {
                console.error("Logout failed on server, clearing tokens locally anyway.", error);
            }
        }
        clearTokens(); // Always clear local tokens
        window.location.href = '/admin/index.html';
    }
};