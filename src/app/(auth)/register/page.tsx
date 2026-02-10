'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Building, AlertCircle, Info, CheckCircle } from 'lucide-react';
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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const configured = isSupabaseConfigured();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!configured) {
      setError(
        'Supabase is not configured. Add your Supabase credentials to .env.local and restart the dev server. See SETUP_MANUAL.md for details.'
      );
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!orgName.trim()) {
      setError('Please enter your organization name.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            organization_name: orgName.trim(),
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (signUpError.message.includes('password')) {
          setError(`Password error: ${signUpError.message}`);
        } else if (signUpError.message.includes('rate limit') || signUpError.message.includes('Too many')) {
          setError('Too many registration attempts. Please wait a moment and try again.');
        } else {
          setError(`Registration failed: ${signUpError.message}`);
        }
        return;
      }

      if (data.user && !data.session) {
        // Email confirmation is required
        setSuccess(
          `Account created! A confirmation email has been sent to ${email.trim()}. Please check your inbox (and spam folder) to verify your email before signing in.`
        );
      } else if (data.user && data.session) {
        // Email confirmation is disabled — auto-signed in
        router.push('/');
        router.refresh();
      } else {
        setError('Registration completed but no user was returned. Please try signing in.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (message.includes('fetch') || message.includes('network') || message.includes('ECONNREFUSED')) {
        setError('Cannot connect to the authentication server. Please check your internet connection and Supabase configuration.');
      } else {
        setError(`Registration failed: ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Get started with your AI governance journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!configured && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Supabase not configured</p>
              <p className="mt-1">
                To enable registration, add your Supabase credentials to{' '}
                <code className="rounded bg-blue-100 px-1 py-0.5 text-xs font-mono">.env.local</code>{' '}
                and restart the dev server.
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

        {success && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm text-green-800">
              <p>{success}</p>
              <Link
                href="/login"
                className="mt-2 inline-block font-medium text-green-700 hover:underline"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
              <Label htmlFor="orgName">Organization Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Acme Corp"
                  value={orgName}
                  onChange={(e) => { setOrgName(e.target.value); setError(''); }}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
