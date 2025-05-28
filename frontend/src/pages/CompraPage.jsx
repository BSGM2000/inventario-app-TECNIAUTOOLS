// src/pages/CompraPage.jsx
import React, { useState, useEffect } from 'react';
import CompraForm from '../components/CompraForm';
import CompraTable from '../components/CompraTable';
import Modal from '../components/Modal'; // Importa tu componente Modal personalizado
import SearchBar from '../components/SearchBar'; // Reutilizamos el SearchBar
import styles from '../styles/CompraPage.module.css'; // Crea este archivo CSS
import axios from 'axios';

const CompraPage = () => {
    const [compras, setCompras] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [compraEnEdicionModal, setCompraEnEdicionModal] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Estado para el modal de eliminación
    const [compraToDeleteId, setCompraToDeleteId] = useState(null); // Estado para almacenar el ID del proveedor a eliminar
    const [filteredCompras, setFilteredCompras] = useState([]);
    const [originalCompraDetalles, setOriginalCompraDetalles] = useState(null);
    const [errorModal, setErrorModal] = useState(null); // Estado para errores
    const token = localStorage.getItem("token");
    
    const fetchCompras = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/compras', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCompras(response.data);
        } catch (error) {
            console.error('Error al cargar compras:', error);
        }
    };

    // Sincronizar filteredCompras con compras
    useEffect(() => {
        setFilteredCompras(compras);
    }, [compras]);

    
    //Cargar compras
    useEffect(() => {
        fetchCompras();
    }, []);

    // Manejar la búsqueda
    const handleSearch = (query) => {
        if (!query) {
        setFilteredCompras(compras);
        return;
        }

        const filtered = compras.filter((compra) =>
        compra.fecha_compra.toLowerCase().includes(query.toLowerCase()) ||
        compra.numero_factura.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCompras(filtered);
    };
    
    const handleEdit = async (compra) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/compras/${compra.id_compra}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Detalles de la compra para editar:", response.data);
        setCompraEnEdicionModal(response.data);
        setOriginalCompraDetalles(response.data.detalles); // Almacena los detalles originales
        setModalIsOpen(true);
    } catch (error) {
        console.error("Error al cargar detalles de la compra:", error);
        setErrorModal("Error al cargar los detalles de la compra para editar.");
    }
    };

    const handleCloseModal = () => {
    setModalIsOpen(false);
    setCompraEnEdicionModal(null);
    setOriginalCompraDetalles(null); // Limpia los detalles originales al cerrar el modal
    };

   // Guardar/Actualizar compra
    const handleSaveModal = async (compraData) => {
        try {
            // Verificar si hay repuestos duplicados
            const repuestosSeleccionados = compraData.detalles.map(detalle => detalle.id_repuesto);
            const tieneDuplicados = repuestosSeleccionados.some((id, index) => 
                repuestosSeleccionados.indexOf(id) !== index && id !== ''
            );

            if (tieneDuplicados) {
                setErrorModal('No se puede seleccionar el mismo repuesto más de una vez');
                return;
            }

            if (compraEnEdicionModal) {
                // Solo actualizar la compra en la base de datos
                // El backend se encargará de actualizar el stock
                await axios.put(`http://localhost:3000/api/compras/${compraEnEdicionModal.id_compra}`, compraData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Actualizar la lista local de compras
                setCompras((prevCompras) =>
                    prevCompras.map((c) =>
                    c.id_compra === compraEnEdicionModal.id_compra ? { ...c, ...compraData } : c
                    )
                );
                fetchCompras();
            } else {
                // Lógica para la creación de una nueva compra
                const res = await axios.post("http://localhost:3000/api/compras", compraData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCompras((prevCompras) => [...prevCompras, res.data]);
                fetchCompras();
            }

            setModalIsOpen(false);
            setCompraEnEdicionModal(null);
            setOriginalCompraDetalles(null); // Limpiar los detalles originales al guardar

        } catch (error) {
            console.error("Error al guardar compra:", error);
            setErrorModal("Ocurrió un error al guardar la compra.");
        }
    };
    
    const handleCreate = () => {
        setCompraEnEdicionModal(null);
        setModalIsOpen(true);
    };
    const handleDelete = (id) => {
        setCompraToDeleteId(id);
        setDeleteModalOpen(true);
    };


  // Eliminar compra
    const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:3000/api/compras/${compraToDeleteId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setCompras((prevCompras) =>
        prevCompras.filter((c) => c.id_compra !== compraToDeleteId)
        );
        setFilteredCompras((prevFiltered) =>
        prevFiltered.filter((c) => c.id_compra !== compraToDeleteId)
        );
        setDeleteModalOpen(false); // Cierra el modal después de la eliminación
        setCompraToDeleteId(null); // Limpia el ID a eliminar
    } catch (error) {
        console.error("Error al eliminar compra:", error);
        setErrorModal("Ocurrió un error al eliminar la compra.");
    }
    };
    const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCompraToDeleteId(null);
    };

    return (
        <div className={styles.clientPageContainer}>
        <h1 className={styles.pageTitle}>Gestión de Compras</h1>

        <div className={styles.controls}>
            <h2 className={styles.controlTitle}>Búsqueda</h2>
            <br />
            <SearchBar onSearch={handleSearch} />
        </div>
        <button className={styles.createButton} onClick={handleCreate}>
            Crear Nueva Compra
        </button>

        {/* Tabla de compras (mostrar solo los filtrados) */}
        <CompraTable
            compras={filteredCompras}
            onEdit={handleEdit} // Pasa la función para abrir el modal de edición
            onDelete={handleDelete}
        />

        {/* Modal de edición/creación */}
        <Modal isOpen={modalIsOpen} onClose={handleCloseModal}>
            <h2 className={styles.modalTitle}>
            {compraEnEdicionModal ? "Editar Compra" : "Crear Nueva Compra"}
            </h2>
            
            <CompraForm
                initialData={compraEnEdicionModal}
                onSave={handleSaveModal}
                onClose={handleCloseModal}
            />
            {errorModal && <p className={styles.errorModal}>{errorModal}</p>}
        </Modal>
        {/* Modal de confirmación de eliminación */}
        <Modal
            isOpen={deleteModalOpen}
            onClose={cancelDelete}
            title="Confirmar Eliminación"
        >
            <p>¿Estás seguro de que deseas eliminar esta compra?</p>
            <div className={styles.modalActions}>
            <button className={styles.deleteButton} onClick={confirmDelete}>
                Eliminar
            </button>
            <button className={styles.cancelButton} onClick={cancelDelete}>
                Cancelar
            </button>
            </div>
        </Modal>
        </div>
    );
};

export default CompraPage;