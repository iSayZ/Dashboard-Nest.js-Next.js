import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

interface MailProps {
  name: string;
  appName: string;
  appUrl: string;
  token: string;
}

const main = "bg-gray-100 font-sans py-6 px-2";
const container = "max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden";
const header = "bg-brand text-white text-center py-8 px-4 flex flex-col items-center gap-8";
const logo = "w-1/2 min-md:w-1/3";
const headerText = "text-2xl font-semibold m-0";
const content = "p-8 flex flex-col gap-8"
const paragraph = "text-base leading-6 text-gray-700 m-0";
const btnContainer = "text-center my-6";
const button = "bg-brand px-6 py-4 rounded-md shadow-md no-underline text-slate-50 text-wrap block leading-7";
const footer = "text-gray-600 text-sm text-center py-4 border-t border-gray-200";
const copyright = "text-sm leading-6 text-gray-700 m-0";

const PasswordResetEmail = (
  { name, appName, appUrl, token }: MailProps
) => {

  const resetLink = `${appUrl}/admin/reset-mdp/${token}`;

  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: "#004A6B",
            },
          },
        },
      }}
    >
      <div className={main}>
        <div className={container}>
          <div className={header}>
            <div className={logo}>
              <img src={`${appUrl}/assets/images/logo-cropped.svg`} alt={`Logo de ${appName}`} />
            </div>
            <h1 className={headerText}>Réinitialisation de Mot de Passe</h1>
          </div>
          <div className={content}>
            <p className={paragraph}>Bonjour {name},</p>
            <p className={paragraph}>
              Vous avez récemment demandé la réinitialisation de votre mot de passe pour votre compte sur {appName}.
            </p>
            <p className={paragraph}>
              Pour continuer et créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :
            </p>
            <div className={btnContainer}>
              <a href={resetLink} className={button}>
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p className={paragraph}>
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail. Ce lien expirera dans 24 heures.
            </p>
            <p className={paragraph}>
              Bien à vous,
              <br />
              L'équipe {appName}
            </p>
          </div>
          <div className={footer}>
            <p className={copyright}>&copy; {new Date().getFullYear()} {appName}. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </Tailwind>
  );
};

export default PasswordResetEmail;