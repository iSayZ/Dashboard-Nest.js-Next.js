import { mutate } from 'swr';

import { AdminSettings } from '@/types/admin.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to update an user profile
const updateAdminProfile = async (
  data: Partial<AdminSettings>
): Promise<Response> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du profil.');
    }

    mutate('/admin/profile');

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Consolidated exports
export { 
  updateAdminProfile,
};
