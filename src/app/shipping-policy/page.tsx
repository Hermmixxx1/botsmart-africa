import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Botsmart Africa',
  description: 'Learn about Botsmart Africa shipping policies, delivery times, and coverage across 12 Southern African countries.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-center">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-center text-lg mb-8">
            At Botsmart Africa, we partner with verified sellers across Southern Africa to bring you quality products with reliable delivery options.
          </p>

          <h2>Shipping Coverage</h2>
          <p>We deliver to 12 Southern African countries:</p>
          <ul className="grid md:grid-cols-2 gap-2">
            <li>South Africa (ZA)</li>
            <li>Namibia (NA)</li>
            <li>Botswana (BW)</li>
            <li>Zimbabwe (ZW)</li>
            <li>Mozambique (MZ)</li>
            <li>Lesotho (LS)</li>
            <li>Eswatini (SZ)</li>
            <li>Angola (AO)</li>
            <li>Zambia (ZM)</li>
            <li>Malawi (MW)</li>
            <li>Madagascar (MG)</li>
            <li>Tanzania (TZ)</li>
          </ul>

          <h2>Estimated Delivery Times</h2>
          <div className="bg-muted/50 p-4 rounded-lg">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-2">Region</th>
                  <th className="text-left pb-2">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2">South Africa</td><td>3-5 business days</td></tr>
                <tr><td className="py-2">Neighboring countries (Namibia, Botswana, Lesotho, Eswatini)</td><td>5-7 business days</td></tr>
                <tr><td className="py-2">Regional (Zimbabwe, Mozambique, Zambia, Malawi)</td><td>7-10 business days</td></tr>
                <tr><td className="py-2">Extended (Angola, Madagascar, Tanzania)</td><td>10-14 business days</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Shipping Costs</h2>
          <p>Shipping costs vary by:</p>
          <ul>
            <li>Product weight and dimensions</li>
            <li>Seller location</li>
            <li>Destination country</li>
            <li>Shipping method selected</li>
          </ul>
          <p>Exact shipping costs are calculated at checkout based on your location and the seller&apos;s fulfillment options.</p>

          <h2>Order Processing</h2>
          <p>Orders are typically processed within <strong>1-2 business days</strong> by sellers. Once shipped, you will receive a tracking number via email to monitor your delivery.</p>

          <h2>Tracking Your Order</h2>
          <p>Track your order status in your Botsmart Africa account under <strong>&quot;My Orders&quot;</strong>. For any delivery issues, please contact our customer support team.</p>

          <h2>Shipping Restrictions</h2>
          <p>Some products may have shipping restrictions based on local regulations. Any restrictions will be clearly noted on the product page.</p>

          <div className="bg-muted/50 p-4 rounded-lg mt-8">
            <p>
              <strong>Questions about shipping?</strong>{' '}
              <a href="mailto:support@botsmart.africa" className="text-primary hover:underline">
                support@botsmart.africa
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
