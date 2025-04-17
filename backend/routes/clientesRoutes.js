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
router.get('/clientes', getAllClients);
router.post('/clientes', createClient);
router.put('/clientes/:id', updateClient);
router.delete('/clientes/:id', deleteClient);

export default router; // Usar export default