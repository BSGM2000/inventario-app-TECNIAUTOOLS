import xlsx from 'xlsx';
import db from '../config/db.js';

export const importarRepuestos = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    try {
        // Leer el archivo Excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validar estructura del Excel
        const requiredColumns = ['codigo', 'descripcion','cantidad','precio', 'categoria', 'proveedor', 'ubicacion'];
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            return res.status(400).json({
                error: 'El archivo no tiene el formato correcto',
                columnasFaltantes: missingColumns
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            let resultados = {
                exitosos: 0,
                fallidos: [],
                total: data.length
            };

            for (const row of data) {
                try {
                    // Buscar o crear categoría
                    let [categoriaResult] = await connection.query(
                        'SELECT id_categoria FROM categorias WHERE nombre = ?',
                        [row.categoria]
                    );

                    let idCategoria;
                    if (categoriaResult.length === 0) {
                        const [newCat] = await connection.query(
                            'INSERT INTO categorias (nombre) VALUES (?)',
                            [row.categoria]
                        );
                        idCategoria = newCat.insertId;
                    } else {
                        idCategoria = categoriaResult[0].id_categoria;
                    }

                    // Buscar o crear proveedor
                    let [proveedorResult] = await connection.query(
                        'SELECT id_proveedor FROM proveedores WHERE empresa = ?',
                        [row.proveedor]
                    );

                    let idProveedor;
                    if (proveedorResult.length === 0) {
                        const [newProv] = await connection.query(
                            'INSERT INTO proveedores (empresa) VALUES (?)',
                            [row.proveedor]
                        );
                        idProveedor = newProv.insertId;
                    } else {
                        idProveedor = proveedorResult[0].id_proveedor;
                    }

                    // Insertar repuesto
                    await connection.query(
                        'INSERT INTO repuestos (codigo, descripcion,precio, id_categoria, id_proveedor) VALUES (?, ?, ?, ?, ?)',
                        [row.codigo, row.descripcion, row.precio, idCategoria, idProveedor]
                    );
                    // Insertar cantidades
                    const [repuestoInsertado] = await connection.query(
                        'SELECT LAST_INSERT_ID() as id_repuesto'
                    );
                    const idRepuesto = repuestoInsertado[0].id_repuesto;
                    let idUbicacion;
                    // Buscar o crear ubicación
                    let [ubicacionResult] = await connection.query(
                        'SELECT id_ubicacion FROM ubicaciones WHERE nombre = ?',
                        [row.ubicacion]
                    );
                    if (ubicacionResult.length === 0) {
                        const [newUbic] = await connection.query(
                            'INSERT INTO ubicaciones (nombre) VALUES (?)',
                            [row.ubicacion]
                        );
                        idUbicacion = newUbic.insertId;
                    } else {
                        idUbicacion = ubicacionResult[0].id_ubicacion;
                    }
                    await connection.query(
                        'INSERT INTO stock_por_ubicacion (id_repuesto, id_ubicacion, stock_actual) VALUES (?, ?, ?)',
                        [idRepuesto, idUbicacion, row.cantidad]
                    );
                    // Obtener nombre de ubicación
                    const [ubicacion] = await connection.query(
                        'SELECT nombre FROM ubicaciones WHERE id_ubicacion = ?',
                        [idUbicacion]
                    );
                    row.ubicacion = ubicacion[0].nombre;

                    resultados.exitosos++;
                } catch (error) {
                    resultados.fallidos.push({
                        fila: data.indexOf(row) + 2,
                        error: error.message,
                        datos: row
                    });
                }
            }

            await connection.commit();
            res.json(resultados);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al importar repuestos:', error);
        res.status(500).json({
            error: 'Error al procesar el archivo',
            detalles: error.message
        });
    }
};