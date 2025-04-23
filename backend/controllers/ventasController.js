import db from '../config/db.js';

// Obtener todas las ventas
export const getAllVentas = (req, res) => {
  const sql = `
    SELECT v.*, c.nombre AS nombre_cliente
    FROM ventas v
    LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener ventas:", err);
      return res.status(500).json({ message: "Ocurrió un error al cargar las ventas." });
    }
    res.json(results);
  });
};

// Registrar una nueva venta
export const createVenta = (req, res) => {
  console.log("Datos recibidos:", req.body); // Agrega esto para depurar

  const { fecha_venta, metodo_pago, total, id_cliente, detalles } = req.body;

  // Validar datos
  if (!fecha_venta || !metodo_pago || typeof total !== "number" || !id_cliente || !Array.isArray(detalles)) {
    return res.status(400).json({ message: "Datos de la venta inválidos." });
  }

  for (const detalle of detalles) {
    if (
      typeof detalle.id_repuesto !== "number" ||
      typeof detalle.cantidad !== "number" ||
      typeof detalle.precio_unitario !== "number" ||
      typeof detalle.subtotal !== "number"
    ) {
      return res.status(400).json({ message: "Detalles de la venta inválidos." });
    }
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error al obtener conexión:", err);
      return res.status(500).json({ message: "Ocurrió un error al registrar la venta." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error al iniciar transacción:", err);
        return res.status(500).json({ message: "Ocurrió un error al registrar la venta." });
      }

      // Insertar la venta
      const sqlVenta = "INSERT INTO ventas (fecha_venta, metodo_pago, total, id_cliente) VALUES (?, ?, ?, ?)";
      connection.execute(sqlVenta, [fecha_venta, metodo_pago, total, id_cliente], (err, ventaResult) => {
        if (err) {
          connection.rollback(() => connection.release());
          console.error("Error al insertar venta:", err);
          return res.status(500).json({ message: "Ocurrió un error al registrar la venta." });
        }

        const id_venta = ventaResult.insertId;

        // Insertar detalles de la venta
        const sqlDetalles = `
        INSERT INTO detalle_venta (id_venta, id_repuesto, cantidad, precio_unitario, subtotal)
        VALUES ?
        `;
        const valoresDetalles = detalles.map(detalle => [
        id_venta,
        detalle.id_repuesto,
        detalle.cantidad,
        detalle.precio_unitario,
        detalle.subtotal
        ]);

        connection.query(sqlDetalles, [valoresDetalles], (err) => {
        if (err) {
          connection.rollback(() => connection.release());
          console.error("Error al insertar detalles de la venta:", err);
          return res.status(500).json({ message: "Ocurrió un error al registrar la venta." });
        }

        // Confirmar la transacción
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => connection.release());
            console.error("Error al confirmar transacción:", err);
            return res.status(500).json({ message: "Ocurrió un error al registrar la venta." });
          }

          connection.release();
          res.status(201).json({ message: "Venta registrada correctamente", id_venta });
        });
        });
      });
    });
  });
};

// Obtener una venta por ID
export const getVentaById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      v.*, c.nombre AS nombre_cliente, 
      dv.id_repuesto, dv.cantidad, dv.precio_unitario, dv.subtotal
    FROM ventas v
    LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
    LEFT JOIN detalles_venta dv ON v.id_venta = dv.id_venta
    WHERE v.id_venta = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener venta:", err);
      return res.status(500).json({ message: "Ocurrió un error al cargar la venta." });
    }
    res.json(results);
  });
};

// Actualizar una venta
export const updateVenta = (req, res) => {
  const { id } = req.params;
  const { fecha, metodo_pago, total, id_cliente } = req.body;
  const sql = "UPDATE ventas SET fecha = ?, metodo_pago = ?, total = ?, id_cliente = ? WHERE id_venta = ?";
  db.query(sql, [fecha, metodo_pago, total, id_cliente, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar venta:", err);
      return res.status(500).json({ message: "Ocurrió un error al actualizar la venta." });
    }
    res.json({ message: "Venta actualizada correctamente" });
  });
};

// Eliminar una venta
export const deleteVenta = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM ventas WHERE id_venta = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar venta:", err);
      return res.status(500).json({ message: "Ocurrió un error al eliminar la venta." });
    }
    res.json({ message: "Venta eliminada correctamente" });
  });
};