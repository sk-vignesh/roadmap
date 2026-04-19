import { getTranslations } from 'next-intl/server'
import { AuthCard } from '@/components/auth/AuthCard'
import { RegisterForm } from '@/components/auth/RegisterForm'

export async function generateMetadata() {
  const t = await getTranslations('auth')
  return { title: `${t('register')} — Roadmap` }
}

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Join to suggest features and upvote ideas"
    >
      <RegisterForm />
    </AuthCard>
  )
}
