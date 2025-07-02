import express from 'express';
import upload from '../config/upload.js';
import {
  getAllRepuestos,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto,
  actualizarStockRepuesto,
  precioCompraSinIva,
  trasladarStock,
  getStockPorUbicacion
} from '../controllers/repuestosController.js';
import { importarRepuestos } from '../controllers/importController.js';

const router = express.Router();

router.get('/', getAllRepuestos);
router.post('/', upload.single("imagen"), createRepuesto);
router.put('/:id', upload.single("imagen"), updateRepuesto);
router.delete('/:id', deleteRepuesto);
router.post('/actualizar-stock/:id', actualizarStockRepuesto); // Nueva ruta para actualizar el stock
router.get('/precio-compra/:id_repuesto', precioCompraSinIva); // Nueva ruta para obtener el precio de compra sin IVA
router.post('/trasladar', trasladarStock);
router.get('/stock-por-ubicacion/:idRepuesto/:idUbicacion', getStockPorUbicacion);
router.post('/importar', upload.single('archivo'), importarRepuestos);
export default router;
