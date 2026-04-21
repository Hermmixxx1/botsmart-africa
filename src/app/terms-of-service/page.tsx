import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Botsmart Africa',
  description: 'Read the Botsmart Africa terms of service. Understand the rules and conditions for using our marketplace.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-center">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-center text-sm text-muted-foreground mb-8">
            <strong>Last updated: January 2025</strong>
          </p>

          <h2>Agreement to Terms</h2>
          <p>By accessing or using the Botsmart Africa platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.</p>

          <h2>Platform Overview</h2>
          <p>Botsmart Africa is a multi-vendor e-commerce marketplace operated by The Lebogang Group. We connect buyers with verified sellers across 12 Southern African countries, facilitating the sale of products and services.</p>

          <h2>User Accounts</h2>
          <p>To access certain features, you must create an account. You are responsible for:</p>
          <ul>
            <li>Maintaining accurate account information</li>
            <li>Protecting your login credentials</li>
            <li>All activities under your account</li>
            <li>Notifying us of unauthorized access immediately</li>
          </ul>

          <h2>Buyer Responsibilities</h2>
          <p>As a buyer, you agree to:</p>
          <ul>
            <li>Provide accurate shipping information</li>
            <li>Make payments promptly</li>
            <li>Not engage in fraudulent transactions</li>
            <li>Respect seller policies and return procedures</li>
          </ul>

          <h2>Seller Responsibilities</h2>
          <p>Sellers on Botsmart Africa must:</p>
          <ul>
            <li>Only sell lawful, authentic products</li>
            <li>Provide accurate product descriptions</li>
            <li>Ship orders within promised timeframes</li>
            <li>Honor return requests per our policy</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>All content on the platform, including logos, text, images, and design, is property of The Lebogang Group or its licensors. Unauthorized use is prohibited.</p>

          <h2>Limitation of Liability</h2>
          <p>Botsmart Africa is not liable for:</p>
          <ul>
            <li>Indirect, incidental, or consequential damages</li>
            <li>Seller products, representations, or actions</li>
            <li>Force majeure events</li>
            <li>User-generated content</li>
          </ul>

          <h2>Dispute Resolution</h2>
          <p>For disputes between buyers and sellers, Botsmart Africa may mediate in good faith. Users agree to attempt resolution through our support team before pursuing legal action.</p>

          <h2>Platform Changes</h2>
          <p>We reserve the right to:</p>
          <ul>
            <li>Modify or discontinue services at any time</li>
            <li>Update pricing and fees with notice</li>
            <li>Change terms with reasonable notice</li>
            <li>Restrict access for policy violations</li>
          </ul>

          <h2>Governing Law</h2>
          <p>These terms are governed by the laws of South Africa. Any legal proceedings shall be brought in the courts of South Africa.</p>

          <h2>Contact Information</h2>
          <p>For questions about these terms:</p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:legal@botsmart.africa" className="text-primary hover:underline">
              legal@botsmart.africa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
