// routes/comprasRoutes.js
import express from 'express';
import verifyToken from '../middleware/auth.js'; // Asegúrate de que la ruta sea correcta
import {
    getAllCompras,
    getCompraById,
    createCompra,
    updateCompra,
    deleteCompra
} from '../controllers/comprasController.js';

const router = express.Router();

router.get('/', verifyToken, getAllCompras);
router.get('/:id', verifyToken, getCompraById);
router.put('/:id', verifyToken, updateCompra);
router.post('/', verifyToken, createCompra);
router.delete('/:id', verifyToken, deleteCompra);

export default router;