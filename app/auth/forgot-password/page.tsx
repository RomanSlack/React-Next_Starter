'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { authAPI } from '@/app/lib/api/auth';
import { forgotPasswordSchema } from '@/lib/utils/validation';

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a password reset link to{' '}
              <span className="font-medium">{getValues('email')}</span>
            </p>
          </div>
          
          {/* Success Card */}
          <Card className="shadow-xl">
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    fullWidth
                  >
                    Try again
                  </Button>
                  
                  <Link href="/auth/login">
                    <Button variant="ghost" fullWidth>
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        
        {/* Reset Form */}
        <Card className="shadow-xl">
          <CardHeader title="Reset Password" />
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
                Send reset email
              </Button>
            </form>
            
            {/* Back to sign in */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-medium text-accent hover:text-accent/80"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;