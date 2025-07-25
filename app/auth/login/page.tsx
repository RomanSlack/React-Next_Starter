'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth';
import { loginSchema } from '@/lib/utils/validation';
import { cn } from '@/lib/utils';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Login failed. Please try again.',
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Skema account
          </p>
        </div>
        
        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader title="Sign In" />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <Input
                {...register('email')}
                type="email"
                label="Email address"
                placeholder="Enter your email"
                error={errors.email?.message}
                fullWidth
                autoComplete="email"
                autoFocus
              />
              
              {/* Password */}
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  fullWidth
                  autoComplete="current-password"
                  iconPosition="right"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  }
                />
              </div>
              
              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-accent focus:ring-accent border-border rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                    Remember me
                  </label>
                </div>
                
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-accent hover:text-accent/80 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
              
              {/* Error message */}
              {errors.root && (
                <div className="bg-destructive/10 border border-destructive rounded-md p-3">
                  <p className="text-sm text-destructive">{errors.root.message}</p>
                </div>
              )}
              
              {/* Submit button */}
              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Sign In
              </Button>
            </form>
            
            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-accent hover:text-accent/80"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;