// frontend/src/components/RegistroUsuarios.jsx
import React, { useState } from 'react';
import styles from '../styles/Form.module.css';
import modalStyles from '../styles/Modal.module.css';
import api from '../config/axios';

const RegistroUsuarios = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirm_password: '',
        nombre: '',
        currentUserEmail: '',
        currentUserPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            await api.post('/auth/register', formData);
            
            setSuccess('Usuario registrado exitosamente');
            // Limpiar formulario
            setFormData({
                email: '',
                password: '',
                confirm_password: '',
                nombre: '',
                currentUserEmail: '',
                currentUserPassword: ''
            });
        } catch (err) {
            console.error('Error completo al registrar usuario:', {
                response: err.response,
                request: err.request,
                message: err.message,
                config: err.config
            });
            if (err.response?.status === 401) {
                setError('Las credenciales del usuario actual son incorrectas. Por favor, verifica tu correo y contraseña.');
            } else {
                setError(err.response?.data?.message || 'Error al registrar el usuario. Por favor, intenta nuevamente.');
            }
        }
    };  

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Registrar Nuevo Usuario</h2>
            {error && <div className={modalStyles.errorModal}>{error}</div>}
            {success && <div className={modalStyles.successModal}>{success}</div>}
            
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
                    <label htmlFor="currentUserEmail" className={styles.label}>Tu Correo Actual</label>
                    <input
                        type="email"
                        className={styles.inputField}
                        id="currentUserEmail"
                        name="currentUserEmail"
                        value={formData.currentUserEmail}
                        onChange={handleChange}
                        required
                    />
                    <div className={styles.label}>Ingresa tu correo actual para confirmar el registro</div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="currentUserPassword" className={styles.label}>Tu Contraseña Actual</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        id="currentUserPassword"
                        name="currentUserPassword"
                        value={formData.currentUserPassword}
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