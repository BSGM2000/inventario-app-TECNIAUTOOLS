import { Router } from 'express';
import { login, register } from '../controllers/authController.js';

const router = Router();

// Ruta de login
router.post('/login', (req, res, next) => {
    console.log('Ruta /login accedida');
    next();
}, login);

// Ruta de registro
router.post('/register', (req, res, next) => {
    console.log('Ruta /register accedida');
    next();
}, register);

export default router;