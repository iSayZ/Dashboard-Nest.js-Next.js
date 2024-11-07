import { AdminProfile } from '@/types/admin.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to upload an avatar
const uploadAvatar = async (
  image: FormData,
  source: string
): Promise<AdminProfile['avatar']> => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/avatar/${source}`, {
      method: 'POST',
      body: image,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(`Erreur HTTP : ${response.status} - ${errorResponse}`);
    }

    const avatar = await response.text();
    return avatar;
  } catch (error) {
    console.error(`Erreur lors de l'upload de l'avatar.`, error);
    throw error;
  }
};

// Function to upload an image of a realisation
const uploadRealisationImage = async (
  image: FormData,
  source: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/upload/realisation/${source}`,
      {
        method: 'POST',
        body: image,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(`Erreur HTTP : ${response.status} - ${errorResponse}`);
    }

    const imageUrl = await response.text();
    return imageUrl;
  } catch (error) {
    console.error(`Erreur lors d'upload du header.`, error);
    throw error;
  }
};

// Consolidated exports
export { uploadAvatar, uploadRealisationImage };
