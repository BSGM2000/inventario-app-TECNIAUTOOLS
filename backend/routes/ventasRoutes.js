import express from 'express';
import {
  getAllVentas,
  createVenta,
  getVentaById,
  updateVenta,
  deleteVenta
} from '../controllers/ventasController.js';


const router = express.Router();

// Rutas para ventas
router.get('/',  getAllVentas); // Obtener todas las ventas
router.post('/',  createVenta); // Crear una nueva venta
router.get('/:id',  getVentaById); // Obtener una venta por ID
router.put('/:id',  updateVenta); // Actualizar una venta
router.delete('/:id', deleteVenta); // Eliminar una venta

export default router;