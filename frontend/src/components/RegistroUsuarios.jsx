// frontend/src/components/RegistroUsuarios.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Form.module.css';

const RegistroUsuarios = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirm_password: '',
        nombre: '',
        currentPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/auth/register', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setSuccess('Usuario registrado exitosamente');
            // Limpiar formulario
            setFormData({
                email: '',
                password: '',
                confirm_password: '',
                nombre: '',
                currentPassword: ''
            });
        } catch (err) {
            console.error('Error completo al registrar usuario:', {
                response: err.response,
                request: err.request,
                message: err.message,
                config: err.config
            });
            setError(err.response?.data?.error || 'Error al registrar el usuario. Verifica la consola para más detalles.');
        }
    };  

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Registrar Nuevo Usuario</h2>
            {error && <div className={styles.errorModal}>{error}</div>}
            {success && <div className={styles.successModal}>{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre" className={styles.label}>Nombre</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input
                        type="email"
                        className={styles.inputField}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>Contraseña</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirm_password" className={styles.label}>Confirmar Contraseña</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="currentPassword" className={styles.label}>Tu Contraseña Actual</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                    <div className={styles.label}>Ingresa tu contraseña actual para confirmar el registro</div>
                </div>

                <button type="submit" className={styles.submitButton}>Registrar Usuario</button>
            </form>
        </div>
    );
};

export default RegistroUsuarios;