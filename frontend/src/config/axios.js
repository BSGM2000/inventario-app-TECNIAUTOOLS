import axios from 'axios';

// Crear una instancia de axios con configuración por defecto
const api = axios.create({
    baseURL: 'https://inventario-app-tecniautools.onrender.com/api',
    withCredentials: true
});

// Interceptor para agregar el token y configurar headers según el tipo de datos
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Verificar si los datos son FormData y ajustar los headers
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers['Content-Type'] = 'application/json';
            config.headers['Accept'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // No redirigir al login si es un error 401 en el endpoint de registro
        if (error.response?.status === 401 && !error.config.url.includes('/auth/register')) {
            // Redirigir al login si el token expira o no es válido
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;