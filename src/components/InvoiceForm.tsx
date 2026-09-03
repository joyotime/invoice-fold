import { useState } from 'react'
import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import {
  Building2,
  CalendarDays,
  CirclePlus,
  Crown,
  FileText,
  ImagePlus,
  Lock,
  PackageOpen,
  Percent,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import type {
  BuyerInfo,
  InvoiceData,
  InvoiceItem,
  InvoiceTheme,
  SellerInfo,
} from '../types/invoice'

interface InvoiceFormProps {
  invoiceData: InvoiceData
  isPro: boolean
  onChange: (invoiceData: InvoiceData) => void
  onRequestUpgrade: () => void
}

interface SectionProps {
  title: string
  icon: ReactNode
  children: ReactNode
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

const currencies = [
  { code: 'CNY', symbol: '¥', label: 'CNY — 人民币' },
  { code: 'USD', symbol: '$', label: 'USD — 美元' },
  { code: 'EUR', symbol: '€', label: 'EUR — 欧元' },
  { code: 'GBP', symbol: '£', label: 'GBP — 英镑' },
  { code: 'SGD', symbol: 'S$', label: 'SGD — 新加坡元' },
]
const themeOptions: Array<{
  id: InvoiceTheme
  label: string
  color: string
}> = [
  { id: 'classic', label: '黑色经典', color: 'bg-slate-950' },
  { id: 'blue', label: '经典蓝', color: 'bg-sky-700' },
  { id: 'green', label: '现代绿', color: 'bg-emerald-600' },
  { id: 'purple', label: '高级紫', color: 'bg-violet-600' },
]

const inputClassName =
  'mt-1.5 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50'

function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="border-b border-slate-200 px-5 py-6 last:border-b-0 sm:px-6">
      <div className="mb-4 flex items-center gap-2 text-slate-900">
        <span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-sky-700">
          {icon}
        </span>
        <h2 className="text-sm font-bold tracking-wide">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({ label, id, className = '', ...props }: FieldProps) {
  return (
    <label htmlFor={id} className={`block min-w-0 text-xs font-semibold text-slate-600 ${className}`}>
      {label}
      <input id={id} className={inputClassName} {...props} />
    </label>
  )
}

function TextareaField({
  label,
  id,
  className = '',
  ...props
}: TextareaFieldProps) {
  return (
    <label htmlFor={id} className={`block min-w-0 text-xs font-semibold text-slate-600 ${className}`}>
      {label}
      <textarea id={id} className={`${inputClassName} min-h-28 resize-y`} {...props} />
    </label>
  )
}

function parseNumber(value: string) {
  const result = Number(value)
  return Number.isFinite(result) ? Math.max(0, result) : 0
}

function createItem(): InvoiceItem {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}`,
    name: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  }
}

export function InvoiceForm({
  invoiceData,
  isPro,
  onChange,
  onRequestUpgrade,
}: InvoiceFormProps) {
  const [logoError, setLogoError] = useState<string | null>(null)

  const updateField = <Key extends keyof InvoiceData>(
    key: Key,
    value: InvoiceData[Key],
  ) => {
    onChange({ ...invoiceData, [key]: value })
  }

  const updateSeller = <Key extends keyof SellerInfo>(
    key: Key,
    value: SellerInfo[Key],
  ) => {
    onChange({
      ...invoiceData,
      seller: { ...invoiceData.seller, [key]: value },
    })
  }

  const updateBuyer = <Key extends keyof BuyerInfo>(
    key: Key,
    value: BuyerInfo[Key],
  ) => {
    onChange({
      ...invoiceData,
      buyer: { ...invoiceData.buyer, [key]: value },
    })
  }

  const updateItem = <Key extends keyof InvoiceItem>(
    itemId: string,
    key: Key,
    value: InvoiceItem[Key],
  ) => {
    const items = invoiceData.items.map((item) => {
      if (item.id !== itemId) return item

      const updatedItem = { ...item, [key]: value }
      if (key === 'quantity' || key === 'unitPrice') {
        updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice
      }
      return updatedItem
    })

    updateField('items', items)
  }

  const removeItem = (itemId: string) => {
    if (invoiceData.items.length === 1) return
    updateField(
      'items',
      invoiceData.items.filter((item) => item.id !== itemId),
    )
  }

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setLogoError('仅支持 PNG、JPG 或 WebP 图片。')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setLogoError('Logo 文件不能超过 3 MB。')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        updateSeller('logoUrl', reader.result)
        setLogoError(null)
      }
    })
    reader.addEventListener('error', () => {
      setLogoError('无法读取该图片，请重新选择。')
    })
    reader.readAsDataURL(file)
  }

  return (
    <form
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <Section title="发票信息" icon={<CalendarDays size={17} aria-hidden="true" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="invoice-number"
            label="发票编号"
            value={invoiceData.invoiceNumber}
            onChange={(event) => updateField('invoiceNumber', event.target.value)}
            placeholder="INV-2026-001"
          />

          <div className="text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="invoice-currency">币种</label>
              {!isPro && (
                <button
                  type="button"
                  onClick={onRequestUpgrade}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800"
                >
                  <Lock size={11} aria-hidden="true" />
                  Pro
                </button>
              )}
            </div>
            {isPro ? (
              <select
                id="invoice-currency"
                value={invoiceData.currencySymbol}
                onChange={(event) => updateField('currencySymbol', event.target.value)}
                className={inputClassName}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.symbol}>
                    {currency.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                id="invoice-currency"
                type="button"
                onClick={onRequestUpgrade}
                className={`${inputClassName} flex items-center justify-between text-left text-slate-500`}
              >
                <span>CNY — 人民币</span>
                <Crown size={15} className="text-amber-500" aria-hidden="true" />
              </button>
            )}
          </div>

          <Field
            id="issue-date"
            label="开票日期"
            type="date"
            value={invoiceData.issueDate}
            onChange={(event) => updateField('issueDate', event.target.value)}
          />
          <Field
            id="due-date"
            label="付款截止日"
            type="date"
            value={invoiceData.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
          />
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">发票主题颜色</span>
              {!isPro && (
                <button
                  type="button"
                  onClick={onRequestUpgrade}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800"
                >
                  <Lock size={11} aria-hidden="true" />
                  Pro 主题
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {themeOptions.map((theme) => {
                const isLocked = !isPro && theme.id !== 'classic'
                const isSelected = invoiceData.theme === theme.id

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() =>
                      isLocked
                        ? onRequestUpgrade()
                        : updateField('theme', theme.id)
                    }
                    className={`group relative flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11px] font-bold transition ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                    aria-pressed={isSelected}
                    title={isLocked ? '升级 Pro 解锁更多发票主题' : theme.label}
                  >
                    <span className={`size-3 shrink-0 rounded-full ${theme.color}`} />
                    <span className="truncate">{theme.label}</span>
                    {isLocked && (
                      <Lock
                        size={11}
                        className="ml-auto shrink-0 text-amber-500 opacity-70 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section title="收款方 / Seller" icon={<Building2 size={17} aria-hidden="true" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="seller-name"
            label="公司名称"
            value={invoiceData.seller.name}
            onChange={(event) => updateSeller('name', event.target.value)}
            placeholder="星河创意工作室"
          />
          <Field
            id="seller-email"
            label="Email"
            type="email"
            value={invoiceData.seller.email}
            onChange={(event) => updateSeller('email', event.target.value)}
            placeholder="hello@example.com"
          />
          <TextareaField
            id="seller-address"
            label="公司地址"
            className="sm:col-span-2"
            rows={2}
            value={invoiceData.seller.address}
            onChange={(event) => updateSeller('address', event.target.value)}
            placeholder="填写公司完整地址"
          />

          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">公司 Logo</span>
              <span className="text-[10px] text-slate-400">PNG / JPG / WebP · 最大 3 MB</span>
            </div>

            {isPro ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                {invoiceData.seller.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={invoiceData.seller.logoUrl}
                        alt="已上传的公司 Logo"
                        className="size-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">自定义 Logo 已启用</p>
                      <p className="mt-1 text-xs text-slate-500">图片仅保存在当前发票会话中。</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSeller('logoUrl', '')}
                      className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="移除公司 Logo"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 bg-white px-4 py-3 text-sm font-bold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50">
                    <ImagePlus size={17} aria-hidden="true" />
                    上传自定义 Logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
                {logoError && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{logoError}</p>}
              </div>
            ) : (
              <button
                type="button"
                onClick={onRequestUpgrade}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-left transition hover:border-amber-300 hover:bg-amber-50"
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-amber-500 shadow-sm transition group-hover:text-amber-600">
                    <Lock size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-800">升级 Pro 解锁上传公司 Logo</span>
                    <span className="mt-0.5 block text-xs text-slate-500">让发票显示您的品牌标识</span>
                  </span>
                </span>
                <Crown size={17} className="shrink-0 text-amber-500" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title="付款方 / Buyer" icon={<UserRound size={17} aria-hidden="true" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="buyer-name"
            label="客户名称"
            value={invoiceData.buyer.name}
            onChange={(event) => updateBuyer('name', event.target.value)}
            placeholder="客户或公司名称"
          />
          <Field
            id="buyer-email"
            label="Email"
            type="email"
            value={invoiceData.buyer.email}
            onChange={(event) => updateBuyer('email', event.target.value)}
            placeholder="client@example.com"
          />
          <TextareaField
            id="buyer-address"
            label="客户地址"
            className="sm:col-span-2"
            rows={2}
            value={invoiceData.buyer.address}
            onChange={(event) => updateBuyer('address', event.target.value)}
            placeholder="填写客户完整地址"
          />
        </div>
      </Section>

      <Section title="商品明细" icon={<PackageOpen size={17} aria-hidden="true" />}>
        <div className="space-y-3">
          {invoiceData.items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">明细 {index + 1}</span>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                  onClick={() => removeItem(item.id)}
                  disabled={invoiceData.items.length === 1}
                  aria-label={`删除明细 ${index + 1}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,40fr)_minmax(64px,15fr)_minmax(92px,22fr)_minmax(100px,23fr)]">
                <Field
                  id={`item-name-${item.id}`}
                  label="名称"
                  className="col-span-2 min-w-0 sm:col-span-1"
                  value={item.name}
                  onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                  placeholder="服务或商品名称"
                />
                <Field
                  id={`item-quantity-${item.id}`}
                  label="数量"
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(item.id, 'quantity', parseNumber(event.target.value))
                  }
                />
                <Field
                  id={`item-price-${item.id}`}
                  label="单价"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(event) =>
                    updateItem(item.id, 'unitPrice', parseNumber(event.target.value))
                  }
                />
                <Field
                  id={`item-amount-${item.id}`}
                  label="金额"
                  type="number"
                  value={item.amount.toFixed(2)}
                  readOnly
                  className="min-w-0"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 px-4 py-3 text-sm font-bold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
            onClick={() => updateField('items', [...invoiceData.items, createItem()])}
          >
            <CirclePlus size={17} aria-hidden="true" />
            添加明细
          </button>
        </div>
      </Section>

      <Section title="金额调整" icon={<Percent size={17} aria-hidden="true" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="tax-rate"
            label="税率（%）"
            type="number"
            min="0"
            step="0.01"
            value={invoiceData.taxRate}
            onChange={(event) => updateField('taxRate', parseNumber(event.target.value))}
          />
          <Field
            id="discount"
            label="折扣金额"
            type="number"
            min="0"
            step="0.01"
            value={invoiceData.discount}
            onChange={(event) => updateField('discount', parseNumber(event.target.value))}
          />
        </div>
      </Section>

      <Section title="备注" icon={<FileText size={17} aria-hidden="true" />}>
        <TextareaField
          id="notes"
          label="付款说明或其他备注"
          value={invoiceData.notes}
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="感谢您的合作。"
        />
      </Section>
    </form>
  )
}
