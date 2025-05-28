import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Acceso no autorizado: Token no proporcionado' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto', (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err.message);
            return res.status(403).json({ 
                success: false,
                message: 'Token inválido o expirado',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        req.userId = decoded.id;
        req.userRol = decoded.rol;
        next();
    });
};

export default verifyToken;
