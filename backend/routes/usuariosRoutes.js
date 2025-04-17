import bcrypt from 'bcrypt';
import db from './config/db.js';

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Encriptar la contraseña
    const saltRounds = 10;
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('123456', hashedPassword);

    // Guardar el usuario en la base de datos
    const sql = 'INSERT INTO Usuarios (email, password) VALUES (?, ?)';
    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});