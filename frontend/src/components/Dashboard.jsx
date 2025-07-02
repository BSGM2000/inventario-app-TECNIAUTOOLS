import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        compras: {
            total: 0,
            ultimasCompras: []
        },
        ventas: {
            total: 0,
            ultimasVentas: []
        },
        stockBajo: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [comprasRes, ventasRes, stockRes] = await Promise.all([
                    api.get('/dashboard/compras/stats'),
                    api.get('/dashboard/ventas/stats'),
                    api.get('/dashboard/repuestos/stock-bajo')
                ]);

                setStats({
                    compras: comprasRes.data,
                    ventas: ventasRes.data,
                    stockBajo: stockRes.data
                });
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <h2 className={styles.dashboardTitle}>Dashboard</h2>

            <div className={styles.statsGrid}>
                {/* Sección de Compras */}
                <div className={styles.statCard}>
                    <h3>Compras</h3>
                    <div className={styles.statValue}>
                        {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                        }).format(stats.compras.total)}
                    </div>
                    <div className={styles.recentList}>
                        <h4>Últimas Compras</h4>
                        <ul>
                            {stats.compras.ultimasCompras.map(compra => (
                                <li key={compra.id_compra}>
                                    {compra.proveedor} - {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP'
                                    }).format(compra.total_compra)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sección de Ventas */}
                <div className={styles.statCard}>
                    <h3>Ventas</h3>
                    <div className={styles.statValue}>
                        {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                        }).format(stats.ventas.total)}
                    </div>
                    <div className={styles.recentList}>
                        <h4>Últimas Ventas</h4>
                        <ul>
                            {stats.ventas.ultimasVentas.map(venta => (
                                <li key={venta.id_venta}>
                                    {venta.cliente} ({venta.ciudad}) - {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP'
                                    }).format(venta.total)}
                                </li>

                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sección de Stock Bajo */}
                <div className={styles.statCard}>
                    <h3>Alertas de Stock</h3>
                    <div className={styles.stockList}>
                        {stats.stockBajo.map(repuesto => (
                            <div key={`${repuesto.id_repuesto}-${repuesto.id_ubicacion}`} className={styles.stockAlert}>
                                <span className={styles.repuestoCodigo}>{repuesto.codigo}</span>
                                <span className={styles.repuestoNombre}>{repuesto.descripcion}</span>
                                <span className={styles.ubicacionNombre}>({repuesto.ubicacion})</span>
                                <span className={styles.stockCantidad}>Stock: {repuesto.stock_actual}</span>
                            </div>
                        ))}
                        {console.log(stats.stockBajo)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;