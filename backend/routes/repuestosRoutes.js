// routes/repuestosRoutes.js
import express from 'express';
import {
  getAllRepuestos,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto
} from '../controllers/repuestosController.js';

const router = express.Router();

router.get('/', getAllRepuestos);
router.post('/', createRepuesto);
router.put('/:id', updateRepuesto);
router.delete('/:id', deleteRepuesto);

export default router;
