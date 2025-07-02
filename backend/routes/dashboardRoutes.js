import express from 'express';
import {
    getComprasStats,
    getVentasStats,
    getRepuestosBajoStock
} from '../controllers/dashboardController.js';

const router = express.Router();


// Rutas para estadísticas
router.get('/compras/stats', getComprasStats);
router.get('/ventas/stats', getVentasStats);
router.get('/repuestos/stock-bajo', getRepuestosBajoStock);

export default router;