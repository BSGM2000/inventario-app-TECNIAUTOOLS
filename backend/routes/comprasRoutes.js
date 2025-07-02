// routes/comprasRoutes.js
import express from 'express';
import {
    getAllCompras,
    getCompraById,
    createCompra,
    updateCompra,
    deleteCompra
} from '../controllers/comprasController.js';

const router = express.Router();

router.get('/', getAllCompras);
router.get('/:id', getCompraById);
router.put('/:id', updateCompra);
router.post('/', createCompra);
router.delete('/:id', deleteCompra);

export default router;