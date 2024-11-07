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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { login } from '@/api/authApi';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<{ email: string; password: string }>(
    {
      email: '',
      password: '',
    }
  );

  const [errorMsg, setErrorMsg] = useState<{
    email: string;
    password: string;
    other: string;
  }>({
    email: '',
    password: '',
    other: '',
  });

  // Handle change for the inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Check if the input is empty to refresh error msg
    if (name === 'email') {
      setErrorMsg((prevError) => ({
        ...prevError,
        email: '',
      }));
    }

    if (name === 'password') {
      setErrorMsg((prevError) => ({
        ...prevError,
        password: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (formData.email === '') {
      return setErrorMsg({
        ...errorMsg,
        email: 'Le champ email est obligatoire.',
      });
    }

    if (formData.password === '') {
      return setErrorMsg({
        ...errorMsg,
        password: 'Le champ mot de passe est obligatoire.',
      });
    }

    try {
      const response = await login(formData);
      if (response.require2FA) {
        router.push('/admin/connexion/verification-2fa');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMsg({ ...errorMsg, other: error.message });
      } else {
        setErrorMsg({
          ...errorMsg,
          other: 'Une erreur est survenue. Veuillez réessayer.',
        });
      }
    }
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') {
      handleSubmit();
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
      <Card className="relative z-10 w-[350px]">
        <CardHeader>
          <CardTitle className="text-3xl">Connexion Admin</CardTitle>
          <CardDescription>
            Veuillez entrer vos identifiants pour accéder au panel
            d'administration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Entrez votre email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={
                    errorMsg.email ? 'outline outline-1 outline-red-500' : ''
                  }
                  required
                />
                {errorMsg.email && (
                  <p className="text-sm text-red-500">{errorMsg.email}</p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Entrez votre mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={
                    errorMsg.password ? 'outline outline-1 outline-red-500' : ''
                  }
                  required
                />
                {errorMsg.password && (
                  <p className="text-sm text-red-500">{errorMsg.password}</p>
                )}
              </div>
              {errorMsg.other && (
                <p className="text-sm text-red-500">{errorMsg.other}</p>
              )}
            </div>
          </form>
          <p className="cursor-pointer text-sm text-foreground hover:underline">
            Mot de passe oublié ?
          </p>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            onKeyDown={handleKeyDown}
          >
            Connexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
