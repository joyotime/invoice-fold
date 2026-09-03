export interface InvoiceParty {
  name: string
  email: string
  address: string
}

export interface SellerInfo extends InvoiceParty {
  logoUrl: string
}

export interface BuyerInfo extends InvoiceParty {}

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  amount: number
}

export type InvoiceTheme = 'classic' | 'blue' | 'green' | 'purple'

export interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  seller: SellerInfo
  buyer: BuyerInfo
  items: InvoiceItem[]
  taxRate: number
  discount: number
  currencySymbol: string
  theme: InvoiceTheme
  notes: string
}
