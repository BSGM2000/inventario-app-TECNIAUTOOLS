import bcrypt from 'bcrypt';

const encriptarContrasena = async (password) => {
  try {
    const saltRounds = 10; // Número de rondas para generar el salt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Contraseña en texto plano:', password);
    console.log('Contraseña encriptada:', hashedPassword);
  } catch (error) {
    console.error('Error al encriptar la contraseña:', error);
  }
};

// Cambia '123456' por la contraseña que deseas encriptar
encriptarContrasena('123456');