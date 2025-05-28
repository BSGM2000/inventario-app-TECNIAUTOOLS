import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Intentando conectar con la configuración:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD ? '***' : '(vacío)'
});

const testConnection = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'inventario_autos'
        });

        console.log('✅ Conexión exitosa a MySQL');
        
        // Verificar si la base de datos existe
        const [rows] = await connection.query('SELECT DATABASE() as db');
        console.log('Base de datos conectada:', rows[0].db);
        
        // Verificar si la tabla usuarios existe
        try {
            const [tables] = await connection.query('SHOW TABLES LIKE "usuarios"');
            if (tables.length > 0) {
                console.log('✅ La tabla "usuarios" existe');
                const [users] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
                console.log(`📊 Número de usuarios: ${users[0].count}`);
            } else {
                console.log('⚠️  La tabla "usuarios" NO existe');
            }
        } catch (err) {
            console.error('Error al verificar la tabla usuarios:', err.message);
        }

    } catch (error) {
        console.error('❌ Error de conexión a la base de datos:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        });
        
        // Sugerencias basadas en el error
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔑 Error de autenticación. Verifica:');
            console.log('1. Que el usuario y contraseña sean correctos');
            console.log('2. Que el usuario tenga permisos para acceder a la base de datos');
            console.log('3. Que la contraseña sea correcta (incluyendo si es vacía)');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n📂 La base de datos no existe. ¿Quieres crearla? (S/N)');
        }
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
};

testConnection();