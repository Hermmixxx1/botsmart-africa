import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy | Botsmart Africa',
  description: 'Understand Botsmart Africa return policy, eligibility criteria, refund process, and how to return products.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-center">Return Policy</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-center text-lg mb-8">
            We want you to be completely satisfied with your purchase. Botsmart Africa offers a fair and transparent return process for all eligible items.
          </p>

          <h2>Return Eligibility</h2>
          <p>You may return items within <strong>14 days</strong> of delivery if:</p>
          <ul>
            <li>Item is unused, unworn, and in original packaging</li>
            <li>All original tags and labels are attached</li>
            <li>Item matches the description on the website</li>
            <li>Proof of purchase is available</li>
          </ul>

          <h2>Non-Returnable Items</h2>
          <p>The following items cannot be returned:</p>
          <ul>
            <li>Personalized or custom-made items</li>
            <li>Intimate apparel and swimwear</li>
            <li>Perishable goods</li>
            <li>Items marked as &quot;Final Sale&quot;</li>
            <li>Products with broken hygiene seals (cosmetics, headphones)</li>
          </ul>

          <h2>Return Process</h2>
          <ol className="bg-muted/50 p-4 rounded-lg">
            <li className="mb-2"><strong>Step 1:</strong> Log into your Botsmart Africa account</li>
            <li className="mb-2"><strong>Step 2:</strong> Go to &quot;My Orders&quot; and select the item you wish to return</li>
            <li className="mb-2"><strong>Step 3:</strong> Click &quot;Request Return&quot; and select a reason</li>
            <li className="mb-2"><strong>Step 4:</strong> Pack the item securely and ship it back</li>
          </ol>

          <h2>Refunds</h2>
          <p>Once we receive and inspect your return:</p>
          <ul>
            <li>Refunds are processed within <strong>5-7 business days</strong></li>
            <li>Original payment method will be credited</li>
            <li>Shipping costs are non-refundable (unless the return is due to our error)</li>
          </ul>

          <h2>Damaged or Defective Items</h2>
          <p>If you receive a damaged or defective item:</p>
          <ol>
            <li>Contact us within <strong>48 hours</strong> of delivery</li>
            <li>Provide photos of the damage/defect</li>
            <li>We will arrange a replacement or full refund at no extra cost</li>
          </ol>

          <div className="bg-muted/50 p-4 rounded-lg mt-8">
            <p>
              <strong>Questions about returns?</strong>{' '}
              <a href="mailto:returns@botsmart.africa" className="text-primary hover:underline">
                returns@botsmart.africa
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
