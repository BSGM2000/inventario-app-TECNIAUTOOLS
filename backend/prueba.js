// prueba.js
import db from './config/db.js';

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectarse a la base de datos:', err.message);
    return;
  }
  console.log('¡Conexión a la base de datos exitosa!');
  connection.release();
});
