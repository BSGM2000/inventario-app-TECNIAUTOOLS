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
import ubicacionesRoutes from './routes/ubicacionesRoutes.js';
import movimientosRoutes from './routes/movimientosRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
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
// Configuración CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Especifica el origen exacto
  credentials: true, // Permite el envío de credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());

// Usar rutas o end points

app.use('/uploads', express.static(path.join(__dirname,'uploads')));// ← Agregado
console.log('Ruta de archivos públicos:', path.join(__dirname, 'uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/repuestos', verifyToken, repuestosRoutes);
app.use('/api/categorias', verifyToken, categoriasRoutes);
app.use('/api/proveedores', verifyToken, proveedoresRoutes);
app.use('/api/clientes', verifyToken, clientesRoutes);
app.use('/api/compras', verifyToken, comprasRoutes);
app.use('/api/ventas', verifyToken, ventasRoutes);
app.use('/api/ubicaciones', verifyToken, ubicacionesRoutes);
app.use('/api/movimientos', verifyToken, movimientosRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});