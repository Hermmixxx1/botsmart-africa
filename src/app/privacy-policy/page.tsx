import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Botsmart Africa',
  description: 'Read Botsmart Africa privacy policy. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-center">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-center text-sm text-muted-foreground mb-8">
            <strong>Last updated: January 2025</strong>
          </p>

          <p>The Lebogang Group (&quot;Botsmart Africa&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.</p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <ul>
            <li>Name, email, phone number</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely via Stripe)</li>
            <li>Account credentials</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li>IP address and browser type</li>
            <li>Device information</li>
            <li>Pages visited and interaction data</li>
            <li>Cookies and usage analytics</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>Process orders and payments</li>
            <li>Provide customer support</li>
            <li>Send order updates and notifications</li>
            <li>Improve our platform and services</li>
            <li>Marketing communications (with your consent)</li>
            <li>Fraud prevention and security</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We share your information only in these circumstances:</p>
          <ul>
            <li><strong>Sellers:</strong> Order details necessary for fulfillment</li>
            <li><strong>Payment processors:</strong> Stripe for secure payments</li>
            <li><strong>Service providers:</strong> Shipping, analytics, support</li>
            <li><strong>Legal requirements:</strong> When required by law</li>
          </ul>

          <h2>Data Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li>SSL encryption for all data transmission</li>
            <li>Secure data centers with access controls</li>
            <li>Regular security audits</li>
            <li>PCI-DSS compliant payment processing</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>Cookies</h2>
          <p>We use cookies to enhance your experience. Manage your preferences through your browser settings or account settings.</p>

          <h2>Contact Us</h2>
          <p>For privacy-related questions:</p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:privacy@botsmart.africa" className="text-primary hover:underline">
              privacy@botsmart.africa
            </a>
          </p>

          <h2>Changes to This Policy</h2>
          <p>We may update this policy periodically. Changes will be posted on this page with an updated revision date.</p>
        </div>
      </div>
    </div>
  );
}
