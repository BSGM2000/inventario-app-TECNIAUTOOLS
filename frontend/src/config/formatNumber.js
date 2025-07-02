// Función para formatear números con separadores de miles
export const formatNumber = (number) => {
    if (number === null || number === undefined) return '0.00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    return isNaN(num) ? '0.00' : num.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};