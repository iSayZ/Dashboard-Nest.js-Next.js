const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Custom Error class to include response status
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const confirmChangeRequest = async (token: string, requestType: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/change-requests/confirm/${token}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestType }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json(); // Récupérer les données d'erreur du backend
      console.error("Erreur lors de la confirmation:", errorData); // Log de l'erreur
      throw new Error(errorData.message || "Erreur lors de la confirmation");
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    throw error;
  }
};

// Function to change the password
const changePassword = async (
  data: Partial<{ currentPassword: string, newPassword: string }>
): Promise<Response> => {
  try {
    const response = await fetch(`${API_BASE_URL}/change-requests/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json(); // Récupère les données d'erreur depuis le backend
      throw new ApiError(response.status, errorData.message || 'Erreur lors de la mise à jour du mot de passe.');
    }

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Consolidated exports
export { 
  confirmChangeRequest,
  changePassword,
  ApiError,
};
