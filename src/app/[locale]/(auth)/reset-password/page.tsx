import { AuthCard } from '@/components/auth/AuthCard'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = { title: 'Reset Password — Roadmap' }

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      description="Your new password must be at least 8 characters"
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}
