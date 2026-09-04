import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  BadgeCheck,
  Check,
  ExternalLink,
  KeyRound,
  ShoppingBag,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { activateLicenseKey } from '../utils/license'

interface LicenseModalProps {
  isOpen: boolean
  isActive: boolean
  onClose: () => void
  onActivated: () => void
}

const proFeatures = [
  'Remove "Free Version" PDF Watermark',
  'Upload Custom Business Logo',
  'Unlock Premium Color Themes',
  'Multi-Currency Support (USD, EUR, GBP, SGD, JPY, etc.)',
  'Export & Import Invoice Data (Local Backup)',
]

export function LicenseModal({
  isOpen,
  isActive,
  onClose,
  onActivated,
}: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetAndClose = useCallback(() => {
    if (isSubmitting) return
    setLicenseKey('')
    setMessage(null)
    setIsSuccess(false)
    onClose()
  }, [isSubmitting, onClose])

  useEffect(() => {
    if (!isOpen) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') resetAndClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => inputRef.current?.focus(), 50)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previousActiveElement?.focus()
    }
  }, [isOpen, isSubmitting, resetAndClose])

  if (!isOpen) return null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!licenseKey.trim() || isSubmitting) return

    setIsSubmitting(true)
    setMessage(null)

    const result = await activateLicenseKey(licenseKey)
    setIsSubmitting(false)
    setMessage(result.message)
    setIsSuccess(result.success)

    if (result.success) onActivated()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-sm"
        onClick={resetAndClose}
        aria-label="Close license dialog"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="license-modal-title"
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
      >
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 pb-7 pt-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-sky-400/15 text-sky-300 ring-1 ring-inset ring-sky-300/20">
              <Sparkles size={21} aria-hidden="true" />
            </span>
            <button
              type="button"
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:opacity-50"
              aria-label="Close"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Invoice Fold PRO</p>
          <h2 id="license-modal-title" className="mt-2 text-2xl font-black tracking-tight">
            {isActive || isSuccess ? 'Invoice Fold PRO is Active' : 'Upgrade to Invoice Fold PRO'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {isActive || isSuccess
              ? 'PRO features are unlocked in this browser.'
              : 'Unlock every premium feature with a one-time purchase.'}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <ul className="grid gap-2.5 text-sm text-slate-600">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {isActive || isSuccess ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <div className="flex items-center gap-2">
                <BadgeCheck size={19} aria-hidden="true" />
                {message || 'Your License Key is active and saved in this browser.'}
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                Continue with PRO
              </button>
            </div>
          ) : (
            <form className="mt-6" onSubmit={handleSubmit}>
              <div className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5">
                <p className="text-center text-xs font-semibold leading-5 text-amber-900">
                  No License Key yet? Purchase securely through Lemon Squeezy.
                </p>
                <a
                  href="https://docufold.lemonsqueezy.com/checkout/buy/4361ac97-1078-4162-8cc7-c7f7d42601cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-amber-200 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
                >
                  <ShoppingBag size={17} aria-hidden="true" />
                  Get Lifetime Access - $9.99
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>

              <label htmlFor="license-key" className="block text-xs font-bold text-slate-700">
                License Key
                <span className="relative mt-2 block">
                  <KeyRound
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    id="license-key"
                    type="text"
                    value={licenseKey}
                    onChange={(event) => setLicenseKey(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder="Enter your Lemon Squeezy License Key"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={isSubmitting}
                    aria-describedby={message ? 'license-message' : undefined}
                  />
                </span>
              </label>

              {message && (
                <p id="license-message" role="alert" className="mt-3 text-sm font-semibold text-rose-600">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={!licenseKey.trim() || isSubmitting}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
                ) : (
                  <ShieldCheck size={17} aria-hidden="true" />
                )}
                {isSubmitting ? 'Verifying…' : 'Activate License'}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
            License activation is securely verified by Lemon Squeezy. Your status is stored only in this browser.
          </p>
        </div>
      </section>
    </div>
  )
}
