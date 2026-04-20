'use client'

import { useState, useTransition } from 'react'
import { sendOtp, verifyOtp } from '@/app/actions/auth'
import { Map, Mail, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'

export function OtpLoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await sendOtp(email)
      if (result?.error) {
        setError(result.error)
        return
      }
      setStep('otp')
    })
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await verifyOtp(email, token)
      if (result?.error) setError(result.error)
    })
  }

  function handleResend() {
    setToken('')
    setError(null)
    startTransition(async () => { await sendOtp(email) })
  }

  // ── Email step ──────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="p-8 space-y-6">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-md">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Roadmap</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your email to sign in
            </p>
          </div>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !email}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending code...</>
              : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          No password required. A code will be emailed to you.
        </p>
      </div>
    )
  }

  // ── OTP step ───────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6">
      {/* Branding */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={token}
          onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          autoFocus
          required
          className="w-full rounded-lg border bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || token.length < 6}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
            : <>Verify code <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Resend code
        </button>
        <button
          type="button"
          onClick={() => { setStep('email'); setToken(''); setError(null) }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Use a different email
        </button>
      </div>
    </div>
  )
}
