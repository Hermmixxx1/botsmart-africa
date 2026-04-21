import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Botsmart Africa',
  description: 'Learn about Botsmart Africa shipping policies, delivery times, and coverage across 12 Southern African countries.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Shipping Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Fast and reliable delivery across Southern Africa
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Coverage Map */}
          <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/20 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              We Ship Across Southern Africa
            </h2>
            <p className="text-muted-foreground mb-6">
              We partner with verified sellers across 12 Southern African countries to bring you quality products with reliable delivery.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { code: 'ZA', name: 'South Africa' },
                { code: 'NA', name: 'Namibia' },
                { code: 'BW', name: 'Botswana' },
                { code: 'ZW', name: 'Zimbabwe' },
                { code: 'MZ', name: 'Mozambique' },
                { code: 'LS', name: 'Lesotho' },
                { code: 'SZ', name: 'Eswatini' },
                { code: 'AO', name: 'Angola' },
                { code: 'ZM', name: 'Zambia' },
                { code: 'MW', name: 'Malawi' },
                { code: 'MG', name: 'Madagascar' },
                { code: 'TZ', name: 'Tanzania' },
              ].map((country) => (
                <div key={country.code} className="bg-card border rounded-lg px-3 py-2 text-center">
                  <span className="text-xs text-muted-foreground">{country.code}</span>
                  <p className="font-medium text-sm">{country.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Times */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Estimated Delivery Times
            </h2>
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold">Region</th>
                    <th className="text-left px-6 py-4 font-semibold">Countries</th>
                    <th className="text-left px-6 py-4 font-semibold">Delivery Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Local
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">South Africa</td>
                    <td className="px-6 py-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">3-5 Business Days</span></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Neighboring
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">Namibia, Botswana, Lesotho, Eswatini</td>
                    <td className="px-6 py-4"><span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">5-7 Business Days</span></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        Regional
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">Zimbabwe, Mozambique, Zambia, Malawi</td>
                    <td className="px-6 py-4"><span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">7-10 Business Days</span></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                        Extended
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">Angola, Madagascar, Tanzania</td>
                    <td className="px-6 py-4"><span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">10-14 Business Days</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border rounded-xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Shipping Costs</h3>
              <p className="text-muted-foreground text-sm">
                Costs vary based on product weight, dimensions, seller location, and destination. Exact shipping is calculated at checkout before payment.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Order Processing</h3>
              <p className="text-muted-foreground text-sm">
                Sellers typically process orders within 1-2 business days. You will receive tracking information via email once shipped.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Your Order</h3>
              <p className="text-muted-foreground text-sm">
                Monitor your delivery status in your Botsmart Africa account under &quot;My Orders&quot; with real-time tracking updates.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Shipping Restrictions</h3>
              <p className="text-muted-foreground text-sm">
                Some products may have restrictions based on local regulations. Any limitations are clearly noted on the product page.
              </p>
            </div>
          </div>

          {/* Contact Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Questions About Your Shipment?</h3>
            <p className="text-muted-foreground mb-4">Our support team is ready to help with any delivery concerns.</p>
            <a href="mailto:support@botsmart.africa" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
