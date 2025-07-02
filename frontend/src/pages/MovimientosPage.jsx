import React from 'react';
import MovimientosForm from '../components/MovimientosForm';
import MovimientosTable from '../components/MovimientosTable';
import styles from '../styles/MovimientosPage.module.css';

const MovimientosPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Gestión de Movimientos de Inventario</h1>
      <div className={styles.content}>
        <MovimientosForm />
        <MovimientosTable />
      </div>
    </div>
  );
};

export default MovimientosPage;