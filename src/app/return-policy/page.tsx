import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy | Botsmart Africa',
  description: 'Understand Botsmart Africa return policy, eligibility criteria, refund process, and how to return products.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Return Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Hassle-free returns within 14 days of delivery
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Return Eligibility */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Return Eligibility
              </h2>
              <p className="text-lg mb-4">
                You may return items within <strong className="text-green-600 dark:text-green-400">14 days</strong> of delivery if:
              </p>
              <ul className="space-y-3">
                {[
                  'Item is unused, unworn, and in original packaging',
                  'All original tags and labels are attached',
                  'Item matches the description on the website',
                  'Proof of purchase is available',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Non-Returnable */}
          <div className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </span>
              Non-Returnable Items
            </h2>
            <p className="text-muted-foreground mb-4">The following items cannot be returned:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Personalized or custom-made items',
                'Intimate apparel and swimwear',
                'Perishable goods',
                'Items marked as "Final Sale"',
                'Products with broken hygiene seals',
                'Opened software or digital content',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Return Process */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              How to Return an Item
            </h2>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block"></div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Log Into Your Account', desc: 'Go to your Botsmart Africa account dashboard' },
                  { step: '2', title: 'Select the Item', desc: 'Navigate to "My Orders" and choose the item to return' },
                  { step: '3', title: 'Request Return', desc: 'Click "Request Return" and select a reason from the options' },
                  { step: '4', title: 'Ship It Back', desc: 'Pack the item securely and ship using the provided label' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                    <div className="bg-card border rounded-xl p-5 flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Refunds Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Refund Timeline</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Once we receive and inspect your return, refunds are processed within <strong>5-7 business days</strong>.
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">5-7 days after inspection</p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Refund Method</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Refunds are credited to your <strong>original payment method</strong> - credit card, debit card, or your Botsmart Africa wallet.
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Note: Shipping costs are non-refundable unless the return is due to our error.
              </p>
            </div>
          </div>

          {/* Damaged Items */}
          <div className="bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              Damaged or Defective Items
            </h2>
            <p className="text-muted-foreground mb-4">
              If you receive a damaged or defective item, we will make it right:
            </p>
            <ol className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">1</span>
                <span>Contact us within <strong>48 hours</strong> of delivery</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">2</span>
                <span>Provide photos of the damage or defect</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">3</span>
                <span>We will arrange <strong>free replacement</strong> or <strong>full refund</strong></span>
              </li>
            </ol>
            <a href="mailto:returns@botsmart.africa" className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              returns@botsmart.africa
            </a>
          </div>

          {/* Contact Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Need Help With a Return?</h3>
            <p className="text-muted-foreground mb-4">Our returns team is ready to assist you.</p>
            <a href="mailto:returns@botsmart.africa" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Start a Return
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
