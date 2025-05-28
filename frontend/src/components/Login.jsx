import React, { useState } from "react";
import styles from "../styles/Login.module.css"; // Asegúrate de que la ruta sea correcta


const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        console.log('Iniciando solicitud de login...');
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Respuesta recibida:', response);

        const data = await response.json();
        console.log('Datos de la respuesta:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Error en la autenticación');
        }

        if (data.success && data.data && data.data.token) {
            console.log('Token recibido, guardando en localStorage...');
            localStorage.setItem('token', data.data.token);
            onLoginSuccess(data.data.token);
        } else {
            throw new Error(data.message || 'Error en la autenticación');
        }
    } catch (err) {
        console.error('Error en handleSubmit:', err);
        setError(err.message || 'Error al iniciar sesión');
    }
};

  return (
    <div className={styles.loginContainer}>
      <form
        onSubmit={handleSubmit}
        className={styles.loginForm}
      >
        <h2 className={styles.formTitle}>Iniciar Sesión</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <button
          type="submit"
          className={styles.loginButton}
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;