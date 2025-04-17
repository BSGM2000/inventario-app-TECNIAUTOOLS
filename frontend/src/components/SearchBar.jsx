import React from "react";

const SearchBar = ({ onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value); // Notificar al padre
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Buscar por nombre, descripción, categoría o proveedor..."
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchBar;