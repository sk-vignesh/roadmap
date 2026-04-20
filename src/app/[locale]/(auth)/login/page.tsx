import { OtpLoginForm } from '@/components/auth/OtpLoginForm'
import { Map } from 'lucide-react'

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Map className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmap</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <OtpLoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          A code will be emailed to you. No password required.
        </p>
      </div>
    </div>
  )
}
