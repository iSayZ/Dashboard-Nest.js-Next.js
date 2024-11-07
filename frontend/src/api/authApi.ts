const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to login
const login = async (formData: {
  email: string;
  password: string;
}): Promise<{ require2FA: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la connexion');
    }

    // Return the JSON response
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    throw error;
  }
};

// Function to verify 2FA to complete login
const verify2FALogin = async (
  code2FA: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: code2FA }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Erreur lors de la vérification 2FA'
      );
    }

    const data = await response.json();

    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error('Erreur lors de la verification 2FA :', error);
    throw error;
  }
};

// Function to logout
const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la déconnexion');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    throw error;
  }
};

// Function to verify identity before action
const verifyIdentity = async (formData: {
  password: string;
}): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-identity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Erreur lors de la vérification de l'identité"
      );
    }

    return response.status;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'identité :", error);
    throw error;
  }
};

export { login, verify2FALogin, logout, verifyIdentity };
