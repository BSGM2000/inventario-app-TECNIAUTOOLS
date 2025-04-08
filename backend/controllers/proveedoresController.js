// controllers/proveedoresController.js
import db from '../config/db.js';

// Obtener todos los proveedores
export const getAllProveedores = (req, res) => {
  db.query('SELECT * FROM Proveedores', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
