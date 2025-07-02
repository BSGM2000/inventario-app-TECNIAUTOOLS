import React, { useEffect, useState } from "react";
import ProveedoresForm from "../components/ProveedoresForm";
import ProveedoresTable from "../components/ProveedoresTable";
import SearchBar from "../components/SearchBar"; // Reutilizamos el SearchBar
import styles from "../styles/ProveedoresPage.module.css"; // Asegúrate de crear este archivo CSS
import Modal from "../components/Modal"; // Importa el componente Modal
import api from "../config/axios";

const ProvidersPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [proveedorEnEdicionModal, setProveedorEnEdicionModal] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Estado para el modal de eliminación
  const [proveedorToDeleteId, setProveedorToDeleteId] = useState(null); // Estado para almacenar el ID del proveedor a eliminar
  const [filteredProveedores, setFilteredProveedores] = useState([]);

  const fetchProveedores = async () => {
      try {
        const res = await api.get('/proveedores');
        setProveedores(res.data);
      } catch (error) {
      console.error("Error al cargar proveedores:", error);
      alert("Ocurrió un error al cargar los proveedores.");
      }
  };
  // Cargar proveedores
  useEffect(() => {
    fetchProveedores();
  }, []);

  // Sincronizar filteredProveedores con proveedores
  useEffect(() => {
    setFilteredProveedores(proveedores);
  }, [proveedores]);

  // Manejar la búsqueda
  const handleSearch = (query) => {
    if (!query) {
      setFilteredProveedores(proveedores);
      return;
    }

    const filtered = proveedores.filter((proveedor) =>
      proveedor.empresa.toLowerCase().includes(query.toLowerCase()) ||
      proveedor.nombre.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProveedores(filtered);
  };
  const handleEdit = (proveedor) => {
    setProveedorEnEdicionModal(proveedor);
    setModalIsOpen(true);
  }
  const handleCloseModal = () => {
    setModalIsOpen(false);
    setProveedorEnEdicionModal(null);
  }

  // Guardar/Actualizar proveedor
  const handleSaveModal = async (providerData) => {
  try {
    if (proveedorEnEdicionModal) {
      // Actualizar proveedor existente
      await api.put(
        `/proveedores/${proveedorEnEdicionModal.id_proveedor}`,
        providerData
      );
      // Actualizar la lista local de proveedores
      setProveedores((prevProveedores) =>
        prevProveedores.map((p) =>
          p.id_proveedor === proveedorEnEdicionModal.id_proveedor ? { ...p, ...providerData } : p
        )
      );
    } else {
      // Crear nuevo cliente
      const res = await api.post('/proveedores', providerData);
      // Actualizar la lista local de proveedores con el nuevo proveedor
      fetchProveedores(); // Recargar proveedores después de agregar uno nuevo
      setProveedores((prevProveedores) => [...prevProveedores, res.data]);
    }
    setModalIsOpen(false);
    setProveedorEnEdicionModal(null);
  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    alert("Ocurrió un error al guardar el proveedor.");
  }
};

const handleCreate = () => {
  setProveedorEnEdicionModal(null);
  setModalIsOpen(true);
};
const handleDelete = (id) => {
  setProveedorToDeleteId(id);
  setDeleteModalOpen(true);
};

  // Eliminar proveedor
const confirmDelete = async () => {
  try {
    await api.delete(`/proveedores/${proveedorToDeleteId}`);
    setProveedores((prevProveedores) =>
      prevProveedores.filter((p) => p.id_proveedor !== proveedorToDeleteId)
    );
    setFilteredProveedores((prevFiltered) =>
      prevFiltered.filter((p) => p.id_proveedor !== proveedorToDeleteId)
    );
    setDeleteModalOpen(false); // Cierra el modal después de la eliminación
    setProveedorToDeleteId(null); // Limpia el ID a eliminar
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    alert("Ocurrió un error al eliminar el proveedor.");
  }
};
const cancelDelete = () => {
  setDeleteModalOpen(false);
  setProveedorToDeleteId(null);
};

  return (
    <div className={styles.clientPageContainer}>
      <h1 className={styles.pageTitle}>Gestión de Proveedores</h1>

      <div className={styles.controls}>
        <h2 className={styles.controlTitle}>Busqueda</h2>
        <br />
        <SearchBar onSearch={handleSearch} />
      </div>
      <button className={styles.createButton} onClick={handleCreate}>
          Crear Nuevo Proveedor
      </button>

      {/* Tabla de proveedores (mostrar solo los filtrados) */}
      <ProveedoresTable
        proveedores={filteredProveedores}
        onEdit={handleEdit} // Pasa la función para abrir el modal de edición
        onDelete={handleDelete}
      />

      {/* Modal de edición/creación */}
      <Modal isOpen={modalIsOpen} onClose={handleCloseModal}>
        <h2 className={styles.modalTitle}>
          {proveedorEnEdicionModal ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
        </h2>
        <ProveedoresForm
          initialData={proveedorEnEdicionModal}
          onSave={handleSaveModal}
          onClose={handleCloseModal}
        />
      </Modal>
      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que deseas eliminar este proveedor?</p>
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

export default ProvidersPage;