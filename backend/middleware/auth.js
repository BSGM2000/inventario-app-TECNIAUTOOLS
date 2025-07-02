import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: 'Acceso no autorizado: Token no proporcionado',
            details: 'El encabezado Authorization está ausente'
        });
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Acceso no autorizado: Token no proporcionado',
            details: 'El formato del token es inválido. Debe ser: Bearer [token]'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto', (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: 'Token inválido o expirado',
                error: process.env.NODE_ENV === 'development' ? {
                    name: err.name,
                    message: err.message,
                    expiredAt: err.expiredAt
                } : undefined
            });
        }
        
        req.userId = decoded.id;
        req.userRol = decoded.rol;
        next();
    });
};

export default verifyToken;
