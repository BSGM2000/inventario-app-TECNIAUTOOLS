import express from 'express';
import upload from '../config/upload.js';
import verifyToken from '../middleware/auth.js';
import {
  getAllRepuestos,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto,
  actualizarStockRepuesto,
  precioCompraSinIva // Importa la nueva función controladora
} from '../controllers/repuestosController.js';

const router = express.Router();

router.get('/', verifyToken, getAllRepuestos);
router.post('/', verifyToken, upload.single("imagen"), createRepuesto);
router.put('/:id', verifyToken, upload.single("imagen"), updateRepuesto);
router.delete('/:id', verifyToken, deleteRepuesto);
router.post('/actualizar-stock/:id', verifyToken, actualizarStockRepuesto); // Nueva ruta para actualizar el stock
router.get('/precio-compra/:id_repuesto', verifyToken, precioCompraSinIva); // Nueva ruta para obtener el precio de compra sin IVA
export default router;
