import React from 'react';
import Dashboard from '../components/Dashboard';
import styles from '../styles/CompraPage.module.css';

const DashboardPage = () => {
    return (
        <div className={styles.pageContainer}>
            <Dashboard />
        </div>
    );
};

export default DashboardPage;