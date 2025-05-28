import express from 'express';
import { getAllVentas, getVentaById, createVenta, updateVenta, deleteVenta } from '../controllers/ventaController.js';

const router = express.Router();

router.get('/', getAllVentas);
router.get('/:id', getVentaById);
router.post('/', createVenta);
router.put('/:id', updateVenta);
router.delete('/:id', deleteVenta);

export default router;
