// routes/proveedoresRoutes.js
import express from 'express';
import { getAllProveedores } from '../controllers/proveedoresController.js';

const router = express.Router();

// Ruta GET para obtener todos los proveedores
router.get('/', getAllProveedores);

export default router;
