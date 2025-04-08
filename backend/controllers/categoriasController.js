// controllers/categoriasController.js
import db from '../config/db.js';

// Obtener todas las categorías
export const getAllCategorias = (req, res) => {
  db.query('SELECT * FROM Categorias', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
