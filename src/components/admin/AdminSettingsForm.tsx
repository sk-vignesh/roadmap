'use client'

import { useState, useTransition } from 'react'
import { saveGeneralSettings, saveGitHubSettings } from '@/app/actions/settings'
import { CheckCircle, Loader2 } from 'lucide-react'

interface AdminSettingsFormProps {
  settings: Record<string, Record<string, unknown>>
}

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const general = settings.general ?? {}
  const color = settings.color ?? {}

  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleGeneral(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      await saveGeneralSettings(new FormData(e.currentTarget))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  function handleGitHub(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      await saveGitHubSettings(new FormData(e.currentTarget))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="space-y-8">
      {/* General */}
      <section className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-lg border-b pb-3">General</h2>
        <form onSubmit={handleGeneral} className="space-y-4">
          <Field label="App Name" hint="Displayed in the navbar and page titles">
            <input
              name="app_name"
              defaultValue={String(general.app_name ?? 'Roadmap')}
              className="input"
            />
          </Field>

          <Field label="Primary Color" hint="Hex color for the primary brand color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primary_color"
                defaultValue={String(color.primary_color ?? '#6366f1')}
                className="h-9 w-16 rounded-lg border cursor-pointer"
              />
              <input
                name="primary_color_text"
                defaultValue={String(color.primary_color ?? '#6366f1')}
                placeholder="#6366f1"
                className="input flex-1"
                readOnly
              />
            </div>
          </Field>

          <Field label="Admin Notification Emails" hint="Comma-separated emails for new item notifications">
            <input
              name="send_notifications_to"
              defaultValue={(general.send_notifications_to as string[] ?? []).join(', ')}
              placeholder="admin@example.com, team@example.com"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Toggle
              name="allow_registration"
              label="Allow Registration"
              hint="Users can sign up"
              defaultChecked={Boolean(general.allow_registration ?? true)}
            />
            <Toggle
              name="password_protection_enabled"
              label="Password Protection"
              hint="Require password to view"
              defaultChecked={Boolean(general.password_protection_enabled)}
            />
            <Toggle
              name="disable_file_uploads"
              label="Disable File Uploads"
              hint="Block file attachment uploads"
              defaultChecked={Boolean(general.disable_file_uploads)}
            />
          </div>

          {Boolean(general.password_protection_enabled) && (
            <Field label="Site Password" hint="Password required to view the roadmap">
              <input
                name="password_protection_password"
                type="password"
                defaultValue={String(general.password_protection_password ?? '')}
                className="input"
              />
            </Field>
          )}

          <SaveButton isPending={isPending} saved={saved} />
        </form>
      </section>

      {/* GitHub */}
      <section className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-lg border-b pb-3 flex items-center gap-2">
          <span>GitHub Integration</span>
        </h2>
        <form onSubmit={handleGitHub} className="space-y-4">
          <Toggle
            name="github_enabled"
            label="Enable GitHub Integration"
            hint="Link items to GitHub issues"
            defaultChecked={Boolean(general.github_enabled)}
          />
          <Field label="GitHub Token" hint="Personal access token or GitHub App token with repo scope">
            <input
              name="github_token"
              type="password"
              defaultValue={String(general.github_token ?? '')}
              placeholder="ghp_..."
              className="input font-mono"
            />
          </Field>
          <SaveButton isPending={isPending} saved={saved} />
        </form>
      </section>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string
  label: string
  hint?: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            name={name}
            value="true"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className="sr-only peer"
          />
          <div className={`w-10 h-5 rounded-full border-2 transition-colors ${checked ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground/30'}`}>
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>
        <span className="text-sm font-medium">{label}</span>
      </label>
      {hint && <p className="text-xs text-muted-foreground ml-12">{hint}</p>}
    </div>
  )
}

function SaveButton({ isPending, saved }: { isPending: boolean; saved: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          'Save Settings'
        )}
      </button>
      {saved && (
        <span className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" /> Saved
        </span>
      )}
    </div>
  )
}
