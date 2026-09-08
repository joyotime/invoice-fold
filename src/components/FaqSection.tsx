import { ChevronDown, ShieldCheck } from 'lucide-react'

const faqs = [
  {
    question: 'Is Invoice Fold completely free to use?',
    answer:
      'Yes, Invoice Fold offers a free version with all basic invoicing features and instant PDF exports.',
  },
  {
    question: 'How does Invoice Fold protect my business data?',
    answer:
      'Invoice Fold operates 100% client-side inside your web browser. None of your invoice figures, client names, or financial details are ever transmitted or saved on external servers.',
  },
  {
    question: 'Can I customize invoices with my own business logo?',
    answer:
      'Yes, upgrading to Invoice Fold PRO unlocks custom logo uploads, premium color schemes, and removes the default watermark.',
  },
] as const

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
}

export function FaqSection() {
  return (
    <>
      <section
        className="no-print mx-auto mt-12 max-w-4xl border-t border-slate-200 pt-9"
        aria-labelledby="faq-heading"
      >
        <div className="mb-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            <ShieldCheck size={13} aria-hidden="true" />
            Private by design
          </span>
          <h2 id="faq-heading" className="mt-3 text-xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white/75 shadow-sm transition hover:border-slate-300 open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100 sm:px-5 [&::-webkit-details-marker]:hidden">
                <span>{question}</span>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-slate-100 px-4 py-3.5 sm:px-5">
                <p className="text-sm leading-6 text-slate-600">{answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
