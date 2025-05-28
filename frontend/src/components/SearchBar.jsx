import styles from "../styles/SearchBar.module.css"; // Asegúrate de que la ruta sea correcta

const SearchBar = ({ onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value); // Notificar al padre
  };

  return (
    <div className={styles.searchBarContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre, codigo, etc..."
        onChange={handleChange}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchBar;