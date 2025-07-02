import React, { useState, useEffect } from 'react';
import styles from '../styles/MovimientosTable.module.css';
import api  from '../config/axios';

const MovimientosTable = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      const response = await api.get('/movimientos');
      setMovimientos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      setError('Error al cargar los movimientos');
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Historial de Movimientos</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Repuesto</th>
              <th>Ubicación Origen</th>
              <th>Ubicación Destino</th>
              <th>Cantidad</th>
              <th>Usuario</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id_movimiento}>
                <td>{formatearFecha(movimiento.fecha_movimiento)}</td>
                <td>
                  <span className={`${styles.tipo} ${styles[movimiento.tipo_movimiento.toLowerCase()]}`}>
                    {movimiento.tipo_movimiento.replace('AJUSTE_', '').replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div className={styles.repuestoInfo}>
                    <span className={styles.codigo}>{movimiento.codigo_repuesto}</span>
                    <span className={styles.nombre}>{movimiento.descripcion_repuesto}</span>
                  </div>
                </td>
                <td>{movimiento.nombre_ubicacion_origen}</td>
                <td>{movimiento.nombre_ubicacion_destino || '-'}</td>
                <td className={styles.cantidad}>{movimiento.cantidad}</td>
                <td>{movimiento.nombre_usuario}</td>
                <td>{movimiento.observaciones || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovimientosTable;