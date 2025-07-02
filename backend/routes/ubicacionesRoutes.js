// routes/ubicacionesRoutes.js
import express from 'express';
import {
  getAllUbicaciones,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion
} from '../controllers/ubicacionesController.js';

const router = express.Router();

router.get('/', getAllUbicaciones);
router.post('/', createUbicacion);
router.put('/:id', updateUbicacion);
router.delete('/:id', deleteUbicacion);

export default router;