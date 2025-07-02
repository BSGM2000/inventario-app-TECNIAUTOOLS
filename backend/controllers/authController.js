// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';
const JWT_EXPIRES_IN = '24h';

// Utilidad para respuestas de error
const createErrorResponse = (res, status, message, error = null) => {
    if (error) console.error('Error:', error);
    return res.status(status).json({ 
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
};

// Validación de entrada
const validateLoginInput = (email, password) => {
    if (!email || !password) {
        return { isValid: false, message: 'Email y contraseña son requeridos' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { isValid: false, message: 'Formato de email inválido' };
    }
    return { isValid: true };
};

// Controlador de login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar entrada
        const { isValid, message } = validateLoginInput(email, password);
        if (!isValid) {
            return createErrorResponse(res, 400, message);
        }

        // Buscar usuario
        const [users] = await db.query(
            'SELECT id_usuario, email, password FROM usuarios WHERE email = ?', 
            [email]
        );

        if (!users.length) {
            return createErrorResponse(res, 401, 'Credenciales inválidas');
        }

        const user = users[0];

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return createErrorResponse(res, 401, 'Credenciales inválidas');
        }

        // Generar token
        const token = jwt.sign(
            { 
                id: user.id_usuario,
                email: user.email,
            }, 
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Enviar respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                user: {
                    id: user.id_usuario,
                    email: user.email,
                }
            }
        });

    } catch (error) {
        return createErrorResponse(res, 500, 'Error en el servidor', error);
    }
};

// Controlador de registro
export const register = async (req, res) => {
    try {
        const { email, password, nombre, currentUserEmail, currentUserPassword } = req.body;

        // Validar entrada
        if (!email || !password || !nombre || !currentUserEmail || !currentUserPassword) {
            return createErrorResponse(res, 400, 'Todos los campos son requeridos');
        }

        // Verificar credenciales del usuario actual
        const [currentUsers] = await db.query(
            'SELECT id_usuario, email, password FROM usuarios WHERE email = ?',
            [currentUserEmail]
        );

        if (!currentUsers.length) {
            return createErrorResponse(res, 401, 'Usuario actual no encontrado');
        }

        const currentUser = currentUsers[0];
        const isCurrentPasswordValid = await bcrypt.compare(currentUserPassword, currentUser.password);

        if (!isCurrentPasswordValid) {
            return createErrorResponse(res, 401, 'Credenciales del usuario actual inválidas');
        }

        // Verificar si el usuario ya existe
        const [existingUsers] = await db.query(
            'SELECT id_usuario FROM usuarios WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return createErrorResponse(res, 400, 'El email ya está registrado');
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );

        // Generar token
        const token = jwt.sign(
            { 
                id: result.insertId,
                email,
            }, 
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Enviar respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                token,
                user: {
                    id: result.insertId,
                    email,
                }
            }
        });

    } catch (error) {
        return createErrorResponse(res, 500, 'Error al registrar el usuario', error);
    }
};
