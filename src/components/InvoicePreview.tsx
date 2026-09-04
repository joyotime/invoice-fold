import type { CSSProperties } from 'react'
import { Building2, Mail, MapPin } from 'lucide-react'
import type { InvoiceData, InvoiceTheme } from '../types/invoice'

interface InvoicePreviewProps {
  invoiceData: InvoiceData
  isPro: boolean
}

const themeColors: Record<InvoiceTheme, string> = {
  classic: '#0f172a',
  blue: '#0369a1',
  green: '#059669',
  purple: '#7c3aed',
}

function toFiniteNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function formatMoney(value: number, symbol: string) {
  return `${symbol || '$'}${toFiniteNumber(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value: string) {
  if (!value) return '—'

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getInitials(name: string) {
  const compactName = name.trim().replace(/\s+/g, '')
  return compactName.slice(0, 2).toUpperCase() || 'IN'
}

export function InvoicePreview({ invoiceData, isPro }: InvoicePreviewProps) {
  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + toFiniteNumber(item.amount),
    0,
  )
  const taxAmount = subtotal * (toFiniteNumber(invoiceData.taxRate) / 100)
  const discount = toFiniteNumber(invoiceData.discount)
  const total = Math.max(0, subtotal + taxAmount - discount)
  const invoiceStyle = {
    '--invoice-accent': isPro
      ? (themeColors[invoiceData.theme] ?? themeColors.classic)
      : themeColors.classic,
  } as CSSProperties

  return (
    <article
      id="invoice-preview"
      data-invoice-preview
      style={invoiceStyle}
      className="invoice-paper relative flex min-h-[297mm] w-[210mm] shrink-0 flex-col overflow-hidden bg-white px-[15mm] py-[14mm] text-left text-slate-700 shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
      aria-label="Live invoice preview"
    >
      <div className="absolute inset-x-0 top-0 h-2 bg-[var(--invoice-accent)]" />

      <header className="flex items-start justify-between gap-10 border-b border-slate-200 pb-10">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--invoice-accent)] text-lg font-black tracking-tight text-white">
            <span>{getInitials(invoiceData.seller.name)}</span>
            {invoiceData.seller.logoUrl && (
              <img
                key={invoiceData.seller.logoUrl}
                src={invoiceData.seller.logoUrl}
                alt={`${invoiceData.seller.name || 'Seller'} Logo`}
                className="absolute inset-0 size-full bg-white object-contain p-1"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--invoice-accent)]">
              Issued by
            </p>
            <h2 className="mt-2 break-words text-xl font-black leading-tight text-slate-950">
              {invoiceData.seller.name || 'Your Business'}
            </h2>
            <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-slate-500">
              {invoiceData.seller.email && (
                <p className="flex items-start gap-2">
                  <Mail size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="break-all">{invoiceData.seller.email}</span>
                </p>
              )}
              {invoiceData.seller.address && (
                <p className="flex items-start gap-2">
                  <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-pre-line">{invoiceData.seller.address}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--invoice-accent)]">
            Invoice
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-[-0.06em] text-slate-950">
            Invoice
          </h1>
          <p className="mt-4 font-mono text-xs font-semibold text-slate-500">
            #{invoiceData.invoiceNumber || 'DRAFT'}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-[1.15fr_0.85fr] gap-12 py-9">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Bill To
          </p>
          <h3 className="mt-3 text-lg font-extrabold text-slate-950">
            {invoiceData.buyer.name || 'Client Name'}
          </h3>
          <div className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-500">
            {invoiceData.buyer.email && <p className="break-all">{invoiceData.buyer.email}</p>}
            <p className="whitespace-pre-line">
              {invoiceData.buyer.address || 'Billing Address'}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 content-start gap-x-5 gap-y-4 rounded-2xl bg-slate-50 p-5">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Date</dt>
            <dd className="mt-1 text-xs font-bold text-slate-800">{formatDate(invoiceData.issueDate)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date</dt>
            <dd className="mt-1 text-xs font-bold text-slate-800">{formatDate(invoiceData.dueDate)}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Line items">
        <table className="w-full table-fixed border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--invoice-accent)] text-white">
              <th className="w-[48%] rounded-l-xl px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">Item Description</th>
              <th className="w-[12%] px-2 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider">Quantity</th>
              <th className="w-[20%] px-2 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider">Rate</th>
              <th className="w-[20%] rounded-r-xl px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={item.id} className="border-b border-slate-100 align-top">
                <td className="break-words px-4 py-4 font-semibold leading-relaxed text-slate-800">
                  {item.name || `Untitled item ${index + 1}`}
                </td>
                <td className="px-2 py-4 text-center text-slate-500">
                  {toFiniteNumber(item.quantity)}
                </td>
                <td className="px-2 py-4 text-right tabular-nums text-slate-500">
                  {formatMoney(item.unitPrice, invoiceData.currencySymbol)}
                </td>
                <td className="px-4 py-4 text-right font-bold tabular-nums text-slate-900">
                  {formatMoney(item.amount, invoiceData.currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid grid-cols-[1fr_260px] gap-12">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Notes</p>
          <p className="mt-3 whitespace-pre-line text-xs leading-6 text-slate-500">
            {invoiceData.notes || 'Thank you for your business.'}
          </p>
        </div>

        <dl className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <dt>Subtotal</dt>
            <dd className="font-semibold tabular-nums text-slate-800">
              {formatMoney(subtotal, invoiceData.currencySymbol)}
            </dd>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <dt>Tax ({toFiniteNumber(invoiceData.taxRate)}%)</dt>
            <dd className="font-semibold tabular-nums text-slate-800">
              {formatMoney(taxAmount, invoiceData.currencySymbol)}
            </dd>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <dt>Discount</dt>
            <dd className="font-semibold tabular-nums text-emerald-700">
              − {formatMoney(discount, invoiceData.currencySymbol)}
            </dd>
          </div>
          <div className="mt-4 flex items-end justify-between border-t-2 border-[var(--invoice-accent)] pt-4">
            <dt className="font-bold text-slate-900">Total Due</dt>
            <dd className="text-xl font-black tracking-tight tabular-nums text-slate-950">
              {formatMoney(total, invoiceData.currencySymbol)}
            </dd>
          </div>
        </dl>
      </section>

      {!isPro && (
        <div
          data-free-watermark
          className="pointer-events-none absolute bottom-[5mm] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-100/90 px-2 py-1 text-[8px] font-bold tracking-wide text-slate-400"
          aria-hidden="true"
        >
          Created with Free Invoice Fold (invoice-fold.vercel.app)
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Building2 size={12} aria-hidden="true" />
          {invoiceData.seller.name || 'Invoice Fold'}
        </span>
        <span>Thank you for your business</span>
      </footer>
    </article>
  )
}
