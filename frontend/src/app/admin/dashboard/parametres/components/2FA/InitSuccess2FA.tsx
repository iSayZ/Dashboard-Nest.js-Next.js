import { Check, Copy, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InitSuccess2FAProps {
  backupCodes: string[];
}

const InitSuccess2FA: React.FC<InitSuccess2FAProps> = ({ backupCodes }) => {
  // Function to download backup codes
  const downloadBackupCodes = (codes: string[]): void => {
    // Create a title for the downloaded file
    const title = 'Vos codes de secours\n\n'; // Title with two new lines for spacing

    // Convert the codes into a text format
    const textToDownload = title + codes.join('\n'); // Each code on a new line

    // Create a blob from the text
    const blob = new Blob([textToDownload], { type: 'text/plain' });

    // Create a link for the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codes_de_secours.txt'; // Name of the file to download
    document.body.appendChild(a); // Append the link to the document
    a.click(); // Simulate a click to start the download
    a.remove(); // Remove the link from the document
    window.URL.revokeObjectURL(url); // Free up memory
  };

  // Function to copy backup codes
  const copyBackupCodes = (elementId: string): void => {
    const element = document.getElementById(elementId);

    if (!element) {
      console.error(`Element with id "${elementId}" not found.`);
      return;
    }

    const textToCopy = element.innerText; // Get text without html

    // Use API clipboard to copy
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success('Codes de secours copiés dans le presse-papiers.');
      })
      .catch(() => {
        toast.error('Impossible de copier les codes.');
      });
  };

  // Function to print backup codes
  const printBackupCodes =
    (elementId: string) =>
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();

      const element = document.getElementById(elementId);

      if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
      }

      // Open new window to print
      const printWindow = window.open('', '', 'height=600,width=800');

      if (printWindow) {
        printWindow.document.write(
          '<html><head><title>Codes de secours</title>'
        );
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Vos codes de secours</h1>');
        printWindow.document.write(
          '<div style="font-family: Arial, sans-serif; font-size: 16px;">'
        );
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    };

  return (
    <>
      <DialogContent
        className="max-h-screen max-w-xl space-y-4 overflow-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex w-full items-center gap-4 text-xl">
            <span className="flex size-10 flex-none items-center justify-center rounded-full bg-lime-500">
              <Check className="size-8 text-secondary" />
            </span>
            Authentification à Deux Facteurs Activée
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-lg font-semibold">Code de secours</p>
            <p className="text-sm">
              En cas de perte de votre appareil ou d'accès à votre application
              d'authentification, vous pouvez utiliser l'un de vos{' '}
              <span className="font-semibold">codes de secours</span> pour vous
              connecter à votre compte en toute sécurité. Chaque code ne peut
              être utilisé{' '}
              <span className="font-semibold">qu'une seule fois</span>.
            </p>
          </div>
          <div className="flex w-full justify-center">
            <div className="w-max rounded-sm border border-muted-foreground/20 bg-muted-foreground/20 shadow-sm">
              <div
                id="backup-codes"
                className="grid grid-cols-3 gap-4 p-4 md:grid-cols-5"
              >
                {backupCodes.map((code, index) => (
                  <p
                    key={index}
                    className="p-2 text-center text-sm font-medium"
                  >
                    {code}
                  </p>
                ))}
              </div>
              <div className="grid cursor-pointer grid-cols-3 overflow-hidden border-t border-muted-foreground/20 bg-muted-foreground/10 shadow-sm">
                <Button
                  onClick={() => downloadBackupCodes(backupCodes)}
                  variant="ghost"
                  className="rounded-none"
                >
                  <Download className="size-5" />
                </Button>
                <Button
                  onClick={printBackupCodes('backup-codes')}
                  variant="ghost"
                  className="rounded-none border-x border-muted-foreground/20"
                >
                  <Printer className="size-5" />
                </Button>
                <Button
                  onClick={() => copyBackupCodes('backup-codes')}
                  variant="ghost"
                  className="rounded-none"
                >
                  <Copy className="size-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg font-semibold">Conservez-les en lieu sûr</p>
            <p className="text-sm">
              Nous vous recommandons fortement de sauvegarder ces codes dans un
              endroit sécurisé, comme un gestionnaire de mots de passe, ou de
              les imprimer et les garder en lieu sûr.
            </p>
          </div>
          <div className="flex justify-center gap-4 sm:justify-end">
            <DialogClose asChild>
              <Button className="w-36">Continuer</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </>
  );
};

export default InitSuccess2FA;
