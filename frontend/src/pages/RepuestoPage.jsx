import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
    const token = localStorage.getItem("token"); // Obtener el token aquí

    const fetchRepuestos = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/repuestos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Datos de repuestos obtenidos:', res.data);
            setRepuestos(res.data);
            setFilteredRepuestos(res.data);
        } catch (error) {
            console.error("Error fetching repuestos:", error);
        }
    }, [token]);



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
                await axios.put(
                    `http://localhost:3000/api/repuestos/${repuestoEnEdicionModal.id_repuesto}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
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
                const res = await axios.post("http://localhost:3000/api/repuestos", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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
    }, [repuestoEnEdicionModal, token]);

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
            await axios.delete(`http://localhost:3000/api/repuestos/${repuestoToDeleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
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
    }, [repuestoToDeleteId, token]);

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
            <button className={styles.createButton} onClick={handleCreate}>
                Crear Nuevo Repuesto
            </button>

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