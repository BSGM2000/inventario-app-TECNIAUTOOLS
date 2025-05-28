import { useEffect, useState } from "react";
import axios from "axios";
import ClientForm from "../components/ClientForm";
import ClientTable from "../components/ClientTable";
import styles from "../styles/ClientPage.module.css"; // Asegúrate de crear este archivo CSS
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal"; // Importa el componente Modal

const ClientPage = () => {
  const [clientes, setClientes] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clienteEnEdicionModal, setClienteEnEdicionModal] = useState(null);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Estado para el modal de eliminación
  const [clienteToDeleteId, setClienteToDeleteId] = useState(null); // Estado para almacenar el ID del cliente a eliminar
  const token = localStorage.getItem("token");

  const fetchClientes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/clientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(res.data);
      setFilteredClientes(res.data); // Asegúrate de inicializar filteredClientes aquí también
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      alert("Ocurrió un error al cargar los clientes.");
    }
  };
  // Cargar clientes
  useEffect(() => {
    fetchClientes();
  }, []);

  // Sincronizar filteredClientes con clientes
  useEffect(() => {
    setFilteredClientes(clientes);
  }, [clientes]);

  // Manejar la búsqueda
  const handleSearch = (query) => {
    if (!query) {
      setFilteredClientes(clientes);
      return;
    }

    const filtered = clientes.filter((cliente) =>
      cliente.codigo_cliente.toLowerCase().includes(query.toLowerCase()) ||
      cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
      cliente.telefono.toLowerCase().includes(query.toLowerCase()) ||
      cliente.documento_cliente.toLowerCase().includes(query.toLowerCase()) ||
      cliente.ciudad.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const handleEdit = (cliente) => {
    setClienteEnEdicionModal(cliente);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setClienteEnEdicionModal(null);
  };

const handleSaveModal = async (clientData) => {
  try {
    if (clienteEnEdicionModal) {
      // Actualizar cliente existente
      await axios.put(
        `http://localhost:3000/api/clientes/${clienteEnEdicionModal.id_cliente}`,
        clientData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualizar la lista local de clientes
      setClientes((prevClientes) =>
        prevClientes.map((c) =>
          c.id_cliente === clienteEnEdicionModal.id_cliente ? { ...c, ...clientData } : c
        )
      );
    } else {
      // Crear nuevo cliente
      const res = await axios.post("http://localhost:3000/api/clientes", clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Actualizar la lista local de clientes con el nuevo cliente
      fetchClientes(); // Recargar clientes después de agregar uno nuevo
      setClientes((prevClientes) => [...prevClientes, res.data]);
    }
    setModalIsOpen(false);
    setClienteEnEdicionModal(null);
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    alert("Ocurrió un error al guardar el cliente.");
  }
};

  const handleCreate = () => {
    setClienteEnEdicionModal(null); // Asegurarse de que no haya datos de edición
    setModalIsOpen(true);
  };

  // Eliminar cliente
  const handleDelete = (id) => {
  setClienteToDeleteId(id);
  setDeleteModalOpen(true);
};
const confirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/clientes/${clienteToDeleteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setClientes((prevClientes) =>
      prevClientes.filter((c) => c.id_cliente !== clienteToDeleteId)
    );
    setFilteredClientes((prevFiltered) =>
      prevFiltered.filter((c) => c.id_cliente !== clienteToDeleteId)
    );
    setDeleteModalOpen(false); // Cierra el modal después de la eliminación
    setClienteToDeleteId(null); // Limpia el ID a eliminar
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    alert("Ocurrió un error al eliminar el cliente.");
  }
};

const cancelDelete = () => {
  setDeleteModalOpen(false);
  setClienteToDeleteId(null);
};

  return (
    <div className={styles.clientPageContainer}>
      <h1 className={styles.pageTitle}>Gestión de Clientes</h1>

      <div className={styles.controls}>
        <h2 className={styles.controlTitle}>Busqueda</h2>
        <br />
        <SearchBar onSearch={handleSearch} />
      </div>
      <button className={styles.createButton} onClick={handleCreate}>
          Crear Nuevo Cliente
      </button>

      {/* Tabla de clientes (mostrar solo los filtrados) */}
      <ClientTable
        clientes={filteredClientes}
        onEdit={handleEdit} // Pasa la función para abrir el modal de edición
        onDelete={handleDelete}
      />

      {/* Modal de edición/creación */}
      <Modal isOpen={modalIsOpen} onClose={handleCloseModal}>
        <h2 className={styles.modalTitle}>
          {clienteEnEdicionModal ? "Editar Cliente" : "Crear Nuevo Cliente"}
        </h2>
        <ClientForm
          initialData={clienteEnEdicionModal}
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
        <p>¿Estás seguro de que deseas eliminar este cliente?</p>
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

export default ClientPage;