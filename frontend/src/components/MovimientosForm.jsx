import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from '../styles/MovimientosForm.module.css';
import api  from '../config/axios';

const MovimientosForm = () => {
  const [tipoMovimiento, setTipoMovimiento] = useState('traslado'); // 'traslado' o 'ajuste'
  const [repuestos, setRepuestos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedRepuesto, setSelectedRepuesto] = useState(null);
  const [ubicacionOrigen, setUbicacionOrigen] = useState(null);
  const [ubicacionDestino, setUbicacionDestino] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [tipoAjuste, setTipoAjuste] = useState('incremento'); // 'incremento' o 'decremento'
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [stockActual, setStockActual] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [repuestosRes, ubicacionesRes] = await Promise.all([
        api.get('/repuestos'),
        api.get('/ubicaciones')
      ]);

      setRepuestos(repuestosRes.data.map(r => ({
        value: r.id_repuesto,
        label: `${r.codigo} - ${r.descripcion}`,
        stocks: JSON.parse(r.stocks || '[]')
      })));

      setUbicaciones(ubicacionesRes.data.map(u => ({
        value: u.id_ubicacion,
        label: u.nombre
      })));
    } catch (error) {
      setError('Error al cargar datos');
      console.error('Error:', error);
    }
  };

  const handleRepuestoChange = async (selectedOption) => {
    setSelectedRepuesto(selectedOption);
    setUbicacionOrigen(null);
    setUbicacionDestino(null);
    setStockActual(null);
    setError('');
  };

  const handleUbicacionOrigenChange = async (selectedOption) => {
    setUbicacionOrigen(selectedOption);
    if (selectedRepuesto) {
      try {
        const response = await api.get(
          `repuestos/stock-por-ubicacion/${selectedRepuesto.value}/${selectedOption.value}`
        );
        setStockActual(response.data.stock_actual);
      } catch (error) {
        console.error('Error al obtener stock:', error);
        setError('Error al obtener stock actual');
      }
    }
  };

  const validarFormulario = () => {
    if (!selectedRepuesto) {
      setError('Debe seleccionar un repuesto');
      return false;
    }

    if (tipoMovimiento === 'traslado') {
      if (!ubicacionOrigen) {
        setError('Debe seleccionar una ubicación de origen');
        return false;
      }
      if (!ubicacionDestino) {
        setError('Debe seleccionar una ubicación de destino');
        return false;
      }
      if (ubicacionOrigen.value === ubicacionDestino.value) {
        setError('Las ubicaciones de origen y destino no pueden ser iguales');
        return false;
      }
    } else { // ajuste
      if (!ubicacionOrigen) {
        setError('Debe seleccionar una ubicación');
        return false;
      }
      if (!motivo.trim()) {
        setError('Debe especificar un motivo para el ajuste');
        return false;
      }
    }

    if (!cantidad || cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return false;
    }

    if (tipoMovimiento === 'traslado' || (tipoMovimiento === 'ajuste' && tipoAjuste === 'decremento')) {
      if (stockActual < cantidad) {
        setError('No hay suficiente stock disponible');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!validarFormulario()) return;

    try {
      let response;
      if (tipoMovimiento === 'traslado') {
        response = await api.post('movimientos/traslado', {
          id_repuesto: selectedRepuesto.value,
          ubicacion_origen: ubicacionOrigen.value,
          ubicacion_destino: ubicacionDestino.value,
          cantidad: parseInt(cantidad)
        });
      } else { // ajuste
        response = await api.post('movimientos/ajuste', {
          id_repuesto: selectedRepuesto.value,
          id_ubicacion: ubicacionOrigen.value,
          cantidad: parseInt(cantidad),
          tipo_ajuste: tipoAjuste,
          motivo: motivo.trim()
        });
      }

      setMensaje(response.data.message);
      // Limpiar formulario
      setSelectedRepuesto(null);
      setUbicacionOrigen(null);
      setUbicacionDestino(null);
      setCantidad('');
      setMotivo('');
      setStockActual(null);
      
      // Recargar datos
      cargarDatos();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al procesar la operación');
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Movimientos de Inventario</h2>
      
      <div className={styles.tipoMovimientoSelector}>
        <button
          className={`${styles.tipoButton} ${tipoMovimiento === 'traslado' ? styles.active : ''}`}
          onClick={() => setTipoMovimiento('traslado')}
        >
          Traslado
        </button>
        <button
          className={`${styles.tipoButton} ${tipoMovimiento === 'ajuste' ? styles.active : ''}`}
          onClick={() => setTipoMovimiento('ajuste')}
        >
          Ajuste
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Repuesto:</label>
          <Select
            value={selectedRepuesto}
            onChange={handleRepuestoChange}
            options={repuestos}
            className={styles.select}
            placeholder="Seleccione un repuesto"
            isClearable
          />
        </div>

        <div className={styles.formGroup}>
          <label>{tipoMovimiento === 'traslado' ? 'Ubicación Origen:' : 'Ubicación:'}</label>
          <Select
            value={ubicacionOrigen}
            onChange={handleUbicacionOrigenChange}
            options={ubicaciones}
            className={styles.select}
            placeholder="Seleccione ubicación"
            isClearable
          />
        </div>

        {stockActual !== null && (
          <div className={styles.stockInfo}>
            Stock actual: {stockActual}
          </div>
        )}

        {tipoMovimiento === 'traslado' && (
          <div className={styles.formGroup}>
            <label>Ubicación Destino:</label>
            <Select
              value={ubicacionDestino}
              onChange={setUbicacionDestino}
              options={ubicaciones.filter(u => u.value !== ubicacionOrigen?.value)}
              className={styles.select}
              placeholder="Seleccione ubicación destino"
              isClearable
            />
          </div>
        )}

        {tipoMovimiento === 'ajuste' && (
          <div className={styles.formGroup}>
            <label>Tipo de Ajuste:</label>
            <select
              value={tipoAjuste}
              onChange={(e) => setTipoAjuste(e.target.value)}
              className={styles.selectNative}
            >
              <option value="incremento">Incremento</option>
              <option value="decremento">Decremento</option>
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Cantidad:</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className={styles.input}
            min="1"
          />
        </div>

        {tipoMovimiento === 'ajuste' && (
          <div className={styles.formGroup}>
            <label>Motivo:</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={styles.textarea}
              placeholder="Ingrese el motivo del ajuste"
            />
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {mensaje && <div className={styles.mensaje}>{mensaje}</div>}

        <button type="submit" className={styles.submitButton}>
          {tipoMovimiento === 'traslado' ? 'Realizar Traslado' : 'Realizar Ajuste'}
        </button>
      </form>
    </div>
  );
};

export default MovimientosForm;