import { Realisation } from '@/types/realisation.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to create a realisation
const createRealisation = async (
  data: Partial<Realisation>
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/realisations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la création de la réalisation : ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la création de la réalisation :`, error);
    throw error;
  }
};

// Function to update a realisation
const updateRealisation = async (
  slug: Realisation['slug'],
  data: Partial<Realisation>
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/realisations/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la mise à jour de la réalisation : ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la réalisation :`, error);
    throw error;
  }
};

// Function to change the order of all active realisations
const updateOrderRealisation = async (
  orderRealisationArray: Pick<Realisation, 'slug' | 'order'>[]
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/realisations/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRealisationArray),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la mise à jour des ordres des réalisations : ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour des ordres des réalisations :`,
      error
    );
    throw error;
  }
};

// Function to delete a realisation by its ID
const deleteRealisation = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/realisations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la suppression de la réalisation avec ID ${id}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la réalisation avec ID ${id}:`,
      error
    );
    throw error;
  }
};

// Consolidated exports
export {
  createRealisation,
  updateRealisation,
  updateOrderRealisation,
  deleteRealisation,
};
