// routes/categoriasRoutes.js
import express from 'express';
import { getAllCategorias } from '../controllers/categoriasController.js';

const router = express.Router();

// Ruta GET para obtener todas las categorías
router.get('/', getAllCategorias);

export default router;
