const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to initialize 2FA
const init2FA = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/2fa/setup/init`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de l'activation 2FA : ${response.statusText}`
      );
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Erreur lors de l'activation 2FA :", error);
    throw error;
  }
};

// Function to verify 2FA code
const verifyInitCode2FA = async (code2FA: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/2fa/setup/validate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code2FA,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la validation 2FA : ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la validation 2FA :', error);
    throw error;
  }
};

// Function to disabled 2FA
const disable2FA = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/2fa/disable`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la désactivation 2FA : ${response.statusText}`
      );
    }

    return response.status;
  } catch (error) {
    console.error('Erreur lors de la désactivation 2FA :', error);
    throw error;
  }
};

// Function to generate new backup codes 2FA
const generateBackupCodes2FA = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/2fa/backup/generate`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la génération des backup codes 2FA : ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la génération des backup codes 2FA :', error);
    throw error;
  }
};

// Function to verify two FA before important action
const verifyTwoFA = async (
  code: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/2fa/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        errorResponse.message || 'Erreur lors de la vérification 2FA'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification 2FA :', error);
    throw error;
  }
};

export {
  init2FA,
  verifyInitCode2FA,
  disable2FA,
  generateBackupCodes2FA,
  verifyTwoFA,
};
