// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import repuestosRoutes from './routes/repuestosRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';

dotenv.config();
const app = express();

// Middleware para leer JSON
app.use(cors());
app.use(express.json());


// Usar rutas
app.use('/api/repuestos', repuestosRoutes);
app.use('/api/categorias', categoriasRoutes); // ← Agregado
app.use('/api/proveedores', proveedoresRoutes); // ← Agregado

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
