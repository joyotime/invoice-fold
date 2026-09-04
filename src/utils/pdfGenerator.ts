import type { InvoiceData } from '../types/invoice'
import { getStoredLicenseStatus } from './license'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const PREVIEW_SELECTOR = '[data-invoice-preview]'
const FREE_WATERMARK = 'Created with Free Invoice Fold (invoice-fold.vercel.app)'

function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img'))

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve()
            return
          }

          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
}

function createFilename(invoiceNumber: string) {
  const safeNumber = invoiceNumber.trim().replace(/[^a-zA-Z0-9-_]/g, '-')
  return `invoice-${safeNumber || 'draft'}.pdf`
}

/**
 * Captures the invoice preview and downloads it as an A4 PDF.
 * Everything runs in the current browser; no invoice data is uploaded.
 */
export async function exportInvoiceToPDF(invoiceData: InvoiceData) {
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available in a browser.')
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const preview = document.querySelector<HTMLElement>(PREVIEW_SELECTOR)

  if (!preview) {
    throw new Error('Invoice preview element was not found.')
  }

  const isPro = getStoredLicenseStatus()

  await document.fonts?.ready
  await waitForImages(preview)

  preview.dataset.exporting = 'true'

  try {
    const canvas = await html2canvas(preview, {
      backgroundColor: '#ffffff',
      scale: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: -window.scrollY,
    })

    if (!canvas.width || !canvas.height) {
      throw new Error('Invoice preview could not be rendered.')
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageHeightInPixels = Math.ceil(
      canvas.width * (A4_HEIGHT_MM / A4_WIDTH_MM),
    )
    let sourceY = 0
    let pageIndex = 0

    while (sourceY < canvas.height) {
      const sliceHeight = Math.min(
        pageHeightInPixels,
        canvas.height - sourceY,
      )
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sliceHeight

      const context = pageCanvas.getContext('2d')
      if (!context) {
        throw new Error('PDF page canvas could not be created.')
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      )

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait')
      }

      const renderedHeight =
        (sliceHeight / pageCanvas.width) * A4_WIDTH_MM

      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        A4_WIDTH_MM,
        renderedHeight,
        undefined,
        'FAST',
      )

      if (!isPro) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(170, 178, 190)
        pdf.text(
          FREE_WATERMARK,
          A4_WIDTH_MM / 2,
          A4_HEIGHT_MM - 5,
          { align: 'center' },
        )
      }

      sourceY += sliceHeight
      pageIndex += 1
    }

    pdf.save(createFilename(invoiceData.invoiceNumber))
  } finally {
    delete preview.dataset.exporting
  }
}
