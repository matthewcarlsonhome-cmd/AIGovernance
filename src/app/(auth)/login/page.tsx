'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Chrome, Building2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');

  const configured = isSupabaseConfigured();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!configured) {
      setError(
        'Supabase is not configured. Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the dev server. See SETUP_MANUAL.md for details.'
      );
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Your email has not been confirmed yet. Please check your inbox for a confirmation link.');
        } else if (authError.message.includes('Too many requests')) {
          setError('Too many sign-in attempts. Please wait a moment and try again.');
        } else {
          setError(`Sign-in failed: ${authError.message}`);
        }
        return;
      }

      if (!data.user) {
        setError('Sign-in completed but no user was returned. Please try again.');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (message.includes('fetch') || message.includes('network') || message.includes('ECONNREFUSED')) {
        setError('Cannot connect to the authentication server. Please check your internet connection and Supabase configuration.');
      } else {
        setError(`Sign-in failed: ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'azure') => {
    setError('');

    if (!configured) {
      setError('Supabase is not configured. See SETUP_MANUAL.md for setup instructions.');
      return;
    }

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (oauthError) {
        setError(`OAuth sign-in failed: ${oauthError.message}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`OAuth sign-in failed: ${message}`);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Supabase not configured</p>
              <p className="mt-1">
                To enable authentication, add your Supabase credentials to{' '}
                <code className="rounded bg-blue-100 px-1 py-0.5 text-xs font-mono">.env.local</code>{' '}
                and restart the dev server. See SETUP_MANUAL.md for details.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('google')}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('azure')}
            disabled={isLoading}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Microsoft
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
