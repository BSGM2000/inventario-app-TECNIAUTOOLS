// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import repuestosRoutes from './routes/repuestosRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import proveedoresRoutes from './routes/proveedoresRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import comprasRoutes from './routes/comprasRoutes.js';
import ventasRoutes from './routes/ventasRoutes.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import verifyToken from './middleware/auth.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('Iniciando aplicación con configuración:', {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME
});
const app = express();

// Middleware para leer JSON
app.use(cors(
  { origin: '*' } // Cambia esto a la URL de tu frontend
));
app.use(express.json());

// Usar rutas o end points

app.use('/uploads', express.static(path.join(__dirname,'uploads')));// ← Agregado
console.log('Ruta de archivos públicos:', path.join(__dirname, 'uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/repuestos', verifyToken, repuestosRoutes);
app.use('/api/categorias', verifyToken, categoriasRoutes); // ← Agregado
app.use('/api/proveedores', verifyToken, proveedoresRoutes); // ← Agregado
app.use('/api/clientes', verifyToken, clientesRoutes); // ← Agregado
app.use('/api/compras', verifyToken, comprasRoutes); // ← Agregado
app.use('/api/ventas', verifyToken, ventasRoutes); // ← Agregado


// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});