import { OtpLoginForm } from '@/components/auth/OtpLoginForm'

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <OtpLoginForm />
        </div>
      </div>
    </div>
  )
}
