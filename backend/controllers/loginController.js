import db from './config/db.js'; // Asegúrate de que tienes configurada la conexión a la base de datos
import bcrypt from 'bcrypt'; // Para manejar contraseñas encriptadas (opcional)
import jwt from 'jsonwebtoken'; // Para generar tokens JWT

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe en la base de datos
    const sql = 'SELECT * FROM Usuarios WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Error al buscar el usuario:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const user = results[0];

      // Verificar la contraseña (si está encriptada, usa bcrypt.compare)
      const isPasswordValid = password === user.password; // Cambia esto si usas bcrypt
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar un token JWT
      const token = jwt.sign({ id_usuario: user.id_usuario }, 'secreto', {
        expiresIn: '1h', // El token expira en 1 hora
      });

      res.json({ token });
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});