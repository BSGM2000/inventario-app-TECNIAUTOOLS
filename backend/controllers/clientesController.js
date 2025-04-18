import db from '../config/db.js';

// GET /api/clientes
export const getAllClients = (req, res) => {
  const sql = `
    SELECT 
      id_cliente,
      nombre,
      contacto,
      direccion,
      otros_datos
    FROM clientes
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener clientes:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// POST /api/clientes
export const createClient = (req, res) => {
  const { id_cliente, nombre, contacto, direccion, otros_datos } = req.body;

  // Validación básica
  if (!nombre || !contacto) {
    return res.status(400).json({ message: 'Nombre y contacto son obligatorios' });
  }

  // Verificar si el id_cliente ya existe
  if (id_cliente) {
    const checkSql = 'SELECT id_cliente FROM clientes WHERE id_cliente = ?';
    db.query(checkSql, [id_cliente], (err, results) => {
      if (err) {
        console.error('Error al verificar id_cliente:', err);
        return res.status(500).json({ error: err.message });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: 'El id_cliente ya existe' });
      }

      // Insertar el cliente
      const sql = `
        INSERT INTO clientes
          (id_cliente, nombre, contacto, direccion, otros_datos)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [id_cliente, nombre, contacto, direccion || null, otros_datos || null];
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error al crear cliente:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Cliente creado',
          id_cliente: id_cliente || result.insertId, // Usar el id proporcionado o el generado
        });
      });
    });
  } else {
    // Si no se proporciona id_cliente, dejar que la base de datos lo genere
    const sql = `
      INSERT INTO clientes
        (nombre, contacto, direccion, otros_datos)
      VALUES (?, ?, ?, ?)
    `;
    const values = [nombre, contacto, direccion || null, otros_datos || null];
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error al crear cliente:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Cliente creado',
        id_cliente: result.insertId,
      });
    });
  }
};

// PUT /api/clientes/:id
export const updateClient = (req, res) => {
  const { id } = req.params;
  const { nombre, contacto, direccion, otros_datos } = req.body;

  let sql = `
    UPDATE clientes SET
      nombre = ?,
      contacto = ?,
      direccion = ?,
      otros_datos = ?
    WHERE id_cliente = ?
  `;
  const values = [nombre, contacto, direccion || null, otros_datos || null, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado correctamente' });
  });
};

// DELETE /api/clientes/:id
export const deleteClient = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM clientes WHERE id_cliente = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar cliente:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado correctamente' });
  });
};