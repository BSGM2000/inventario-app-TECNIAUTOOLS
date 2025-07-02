// routes/proveedoresRoutes.js
import express from 'express';
import { getAllProveedores,
        createProveedor,
        updateProveedor,
        deleteProveedor
} from '../controllers/proveedoresController.js';

const router = express.Router();

// Ruta GET para obtener todos los proveedores
router.get('/', getAllProveedores);
router.post('/', createProveedor);
router.put('/:id', updateProveedor);
router.delete('/:id', deleteProveedor);

export default router;
