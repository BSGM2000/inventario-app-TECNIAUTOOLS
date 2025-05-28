// routes/proveedoresRoutes.js
import express from 'express';
import verifyToken from '../middleware/auth.js';
import { getAllProveedores,
        createProveedor,
        updateProveedor,
        deleteProveedor
} from '../controllers/proveedoresController.js';

const router = express.Router();

// Ruta GET para obtener todos los proveedores
router.get('/', verifyToken, getAllProveedores);
router.post('/', verifyToken, createProveedor);
router.put('/:id', verifyToken, updateProveedor);
router.delete('/:id', verifyToken, deleteProveedor);

export default router;
