const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Carpeta de fotos
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Genera un nombre único con la fecha y un número random
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Archivos estáticos (HTML, CSS y las fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname))); 

// Ruta para recibir la foto
app.post('/upload', upload.single('foto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna foto' });
    }
    res.json({ mensaje: '¡Foto subida con éxito!' });
});

// Ruta para que la galería consulte las fotos
app.get('/api/fotos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'No se pudieron cargar las fotos' });
        }
        // Solo devolver archivos (ignorar carpetas ocultas si las hay)
        const imagenes = files
            .filter(file => file.match(/\.(png|jpg|jpeg)$/i))
            .map(file => `/uploads/${file}`);
            
        res.json(imagenes);
    });
});

app.listen(PORT, () => {
    console.log(`¡Servidor de la boda corriendo en http://localhost:${PORT}!`);
});