import { useEffect, useState } from 'react'
import {
  Crown,
  Download,
  FileCheck2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ReceiptText,
} from 'lucide-react'
import { FaqSection } from './components/FaqSection'
import { InvoiceForm } from './components/InvoiceForm'
import { InvoicePreview } from './components/InvoicePreview'
import { LicenseModal } from './components/LicenseModal'
import type { InvoiceData } from './types/invoice'
import { getStoredLicenseStatus, storeLicenseStatus } from './utils/license'
import { exportInvoiceToPDF } from './utils/pdfGenerator'

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createInitialInvoice(): InvoiceData {
  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(issueDate.getDate() + 14)

  return {
    invoiceNumber: `INV-${issueDate.getFullYear()}-001`,
    issueDate: toDateInputValue(issueDate),
    dueDate: toDateInputValue(dueDate),
    seller: {
      name: 'Northstar Creative Studio',
      email: 'hello@northstar.studio',
      address: '250 Market Street\nSan Francisco, CA 94105',
      logoUrl: '',
    },
    buyer: {
      name: 'Acme Technologies Inc.',
      email: 'billing@acmetech.com',
      address: '500 Fifth Avenue\nNew York, NY 10110',
    },
    items: [
      {
        id: 'starter-item-1',
        name: 'Brand identity and web design',
        quantity: 1,
        unitPrice: 12800,
        amount: 12800,
      },
      {
        id: 'starter-item-2',
        name: 'Frontend development and delivery',
        quantity: 2,
        unitPrice: 4800,
        amount: 9600,
      },
    ],
    taxRate: 6,
    discount: 800,
    currencySymbol: '$',
    theme: 'classic',
    notes: 'Please include the invoice number with your payment. Thank you for your business.',
  }
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error'

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(createInitialInvoice)
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [isPro, setIsPro] = useState(getStoredLicenseStatus)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)

  useEffect(() => {
    storeLicenseStatus(isPro)
  }, [isPro])

  const handleInvoiceChange = (nextInvoice: InvoiceData) => {
    setInvoiceData(nextInvoice)
    if (exportStatus !== 'exporting') setExportStatus('idle')
  }

  const handleExport = async () => {
    setExportStatus('exporting')

    try {
      await exportInvoiceToPDF(invoiceData)
      setExportStatus('success')
    } catch (error) {
      console.error('Invoice PDF export failed:', error)
      setExportStatus('error')
    }
  }

  const isExporting = exportStatus === 'exporting'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-300">
              <ReceiptText size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                  Invoice Fold
                </h1>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    isPro
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isPro ? 'Pro' : 'Free'}
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">
                100% Client-Side &amp; Privacy-First Invoice Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsLicenseModalOpen(true)}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 sm:px-4 ${
                isPro
                  ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus-visible:ring-amber-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 focus-visible:ring-sky-100'
              }`}
            >
              {isPro ? <Crown size={17} aria-hidden="true" /> : <KeyRound size={17} aria-hidden="true" />}
              <span className="hidden lg:inline">
                {isPro ? 'PRO Active' : 'Upgrade to PRO / Enter License Key'}
              </span>
              <span className="lg:hidden">{isPro ? 'PRO' : 'Upgrade'}</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-wait disabled:opacity-70 sm:px-4"
            >
              {isExporting ? (
                <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
              ) : (
                <Download size={17} aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{isExporting ? 'Exporting…' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
        <div className="border-t border-emerald-100 bg-emerald-50/90 px-4 py-2 text-center text-xs font-bold text-emerald-800 sm:px-6">
          <span aria-hidden="true">🔒</span>{' '}
          100% Private: All data stays in your browser
        </div>
      </header>

      <main className="mx-auto max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="no-print mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Create & export</p>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800 transition hover:bg-amber-200"
                >
                  Free Plan
                </button>
              )}
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Create a polished, professional invoice
            </h2>
          </div>
          <div className="min-h-5 text-sm" aria-live="polite">
            {exportStatus === 'success' && (
              <p className="flex items-center gap-2 font-semibold text-emerald-700">
                <FileCheck2 size={16} aria-hidden="true" />
                Your PDF has been saved to Downloads
              </p>
            )}
            {exportStatus === 'error' && (
              <p className="font-semibold text-rose-700">Export failed. Please try again.</p>
            )}
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[520px_minmax(0,1fr)]">
          <div className="no-print min-w-0 xl:sticky xl:top-[92px] xl:max-h-[calc(100vh-116px)] xl:overflow-y-auto xl:pr-1">
            <InvoiceForm
              invoiceData={invoiceData}
              isPro={isPro}
              onChange={handleInvoiceChange}
              onRequestUpgrade={() => setIsLicenseModalOpen(true)}
            />
          </div>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200/70">
            <div className="no-print flex items-center justify-between gap-3 border-b border-slate-300/70 bg-white/70 px-4 py-3 text-xs text-slate-500 backdrop-blur sm:px-5">
              <span className="font-bold text-slate-700">Live Preview</span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">A4 · 210 × 297 mm</span>
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wide transition focus-visible:outline-none focus-visible:ring-4 ${
                    isPro
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-100'
                      : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-100'
                  }`}
                  aria-label={isPro ? 'View PRO license status' : 'Open PRO activation window'}
                >
                  {isPro ? (
                    <Crown size={12} aria-hidden="true" />
                  ) : (
                    <LockKeyhole size={12} aria-hidden="true" />
                  )}
                  {isPro ? 'PRO Active' : 'FREE Preview'}
                </button>
              </div>
            </div>
            <div className="preview-scroll overflow-x-auto p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-max">
                <InvoicePreview invoiceData={invoiceData} isPro={isPro} />
              </div>
            </div>
          </section>
        </div>

        <FaqSection />
      </main>

      <footer className="no-print border-t border-slate-200 bg-white/80 px-4 py-5 text-center sm:px-6">
        <p className="mx-auto inline-flex max-w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold leading-5 text-emerald-800">
          🔒 100% Private &amp; Client-Side | Built for Freelancers &amp; Independent Creators Worldwide
        </p>
      </footer>

      <LicenseModal
        isOpen={isLicenseModalOpen}
        isActive={isPro}
        onClose={() => setIsLicenseModalOpen(false)}
        onActivated={() => setIsPro(true)}
      />
    </div>
  )
}

export default App
