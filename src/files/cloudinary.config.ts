import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // .env fayldan olingan nom
  api_key: process.env.CLOUDINARY_API_KEY,       // .env fayldan olingan API kaliti
  api_secret: process.env.CLOUDINARY_API_SECRET, // .env fayldan olingan API siri
});

export { cloudinary };
