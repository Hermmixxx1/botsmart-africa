import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Botsmart Africa',
  description: 'Get in touch with Botsmart Africa. We are here to help with orders, returns, seller inquiries, and general questions.',
};

export default function ContactUsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-center">Contact Us</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-center text-lg mb-8">
            We are here to help! Whether you have a question about our platform, need assistance with an order, or want to become a seller, our team is ready to assist you.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">General Inquiries</h2>
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@botsmart.africa" className="text-primary hover:underline">
                  support@botsmart.africa
                </a>
              </p>
              <p className="mb-2"><strong>Phone:</strong> +27 21 123 4567</p>
              <p><strong>Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM SAST</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Customer Support</h2>
              <p className="mb-2">
                For order-related inquiries, returns, or refunds:
              </p>
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:orders@botsmart.africa" className="text-primary hover:underline">
                  orders@botsmart.africa
                </a>
              </p>
              <p>Live Chat available during business hours</p>
            </div>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Become a Seller</h2>
            <p className="mb-2">
              Interested in selling on Botsmart Africa? Our seller support team can help you get started:
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:sellers@botsmart.africa" className="text-primary hover:underline">
                sellers@botsmart.africa
              </a>
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Office Address</h2>
            <p>
              The Lebogang Group<br />
              Cape Town, Western Cape<br />
              South Africa
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Response Time</h2>
            <p>
              We aim to respond to all inquiries within <strong>24 hours</strong> during business days. 
              For urgent matters, please use our live chat feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
