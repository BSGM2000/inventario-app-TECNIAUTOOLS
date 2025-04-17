// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import repuestosRoutes from './routes/repuestosRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import verifyToken from './middleware/auth.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



dotenv.config();
const app = express();

// Middleware para leer JSON
app.use(cors(
  { origin: '*' } // Cambia esto a la URL de tu frontend
));
app.use(express.json());




// Usar rutas o end points

app.use('/uploads', express.static(path.join(__dirname,'uploads')));// ← Agregado
console.log('Ruta de archivos públicos:', path.join(__dirname, 'uploads'));

app.use('/api/repuestos', repuestosRoutes);
app.get('/api/repuestos', verifyToken, (req, res) => {
  const sql = 'SELECT * FROM Repuestos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener repuestos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});
app.use('/api/categorias', categoriasRoutes); // ← Agregado
app.use('/api/proveedores', proveedoresRoutes); // ← Agregado
app.use('/api/clientes', clientesRoutes); // ← Agregado
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    console.log('Email recibido:', email);
    console.log('Contraseña recibida:', password);
    // Verificar si el usuario existe en la base de datos
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Error al buscar el usuario:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const user = results[0];

      // Verificar la contraseña encriptada
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('¿Contraseña válida?:', isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar un token JWT
      const token = jwt.sign({ id_usuario: user.id_usuario }, 'secreto', {
        expiresIn: '1h', // El token expira en 1 hora
      });
      console.log('Token generado:', token);

      res.json({ token });
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
