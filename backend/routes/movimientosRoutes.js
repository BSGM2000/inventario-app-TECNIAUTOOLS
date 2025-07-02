import express from 'express';
import {
  getAllMovimientos,
  realizarTraslado,
  realizarAjuste
} from '../controllers/movimientosController.js';

const router = express.Router();

// Rutas para movimientos de inventario
router.get('/', getAllMovimientos);
router.post('/traslado', realizarTraslado);
router.post('/ajuste', realizarAjuste);

export default router;