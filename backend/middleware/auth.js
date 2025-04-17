import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }

  jwt.verify(token, 'secreto', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.userId = decoded.id_usuario; // Guardar el ID del usuario en la solicitud
    next();
  });
};

export default verifyToken;