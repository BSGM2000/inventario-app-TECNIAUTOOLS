import e from 'cors';
import {useState} from 'react';


const Productos = () => {
    const [productos, setProductos] = useState([
        { id: 1, nombre: "Faro", precio: 800 },
        { id: 2, nombre: "Motor", precio: 1800 },
    ]);

    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [editando, setEditando] = useState(null);

    //Agregar un nuevo producto 
    const agregarProducto = () => {
        if(nombre && precio) {
            const nuevoProducto = { id: Date.now(), nombre, precio: Number(precio) };
            setProductos([...productos, nuevoProducto]);
            setNombre("");
            setPrecio("");
        }
    };

    //Eliminar un producto 
    const eliminarProducto = (id) => {
        setProductos(productos.filter((producto) => producto.id !== id));
    };

    //Editar un Producto 
    const seleccionarProducto = (producto) => {
        setEditando(producto.id);
        setNombre(producto.nombre);
        setPrecio(producto.precio);
    };

    const actualizarProducto = () => {
        setProductos(productos.map((producto) => producto.id === editando ? {id: editando, nombre, precio: Number(precio) } : producto )
        );
        setEditando(null);
        setNombre("");
        setPrecio("");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">📦 Gestión de Productos</h1>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg mb-6">
                <input 
                    type="text"
                    placeholder="Nombre del producto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    type="number"
                    placeholder="Precio"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editando ? (
                    <button onClick={actualizarProducto}
                    className="w-full bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >✏️ Actualizar</button>) : (<button onClick={agregarProducto}
                className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300">➕ Agregar</button>
                )}
            </div>

            <div className="overflow-x-auto w-full max-w-2xl">
                <table border="1" className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="py-3 px-6 text-left">Nombre</th>
                        <th className="py-3 px-6 text-left">Precio</th>
                        <th className="py-3 px-6 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {productos.map((producto) => (
                    <tr key={producto.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-6">{producto.nombre}</td>
                    <td className="py-3 px-6 text-green-600 font-semibold">${producto.precio}</td>
                    <td className="py-3 px-6 flex justify-center gap-3">
                        <button onClick={() => seleccionarProducto(producto)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-300">✏️ Editar</button>
                        <button onClick={() => eliminarProducto(producto.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300">🗑️ Eliminar</button>
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
            </div>
        </div>
    );
};

export default Productos;
