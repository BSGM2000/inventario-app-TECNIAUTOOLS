import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Extrae la extensión
    const uniqueName = Date.now() + '-' + path.basename(file.originalname, ext) + ext;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos según la ruta
    if (req.originalUrl.includes('/repuestos/importar')) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
      }
    } else {
      // Para otras rutas, mantener la restricción de imágenes
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Solo se permiten archivos de imagen (JPEG, PNG, GIF)"));
      }
    }
  };

const upload = multer({ storage, fileFilter });
export default upload;
