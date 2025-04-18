// src/routes/clients.routes.js
import express from 'express';
import {
    getAllClients,
    createClient,
    updateClient,
    deleteClient
  } from '../controllers/clientesController.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Rutas para clientes
router.get('/', getAllClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router; // Usar export default