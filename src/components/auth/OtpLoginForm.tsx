'use client'

import { useState, useTransition } from 'react'
import { sendOtp, verifyOtp } from '@/app/actions/auth'
import { Mail, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'

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
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function handleResend() {
    setToken('')
    setError(null)
    startTransition(async () => {
      await sendOtp(email)
    })
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* OTP input */}
        <div className="space-y-2">
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
            className="w-full rounded-xl border bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || token.length < 6}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
          ) : (
            <>Verify code <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <RotateCcw className="h-3 w-3" />
            Resend code
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setToken(''); setError(null) }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Use a different email
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a one-time code
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
          <p className="text-sm text-destructive text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !email}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending code...</>
        ) : (
          <>Continue <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  )
}
