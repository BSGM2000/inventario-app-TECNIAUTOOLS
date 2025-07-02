import express from 'express';
import { 
    getAllVentas, 
    getVentaById, 
    createVenta, 
    updateVenta, 
    deleteVenta, 
    obtenerUltimoNumeroFactura
} from '../controllers/ventaController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Ruta de prueba sin autenticación
router.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ success: true, message: 'Test route working' });
});

// Aplicar middleware de autenticación a todas las rutas excepto /test
router.use((req, res, next) => {
    console.log('\n=== Middleware de autenticación ===');
    console.log('Ruta:', req.path);
    console.log('Método:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Ruta para obtener el último número de factura (requiere autenticación)
router.get('/ultimo-numero', verifyToken, obtenerUltimoNumeroFactura);

// Rutas protegidas
router.get('/', verifyToken, getAllVentas);
router.get('/:id', verifyToken, getVentaById);
router.post('/', verifyToken, createVenta);
router.put('/:id', verifyToken, updateVenta);
router.delete('/:id', verifyToken, deleteVenta);


// Log de rutas registradas
console.log('\n=== Rutas de ventas registradas ===');
console.log('GET    /api/ventas/test');
console.log('GET    /api/ventas/ultimo-numero (protegida)');
console.log('GET    /api/ventas (protegida)');
console.log('GET    /api/ventas/:id (protegida)');
console.log('POST   /api/ventas (protegida)');
console.log('PUT    /api/ventas/:id (protegida)');
console.log('DELETE /api/ventas/:id (protegida)');

export default router;
