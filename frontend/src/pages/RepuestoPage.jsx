import React, { useState, useEffect, useCallback } from "react";
import api from "../config/axios";
import RepuestoForm from "../components/RepuestoForm";
import RepuestosTable from "../components/RepuestosTable";
import SearchBar from "../components/SearchBar";
import styles from "../styles/RepuestoPage.module.css"; // Asegúrate de crear este archivo CSS
import Modal from "../components/Modal"; // Importa el componente Modal

const RepuestoPage = () => {
    console.log('RepuestoPage se está renderizando'); // Log al inicio del componente
    const [repuestos, setRepuestos] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [repuestoEnEdicionModal, setRepuestoEnEdicionModal] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Estado para el modal de eliminación
    const [repuestoToDeleteId, setRepuestoToDeleteId] = useState(null); // Estado para almacenar el ID del repuesto a eliminar
    const [filteredRepuestos, setFilteredRepuestos] = useState([]);
    

    const fetchRepuestos = useCallback(async () => {
        try {
            const res = await api.get("/repuestos");
            console.log('Datos de repuestos obtenidos:', res.data);
            setRepuestos(res.data);
            setFilteredRepuestos(res.data);
        } catch (error) {
            console.error("Error fetching repuestos:", error);
        }
    }, []);



    // Cargar repuestos y configuraciones al montar
    useEffect(() => {
        console.log('Ejecutando useEffect inicial...');
        Promise.all([
            fetchRepuestos(),
        ]).catch(error => {
            console.error('Error en alguna de las peticiones iniciales:', error);
        });
    }, [fetchRepuestos]);

    // Sincronizar filteredRepuestos con repuestos
    useEffect(() => {
        console.log('Sincronizando filteredRepuestos con repuestos...');
        setFilteredRepuestos(repuestos);
    }, [repuestos]);

    const handleSearch = (query) => {
        if (!query) {
            setFilteredRepuestos(repuestos);
            return;
        }
        const filtered = repuestos.filter((r) =>
            r.nombre.toLowerCase().includes(query.toLowerCase()) ||
            r.descripcion.toLowerCase().includes(query.toLowerCase()) ||
            r.categoria.toLowerCase().includes(query.toLowerCase()) ||
            r.proveedor.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredRepuestos(filtered);
        console.log('filteredRepuestos después de la búsqueda:', filtered);
    };

    const handleEdit = (repuesto) =>{
        setRepuestoEnEdicionModal(repuesto);
        setModalIsOpen(true);
        console.log('Modal de edición abierto para:', repuesto);
    };
    const handleCloseModal = () => {
        setModalIsOpen(false);
        setRepuestoEnEdicionModal(null);
        console.log('Modal cerrado');
    };
    const handleSaveModal = useCallback(async (formData) => {
        try {
            if (repuestoEnEdicionModal) {
                console.log('Guardando repuesto editado:', formData);
                await api.put(
                    `/repuestos/${repuestoEnEdicionModal.id_repuesto}`,
                    formData
                );

                // Actualizar la lista local de repuestos
                setRepuestos((prevRepuestos) => {
                    const updatedRepuestos = prevRepuestos.map((r) =>
                        r.id_repuesto === repuestoEnEdicionModal.id_repuesto 
                            ? { ...r, ...formData } 
                            : r
                    );
                    console.log('Estado repuestos actualizado (edición):', updatedRepuestos);
                    return updatedRepuestos;
                });
                fetchRepuestos();

                // Actualizar el estado filtrado
                setFilteredRepuestos((prevFiltered) => {
                    const updatedFiltered = prevFiltered.map((r) =>
                        r.id_repuesto === repuestoEnEdicionModal.id_repuesto 
                            ? { ...r, ...formData } 
                            : r
                    );
                    return updatedFiltered;
                });

                // Cerrar el modal después de guardar
                setModalIsOpen(false);
                setRepuestoEnEdicionModal(null);
            } else {
                console.log('Guardando nuevo repuesto:', formData);
                const res = await api.post("/repuestos", formData);
                console.log('Nuevo repuesto creado:', res.data);

                // Actualizar la lista local de repuestos
                setRepuestos((prevRepuestos) => [...prevRepuestos, res.data]);
                setFilteredRepuestos((prevFiltered) => [...prevFiltered, res.data]);
                fetchRepuestos();

                // Cerrar el modal después de guardar
                setModalIsOpen(false);
            }
        } catch (error) {
            console.error('Error al guardar el repuesto:', error);
        }
    }, [repuestoEnEdicionModal]);

    const handleCreate = () =>{
        setRepuestoEnEdicionModal(null);
        setModalIsOpen(true);
        console.log('Modal de creación abierto');
    };
    const handleDelete = useCallback((id) => {
        setRepuestoToDeleteId(id);
        setDeleteModalOpen(true);
        console.log('Modal de eliminación abierto para ID:', id);
    }, []);

    const confirmDelete = useCallback(async () => {
        try {
            console.log('Confirmando eliminación para ID:', repuestoToDeleteId);
            await api.delete(`/repuestos/${repuestoToDeleteId}`);
            setRepuestos((prevRepuestos) => {
                const updatedRepuestos = prevRepuestos.filter((r) => r.id_repuesto !== repuestoToDeleteId);
                console.log('Estado repuestos actualizado (eliminación):', updatedRepuestos);
                return updatedRepuestos;
            });
            setFilteredRepuestos((prevFiltered) =>
                prevFiltered.filter((r) => r.id_repuesto !== repuestoToDeleteId)
            );
            setDeleteModalOpen(false); // Cierra el modal después de la eliminación
            setRepuestoToDeleteId(null); // Limpia el ID a eliminar
            console.log('Repuesto eliminado exitosamente');
        } catch (error) {
            console.error("Error al eliminar repuesto:", error);
            alert("Ocurrió un error al eliminar el repuesto.");
        }
    }, [repuestoToDeleteId]);

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setRepuestoToDeleteId(null);
        console.log('Eliminación cancelada');
    };

    return (
        <div className={styles.clientPageContainer}>
            <h1 className={styles.pageTitle}>Gestión de Repuestos</h1>

            <div className={styles.controls}>
                <h2 className={styles.controlTitle}>Búsqueda</h2>
                <br />
                <SearchBar onSearch={handleSearch} />
            </div>
            <div className={styles.actionButtons}>
                <button className={styles.createButton} onClick={handleCreate}>
                    Crear Nuevo Repuesto
                </button>
                <div className={styles.importContainer}>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={async (e) => {
                            try {
                                const file = e.target.files[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('archivo', file);

                                const response = await api.post('/repuestos/importar', formData);
                                alert(`Importación completada:\n- Exitosos: ${response.data.exitosos}\n- Fallidos: ${response.data.fallidos.length}\n- Total: ${response.data.total}`);
                                
                                // Recargar la lista de repuestos
                                fetchRepuestos();
                            } catch (error) {
                                console.error('Error al importar:', error);
                                alert('Error al importar el archivo. Por favor, verifica el formato del archivo.');
                            }
                            // Limpiar el input file
                            e.target.value = '';
                        }}
                        className={styles.fileInput}
                    />
                    <button className={styles.importButton} onClick={() => document.querySelector('input[type="file"]').click()}>
                        Importar desde Excel
                    </button>
                </div>
            </div>

            {/* Tabla de repuestos (mostrar solo los filtrados) */}
            <RepuestosTable
                filteredRepuestos={filteredRepuestos} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                
            />

            {/* Modal de edición/creación */}
            <Modal isOpen={modalIsOpen} onClose={handleCloseModal}>
                <h2 className={styles.modalTitle}>
                    {repuestoEnEdicionModal ? "Editar Repuesto" : "Crear Nuevo Repuesto"}
                </h2>
                <RepuestoForm
                    repuestoEnEdicionModal={repuestoEnEdicionModal}
                    handleSaveModal={handleSaveModal}
                    onClose={handleCloseModal}
                />
            </Modal>
            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={cancelDelete}
                title="Confirmar Eliminación"
            >
                <p>¿Estás seguro de que deseas eliminar este repuesto?</p>
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

export default RepuestoPage;