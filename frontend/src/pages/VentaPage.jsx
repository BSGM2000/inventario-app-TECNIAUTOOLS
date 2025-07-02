import React, { useState, useEffect } from 'react';
import VentaForm from '../components/VentaForm';
import VentaTable from '../components/VentaTable';
import Modal from '../components/Modal'; // Importa tu componente Modal personalizado
import SearchBar from '../components/SearchBar'; // Reutilizamos el SearchBar
import styles from '../styles/VentaPage.module.css'; // Crea este archivo CSS
import api from '../config/axios';

const VentaPage = () => {
        const [ventas, setVentas] = useState([]);
        const [modalIsOpen, setModalIsOpen] = useState(false);
        const [ventaEnEdicionModal, setVentaEnEdicionModal] = useState(null);
        const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Estado para el modal de eliminación
        const [ventaToDeleteId, setVentaToDeleteId] = useState(null); // Estado para almacenar el ID del proveedor a eliminar
        const [filteredVentas, setFilteredVentas] = useState([]);
        const [originalVentaDetalles, setOriginalVentaDetalles] = useState(null);
        const [errorModal, setErrorModal] = useState(null); // Estado para errores

        const fetchVentas = async () => {
            try {
                const response = await api.get('/ventas');
                setVentas(response.data);
            } catch (error) {
                console.error('Error al cargar ventas:', error);
            }
        };

        // Sincronizar filteredVentas con ventas
        useEffect(() => {
            setFilteredVentas(ventas);
        }, [ventas]);

        
        //Cargar ventas
        useEffect(() => {
            fetchVentas();
        }, []);

    
        // Manejar la búsqueda
        const handleSearch = (query) => {
            if (!query) {
            setFilteredVentas(ventas);
            return;
            }

            const filtered = ventas.filter((venta) =>
            venta.fecha_venta.toLowerCase().includes(query.toLowerCase()) ||
            venta.id_venta.toString().toLowerCase().includes(query.toLowerCase()) ||
            venta.cliente.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredVentas(filtered);
        };
        
        const handleEdit = async (venta) => {
            try {
                const response = await api.get(`/ventas/${venta.id_venta}`);
                console.log("Detalles de la venta para editar:", response.data);
                setVentaEnEdicionModal(response.data);
                setOriginalVentaDetalles(response.data.detalles); // Almacena los detalles originales
                setModalIsOpen(true);
            } catch (error) {
                console.error("Error al cargar detalles de la venta:", error);
                setErrorModal("Error al cargar los detalles de la venta para editar.");
            }
            };
        const handleCloseModal = () => {
                setModalIsOpen(false);
                setVentaEnEdicionModal(null);
                setOriginalVentaDetalles(null); // Limpia los detalles originales al cerrar el modal
            };
        const handleSaveModal = async (ventaData) => {
                try {
                    // Verificar si hay repuestos duplicados
                    const repuestosSeleccionados = ventaData.detalles.map(detalle => detalle.id_repuesto);
                    const tieneDuplicados = repuestosSeleccionados.some((id, index) => 
                        repuestosSeleccionados.indexOf(id) !== index && id !== ''
                    );
            
                    if (tieneDuplicados) {
                        setErrorModal('No se puede seleccionar el mismo repuesto más de una vez');
                        return;
                    }
            
                    let response;
                    if (ventaEnEdicionModal) {
                        // Actualizar venta existente
                        response = await api.put(`/ventas/${ventaEnEdicionModal.id_venta}`, ventaData);
                        // Actualizar estado local
                        setVentas(prevVentas => 
                            prevVentas.map(v => v.id_venta === ventaEnEdicionModal.id_venta ? 
                                { ...v, ...ventaData, numero_factura: response.data.numero_factura } : v
                            )
                        );
                        setFilteredVentas(prev => 
                            prev.map(v => v.id_venta === ventaEnEdicionModal.id_venta ? 
                                { ...v, ...ventaData, numero_factura: response.data.numero_factura } : v
                            )
                        );
                        fetchVentas();
                    } else {
                        // Crear nueva venta
                        response = await api.post(`/ventas`, ventaData);
                        // Actualizar estado local
                        setVentas(prevVentas => [...prevVentas, response.data]);
                        setFilteredVentas(prevFiltered => [...prevFiltered, response.data]);
                        fetchVentas();
                    }
            
                    setModalIsOpen(false);
                    setVentaEnEdicionModal(null);
                    setOriginalVentaDetalles(null);
                    
                    // Devolver los datos de la respuesta
                    return response.data;
            
                } catch (error) {
                    console.error("Error al guardar venta:", error);
                    setErrorModal("Ocurrió un error al guardar la venta.");
                    throw error; // Importante para que el catch en VentaForm se active
                }
        };
        const handleCreate = () => {
                setVentaEnEdicionModal(null);
                setModalIsOpen(true);
            };
        const handleDelete = (id) => {
                setVentaToDeleteId(id);
                setDeleteModalOpen(true);
            };
        // Eliminar venta
        const confirmDelete = async () => {
            try {
                await api.delete(`/ventas/${ventaToDeleteId}`);
                setVentas((prevVentas) =>
                prevVentas.filter((v) => v.id_venta !== ventaToDeleteId)
                );
                setFilteredVentas((prevFiltered) =>
                prevFiltered.filter((v) => v.id_venta !== ventaToDeleteId)
                );
                setDeleteModalOpen(false); // Cierra el modal después de la eliminación
                setVentaToDeleteId(null); // Limpia el ID a eliminar
            } catch (error) {
                console.error("Error al eliminar venta:", error);
                setErrorModal("Ocurrió un error al eliminar la venta.");
            }
        };
        const cancelDelete = () => {
            setDeleteModalOpen(false);
            setVentaToDeleteId(null);
        };
        
        return (
            <div className={styles.ventaPageContainer}>
            <h1 className={styles.pageTitle}>Gestión de Ventas</h1>
    
            <div className={styles.controls}>
                <h2 className={styles.controlTitle}>Búsqueda</h2>
                <br />
                <SearchBar onSearch={handleSearch} />
            </div>
            <button className={styles.createButton} onClick={handleCreate}>
                Crear Nueva Venta
            </button>
    
            {/* Tabla de compras (mostrar solo los filtrados) */}
            <VentaTable
                ventas={filteredVentas}
                onEdit={handleEdit} // Pasa la función para abrir el modal de edición
                onDelete={handleDelete}
            />
    
            {/* Modal de edición/creación */}
            <Modal isOpen={modalIsOpen} onClose={handleCloseModal}>
                <h2 className={styles.modalTitle}>
                {ventaEnEdicionModal ? "Editar Venta" : "Crear Nueva Venta"}
                </h2>
                
                <VentaForm
                    initialData={ventaEnEdicionModal}
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
                <p>¿Estás seguro de que deseas eliminar esta venta?</p>
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
    }
export default VentaPage;