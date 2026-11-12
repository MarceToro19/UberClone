import { Platform } from 'react-native';

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET
);

export async function uploadImageToCloudinary(uri) {
  if (!uri) return '';
  if (/^https?:\/\//i.test(uri)) return uri;
  if (!isCloudinaryConfigured) return uri;

  try {
    const formData = new FormData();
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    if (Platform.OS === 'web' || uri.startsWith('blob:') || uri.startsWith('data:')) {
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();
      formData.append('file', blob, `driver_${Date.now()}.jpg`);
    } else {
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: `driver_${Date.now()}.jpg`,
      });
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.secure_url || uri;
  } catch (error) {
    console.warn('Error subiendo imagen a Cloudinary:', error.message);
    return uri;
  }
}

export async function uploadDriverPhotos(registerForm) {
  const [photoUri, vehiclePhotoUri, licensePhotoUri, soatPhotoUri, tecnoPhotoUri] =
    await Promise.all([
      uploadImageToCloudinary(registerForm.personal?.photoUri),
      uploadImageToCloudinary(registerForm.vehicle?.vehiclePhotoUri),
      uploadImageToCloudinary(registerForm.documents?.licensePhotoUri),
      uploadImageToCloudinary(registerForm.documents?.soatPhotoUri),
      uploadImageToCloudinary(registerForm.documents?.tecnoPhotoUri),
    ]);

  return {
    ...registerForm,
    personal: {
      ...registerForm.personal,
      photoUri,
    },
    vehicle: {
      ...registerForm.vehicle,
      vehiclePhotoUri,
    },
    documents: {
      ...registerForm.documents,
      licensePhotoUri,
      soatPhotoUri,
      tecnoPhotoUri,
    },
  };
}

