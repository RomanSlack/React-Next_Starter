'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth';
import { registerSchema } from '@/lib/utils/validation';

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
};

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  
  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
      });
      router.push('/dashboard');
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Registration failed. Please try again.',
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-grape-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-grape-500 to-grape-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Skema and boost your productivity
          </p>
        </div>
        
        {/* Registration Form */}
        <Card className="shadow-xl">
          <CardHeader title="Sign Up" />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('firstName')}
                  type="text"
                  label="First name"
                  placeholder="John"
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                  autoFocus
                />
                
                <Input
                  {...register('lastName')}
                  type="text"
                  label="Last name"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                />
              </div>
              
              {/* Username */}
              <Input
                {...register('username')}
                type="text"
                label="Username"
                placeholder="johndoe"
                error={errors.username?.message}
                fullWidth
                autoComplete="username"
              />
              
              {/* Email */}
              <Input
                {...register('email')}
                type="email"
                label="Email address"
                placeholder="john.doe@example.com"
                error={errors.email?.message}
                fullWidth
                autoComplete="email"
              />
              
              {/* Password */}
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                error={errors.password?.message}
                fullWidth
                autoComplete="new-password"
                iconPosition="right"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                }
              />
              
              {/* Confirm Password */}
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                fullWidth
                autoComplete="new-password"
                iconPosition="right"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                }
              />
              
              {/* Terms and conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-grape-600 focus:ring-grape-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="text-grape-600 hover:text-grape-500 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-grape-600 hover:text-grape-500 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              {/* Error message */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}
              
              {/* Submit button */}
              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                className="bg-grape-600 hover:bg-grape-700"
              >
                Create Account
              </Button>
            </form>
            
            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-grape-600 hover:text-grape-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;