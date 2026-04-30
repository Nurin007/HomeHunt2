const API_BASE_URL = 'http://localhost:5000/api';

class Api {
    static async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    }

    static async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static async getProperties() {
        const response = await fetch(`${API_BASE_URL}/properties`);
        return response.json();
    }

    static async addProperty(propertyData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(propertyData)
        });
        return response.json();
    }

    static async uploadImage(imageFile) {
        const formData = new FormData();
        formData.append('property_image', imageFile);

        const response = await fetch(`http://localhost/HomeHunt2/backend-php/upload.php`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    }
}

// UI Helpers
function updateNavigation() {
    const user = Api.getUser();
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (user) {
        let dashboardLink = 'dashboard.html';
        navLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="properties.html">Properties</a></li>
            <li><a href="${dashboardLink}">Dashboard</a></li>
            <li><a href="#" id="logout-btn">Logout (${user.name})</a></li>
        `;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            Api.logout();
        });
    } else {
        navLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="properties.html">Properties</a></li>
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html" class="btn-primary">Sign Up</a></li>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});
