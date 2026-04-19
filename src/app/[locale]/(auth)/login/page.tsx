import { getTranslations } from 'next-intl/server'
import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'

export async function generateMetadata() {
  const t = await getTranslations('auth')
  return { title: `${t('login')} — Roadmap` }
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthCard>
  )
}
