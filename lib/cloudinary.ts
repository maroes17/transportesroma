import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_URL) {
  throw new Error('CLOUDINARY_URL no está definida en las variables de entorno');
}

cloudinary.config({
  url: process.env.CLOUDINARY_URL
});

export default cloudinary; 