// controllers/repuestosController.js
import db from '../config/db.js';

// GET
export const getAllRepuestos = (req, res) => {
  db.query('SELECT * FROM Repuestos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// POST
export const createRepuesto = (req, res) => {
  const { nombre, descripcion, precio, stock_actual, id_categoria, id_proveedor, ubicacion } = req.body;
  const sql = 'INSERT INTO Repuestos (nombre, descripcion, precio, stock_actual, id_categoria, id_proveedor, ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [nombre, descripcion, precio, stock_actual, id_categoria, id_proveedor, ubicacion];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Repuesto creado', id: result.insertId });
  });
};

// PUT
export const updateRepuesto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock_actual, id_categoria, id_proveedor, ubicacion } = req.body;
  const sql = 'UPDATE Repuestos SET nombre = ?, descripcion = ?, precio = ?, stock_actual = ?, id_categoria = ?, id_proveedor = ?, ubicacion = ? WHERE id_repuesto = ?';

  db.query(sql, [nombre, descripcion, precio, stock_actual, id_categoria, id_proveedor, ubicacion, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Repuesto actualizado' });
  });
};

// DELETE
export const deleteRepuesto = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Repuestos WHERE id_repuesto = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Repuesto eliminado' });
  });
};
