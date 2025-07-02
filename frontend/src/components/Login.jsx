import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import api from "../config/axios"; // Asegúrate de que 'api' es tu instancia de axios.create
import axios from "axios"; // Importar axios para manejar errores

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores anteriores

    try {
      console.log('Iniciando solicitud de login para:', email);
      const response = await api.post("auth/login", {
        email,
        password
      });

      // Axios ya parsea la respuesta JSON y la pone en response.data
      const data = response.data;
      console.log('Datos de la respuesta (response.data):', data);

      // Axios lanza un error para estados 4xx/5xx, así que esta verificación no es estrictamente necesaria
      // si confías en el catch de axios para manejar errores HTTP.
      // Pero si tu backend siempre devuelve 200 OK y el 'success: false' está en el cuerpo, sí es necesaria.
      if (data.success && data.data && data.data.token) {
        console.log('Token recibido, guardando en localStorage...');
        localStorage.setItem('token', data.data.token);
        onLoginSuccess(data.data.token); // Llamar al callback de éxito
      } else {
        // Si la respuesta es 200 OK pero el backend indica un error en el cuerpo
        throw new Error(data.message || 'Credenciales incorrectas o error desconocido');
      }
    } catch (err) {
      // Axios captura automáticamente errores de red y respuestas 4xx/5xx aquí
      console.error('Error en handleSubmit:', err);

      let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';

      if (axios.isAxiosError(err)) { // Verificar si es un error de Axios
        if (err.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          errorMessage = err.response.data.message || 'Error en el servidor.';
        } else if (err.request) {
          // La solicitud fue hecha pero no se recibió respuesta (ej. red caída)
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else {
          // Algo más ocurrió al configurar la solicitud
          errorMessage = 'Error al configurar la solicitud.';
        }
      } else {
        // Otros tipos de errores (ej. el throw new Error(data.message) personalizado)
        errorMessage = err.message;
      }
      setError(errorMessage);
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