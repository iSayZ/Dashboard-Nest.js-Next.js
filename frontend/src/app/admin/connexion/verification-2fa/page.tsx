'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';

import { verify2FALogin } from '@/api/authApi';

const Login2FAPage: React.FC = () => {
  const router = useRouter();

  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      setCode('');

      const isValid = await verify2FALogin(code);

      if (!isValid) {
        throw new Error('Code invalide');
      }

      router.push('/admin/dashboard');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 w-screen">
        <Image
          src="https://images.unsplash.com/photo-1620121478247-ec786b9be2fa?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          fill
          alt="Image"
          className="object-cover"
        />
      </div>
      <Card className="relative z-10 w-min">
        <CardHeader>
          <CardTitle className="text-3xl">
            Vérification à deux facteurs
          </CardTitle>
          <CardDescription>
            Veuillez entrer le code de sécurité généré par votre application
            d'authentification.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InputOTP
            value={code}
            onChange={(code) => setCode(code)}
            maxLength={6}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <a href="#" className="text-sm hover:underline">
            Vous n'avez plus accès à la 2FA ?
          </a>
        </CardContent>
        <CardFooter>
          <Button
            className="w-1/2"
            onClick={handleVerify}
            disabled={code.length !== 6 || loading}
            type="submit"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login2FAPage;
