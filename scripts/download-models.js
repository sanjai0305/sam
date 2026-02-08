
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate up one level from scripts/ to root, then to public/models
const modelsDir = path.join(__dirname, '..', 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

console.log(`Downloading models to ${modelsDir}...`);

files.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const fileUrl = `${baseUrl}/${file}`;

    const fileStream = fs.createWriteStream(filePath);
    https.get(fileUrl, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded: ${file}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${file}:`, err);
    });
});
