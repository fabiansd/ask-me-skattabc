'use client'
import GoogleLoginButton from '../src/components/auth/GoogleLoginButton';
import UsernameForm from '../src/components/auth/UsernameForm';
import OrDivider from '../src/components/auth/OrDivider';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card p-6 bg-base-200 shadow max-w-md w-full">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">Logg inn</h2>

        <GoogleLoginButton />
        <OrDivider />
        <UsernameForm />
      </div>
    </div>
  );
}
