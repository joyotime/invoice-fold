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
      name: '星河创意工作室',
      email: 'hello@stellar-studio.cn',
      address: '上海市静安区南京西路 1266 号\n恒隆广场 2 期 18 楼',
      logoUrl: '',
    },
    buyer: {
      name: '云端科技有限公司',
      email: 'finance@cloud-tech.cn',
      address: '北京市朝阳区望京东路 1 号\n摩托罗拉大厦 8 楼',
    },
    items: [
      {
        id: 'starter-item-1',
        name: '品牌视觉与网页设计服务',
        quantity: 1,
        unitPrice: 12800,
        amount: 12800,
      },
      {
        id: 'starter-item-2',
        name: '前端开发与交付',
        quantity: 2,
        unitPrice: 4800,
        amount: 9600,
      },
    ],
    taxRate: 6,
    discount: 800,
    currencySymbol: '¥',
    theme: 'classic',
    notes: '请在付款截止日前完成转账，并在备注中填写发票编号。感谢您的信任与合作。',
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
                <h1 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg">
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
              <p className="hidden text-xs text-slate-500 sm:block">纯前端发票生成器</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 xl:flex">
              <LockKeyhole size={13} aria-hidden="true" />
              发票数据仅在当前浏览器处理
            </div>
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
                {isPro ? 'Pro 已激活' : '升级为 Pro / 输入激活码'}
              </span>
              <span className="lg:hidden">{isPro ? 'Pro' : '升级 Pro'}</span>
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
              <span className="hidden sm:inline">{isExporting ? '正在生成…' : '导出 PDF'}</span>
            </button>
          </div>
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
                  Free plan
                </button>
              )}
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">制作一张清晰、专业的发票</h2>
          </div>
          <div className="min-h-5 text-sm" aria-live="polite">
            {exportStatus === 'success' && (
              <p className="flex items-center gap-2 font-semibold text-emerald-700">
                <FileCheck2 size={16} aria-hidden="true" />
                PDF 已保存到下载目录
              </p>
            )}
            {exportStatus === 'error' && (
              <p className="font-semibold text-rose-700">导出失败，请稍后重试。</p>
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
              <span className="font-bold text-slate-700">实时预览</span>
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
                  aria-label={isPro ? '查看 Pro 激活状态' : '打开 Pro 激活窗口'}
                >
                  {isPro ? (
                    <Crown size={12} aria-hidden="true" />
                  ) : (
                    <LockKeyhole size={12} aria-hidden="true" />
                  )}
                  {isPro ? 'PRO 已激活' : 'FREE 模式预览'}
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
      </main>

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
