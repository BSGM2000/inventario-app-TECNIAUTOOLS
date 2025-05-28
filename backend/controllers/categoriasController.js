// controllers/categoriasController.js
import db from '../config/db.js';

// Obtener todas las categorías
export const getAllCategorias = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Categorias');
    res.json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};