import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog";

interface PasswordChangeAlertProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const PasswordChangeAlert: React.FC<PasswordChangeAlertProps> = ({ isOpen, setIsOpen }) => {
  // Function to close the alert
  const closeAlert = () => setIsOpen(false);

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demande de changement de mot de passe</AlertDialogTitle>
            <AlertDialogDescription>
              Votre demande de changement de mot de passe a bien été prise en compte. Un email a été envoyé à votre adresse pour confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeAlert}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default PasswordChangeAlert;
