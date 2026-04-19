import { getAllSettings } from '@/app/actions/settings'
import { AdminSettingsForm } from '@/components/admin/AdminSettingsForm'

export const metadata = { title: 'Settings — Admin' }

export default async function AdminSettingsPage() {
  const settings = await getAllSettings()
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-0.5">Configure your roadmap application.</p>
      </div>
      <AdminSettingsForm settings={settings} />
    </div>
  )
}
