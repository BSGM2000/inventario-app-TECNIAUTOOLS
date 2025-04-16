// routes/repuestosRoutes.js
import express from 'express';
import  upload  from '../config/upload.js';
import {
  getAllRepuestos,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto
} from '../controllers/repuestosController.js';

const router = express.Router();

router.get('/', getAllRepuestos);
router.post('/', upload.single("imagen") ,createRepuesto);
router.put('/:id',upload.single("imagen"), updateRepuesto);
router.delete('/:id', deleteRepuesto);

export default router;
