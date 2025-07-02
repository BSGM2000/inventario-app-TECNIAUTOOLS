// src/routes/clients.routes.js
import express from 'express';
import verifyToken from '../middleware/auth.js'; // Asegúrate de que la ruta sea correcta
import {
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById
  } from '../controllers/clientesController.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Rutas para clientes
router.get('/', verifyToken, getAllClients);
router.get('/:id', verifyToken, getClientById);
router.post('/', verifyToken, createClient);
router.put('/:id', verifyToken, updateClient);
router.delete('/:id', verifyToken, deleteClient);

export default router; // Usar export default