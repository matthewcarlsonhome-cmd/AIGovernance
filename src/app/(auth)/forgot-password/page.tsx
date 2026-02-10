'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder') &&
    url.startsWith('https://')
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!configured) {
      setError(
        'Supabase is not configured. Add your Supabase credentials to .env.local and restart the dev server.'
      );
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (resetError) {
        if (resetError.message.includes('rate limit') || resetError.message.includes('Too many')) {
          setError('Too many reset requests. Please wait a few minutes before trying again.');
        } else {
          setError(`Password reset failed: ${resetError.message}`);
        }
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (message.includes('fetch') || message.includes('network') || message.includes('ECONNREFUSED')) {
        setError('Cannot connect to the authentication server. Please check your internet connection.');
      } else {
        setError(`Password reset failed: ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Reset password</CardTitle>
        <CardDescription className="text-center">
          {isSubmitted
            ? 'Check your inbox for the reset link'
            : 'Enter your email and we will send you a reset link'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!configured && !isSubmitted && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Supabase not configured</p>
              <p className="mt-1">
                Password reset requires Supabase authentication to be configured.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isSubmitted ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to
              </p>
              <p className="text-sm font-medium">{email}</p>
              <p className="text-xs text-muted-foreground">
                If you don&apos;t see it, check your spam folder. The link expires in 24 hours.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                setError('');
              }}
            >
              Try a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
              disabled={isLoading}
            >
              {isLoading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
