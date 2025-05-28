import { useEffect, useState } from 'react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 1 minuto en milisegundos

const events = ['mousemove', 'keypress', 'scroll', 'touchstart'];

export const useIdle = (onLogout) => {
    const [isIdle, setIsIdle] = useState(false);
    let idleTimer;

    const resetIdleTimer = () => {
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
        setIsIdle(false);
        idleTimer = setTimeout(() => {
            setIsIdle(true);
            const confirmLogout = confirm("Has estado inactivo durante mucho tiempo. ¿Deseas cerrar sesión?");
        if (confirmLogout) {
            onLogout();
        } else {
            resetIdleTimer(); // Si el usuario cancela, resetear el timer
        }
        }, INACTIVITY_TIMEOUT);
    };

    useEffect(() => {
        // Resetear el timer cuando haya actividad
        events.forEach(event => {
            window.addEventListener(event, resetIdleTimer);
        });

        // Inicializar el timer
        resetIdleTimer();

        // Limpiar listeners y timer cuando el componente se desmonte
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetIdleTimer);
            });
            if (idleTimer) {
                clearTimeout(idleTimer);
            }
        };
    }, [onLogout]);

    return { isIdle };
};
