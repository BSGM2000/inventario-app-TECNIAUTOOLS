// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import repuestosRoutes from './routes/repuestosRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

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
app.use('/api/categorias', categoriasRoutes); // ← Agregado
app.use('/api/proveedores', proveedoresRoutes); // ← Agregado



// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
