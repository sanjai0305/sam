
import * as faceapi from 'face-api.js';

// Load models from public/models
export const loadModels = async () => {
    try {
        const MODEL_URL = '/models';
        console.log('Loading face recognition models from:', MODEL_URL);

        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log('✓ SSD MobileNet V1 loaded');

        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('✓ Face Landmark 68 loaded');

        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log('✓ Face Recognition loaded');

        console.log('All models loaded successfully!');
    } catch (error) {
        console.error('Error loading models:', error);
        throw new Error('Failed to load face recognition models. Please refresh the page.');
    }
};

// Detect face and return descriptor
export const getFaceDescriptor = async (imageSrc) => {
    const img = await faceapi.fetchImage(imageSrc);
    const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        throw new Error('No face detected');
    }

    return detection.descriptor;
};

// Convert Float32Array to regular array for storage
export const descriptorToArray = (descriptor) => {
    return Array.from(descriptor);
};

// Convert stored array back to Float32Array for matching
export const arrayToDescriptor = (array) => {
    return new Float32Array(array);
};
