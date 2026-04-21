-- CMS Pages Seed Script for Botsmart Africa
-- Run this in Supabase SQL Editor to create default policy pages

-- Contact Us Page
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES (
  'Contact Us',
  'contact',
  '<h2>Get in Touch</h2>
<p>We are here to help! Whether you have a question about our platform, need assistance with an order, or want to become a seller, our team is ready to assist you.</p>

<h3>General Inquiries</h3>
<p>Email: <a href="mailto:support@botsmart.africa">support@botsmart.africa</a><br>
Phone: +27 21 123 4567<br>
Hours: Monday - Friday, 8:00 AM - 6:00 PM SAST</p>

<h3>Customer Support</h3>
<p>For order-related inquiries, returns, or refunds, please contact our customer support team:</p>
<ul>
<li>Email: <a href="mailto:orders@botsmart.africa">orders@botsmart.africa</a></li>
<li>Live Chat: Available on our website during business hours</li>
</ul>

<h3>Seller Support</h3>
<p>Interested in selling on Botsmart Africa? Our seller support team can help you get started:</p>
<ul>
<li>Email: <a href="mailto:sellers@botsmart.africa">sellers@botsmart.africa</a></li>
<li>Registration: <a href="/seller/register">Become a Seller</a></li>
</ul>

<h3>Office Address</h3>
<p>The Lebogang Group<br>
123 Commerce Street<br>
Cape Town, Western Cape<br>
South Africa, 8001</p>

<h3>Response Time</h3>
<p>We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please use our live chat feature.</p>',
  'Contact Us | Botsmart Africa',
  'Get in touch with Botsmart Africa customer support. We are here to help with orders, returns, seller inquiries, and general questions.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Shipping Policy Page
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES (
  'Shipping Policy',
  'shipping-policy',
  '<h2>Shipping Policy</h2>
<p>At Botsmart Africa, we partner with verified sellers across Southern Africa to bring you quality products with reliable delivery options.</p>

<h3>Shipping Coverage</h3>
<p>We deliver to 12 Southern African countries:</p>
<ul>
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

<h3>Shipping Times</h3>
<table>
<tr><th>Region</th><th>Estimated Delivery</th></tr>
<tr><td>South Africa</td><td>3-5 business days</td></tr>
<tr><td>Neighboring countries (Namibia, Botswana, Lesotho, Eswatini)</td><td>5-7 business days</td></tr>
<tr><td>Regional (Zimbabwe, Mozambique, Zambia, Malawi)</td><td>7-10 business days</td></tr>
<tr><td>Extended (Angola, Madagascar, Tanzania)</td><td>10-14 business days</td></tr>
</table>

<h3>Shipping Costs</h3>
<p>Shipping costs vary by:</p>
<ul>
<li>Product weight and dimensions</li>
<li>Seller location</li>
<li>Destination country</li>
<li>Shipping method selected</li>
</ul>
<p>Exact shipping costs are calculated at checkout based on your location and the sellers fulfillment options.</p>

<h3>Order Processing</h3>
<p>Orders are typically processed within 1-2 business days by sellers. Once shipped, you will receive a tracking number via email to monitor your delivery.</p>

<h3>Tracking Your Order</h3>
<p>Track your order status in your Botsmart Africa account under "My Orders". For any delivery issues, please contact our customer support team.</p>

<h3>Shipping Restrictions</h3>
<p>Some products may have shipping restrictions based on local regulations. Any restrictions will be clearly noted on the product page.</p>',
  'Shipping Policy | Botsmart Africa',
  'Learn about Botsmart Africa shipping policies, delivery times, and coverage across 12 Southern African countries.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Return Policy Page
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES (
  'Return Policy',
  'return-policy',
  '<h2>Return Policy</h2>
<p>We want you to be completely satisfied with your purchase. Botsmart Africa offers a fair and transparent return process for all eligible items.</p>

<h3>Return Eligibility</h3>
<p>You may return items within <strong>14 days</strong> of delivery if:</p>
<ul>
<li>Item is unused, unworn, and in original packaging</li>
<li>All original tags and labels are attached</li>
<li>Item matches the description on the website</li>
<li>Proof of purchase is available</li>
</ul>

<h3>Non-Returnable Items</h3>
<p>The following items cannot be returned:</p>
<ul>
<li>Personalized or custom-made items</li>
<li>Intimate apparel and swimwear</li>
<li>Perishable goods</li>
<li>Items marked as "Final Sale"</li>
<li>Products with broken hygiene seals ( cosmetics, headphones)</li>
</ul>

<h3>Return Process</h3>
<ol>
<li>Log into your Botsmart Africa account</li>
<li>Go to "My Orders" and select the item you wish to return</li>
<li>Click "Request Return" and select a reason</li>
<li>Print the prepaid return label (where applicable)</li>
<li>Pack the item securely and drop it off at the designated location</li>
</ol>

<h3>Refunds</h3>
<p>Once we receive and inspect your return:</p>
<ul>
<li>Refunds are processed within 5-7 business days</li>
<li>Original payment method will be credited</li>
<li>Shipping costs are non-refundable (unless the return is due to our error)</li>
</ul>

<h3>Damaged or Defective Items</h3>
<p>If you receive a damaged or defective item:</p>
<ol>
<li>Contact us within 48 hours of delivery</li>
<li>Provide photos of the damage/defect</li>
<li>We will arrange a replacement or full refund at no extra cost</li>
</ol>

<h3>Contact Us</h3>
<p>For return-related inquiries:<br>
Email: <a href="mailto:returns@botsmart.africa">returns@botsmart.africa</a></p>',
  'Return Policy | Botsmart Africa',
  'Understand Botsmart Africa return policy, eligibility criteria, refund process, and how to return products purchased on our platform.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Privacy Policy Page
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES (
  'Privacy Policy',
  'privacy-policy',
  '<h2>Privacy Policy</h2>
<p>Last updated: January 2025</p>

<p>The Lebogang Group ("Botsmart Africa", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.</p>

<h3>Information We Collect</h3>

<h4>Personal Information</h4>
<ul>
<li>Name, email, phone number</li>
<li>Billing and shipping addresses</li>
<li>Payment information (processed securely via Stripe)</li>
<li>Account credentials</li>
</ul>

<h4>Automatically Collected Information</h4>
<ul>
<li>IP address and browser type</li>
<li>Device information</li>
<li>Pages visited and interaction data</li>
<li>Cookies and usage analytics</li>
</ul>

<h3>How We Use Your Information</h3>
<ul>
<li>Process orders and payments</li>
<li>Provide customer support</li>
<li>Send order updates and notifications</li>
<li>Improve our platform and services</li>
<li>Marketing communications (with your consent)</li>
<li>Fraud prevention and security</li>
</ul>

<h3>Information Sharing</h3>
<p>We share your information only in these circumstances:</p>
<ul>
<li><strong>Sellers:</strong> Order details necessary for fulfillment</li>
<li><strong>Payment processors:</strong> Stripe for secure payments</li>
<li><strong>Service providers:</strong> Shipping, analytics, support</li>
<li><strong>Legal requirements:</strong> When required by law</li>
</ul>

<h3>Data Security</h3>
<p>We implement industry-standard security measures:</p>
<ul>
<li>SSL encryption for all data transmission</li>
<li>Secure data centers with access controls</li>
<li>Regular security audits</li>
<li>PCI-DSS compliant payment processing</li>
</ul>

<h3>Your Rights</h3>
<p>You have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Correct inaccurate information</li>
<li>Request deletion of your data</li>
<li>Opt-out of marketing communications</li>
<li>Withdraw consent at any time</li>
</ul>

<h3>Cookies</h3>
<p>We use cookies to enhance your experience. Manage your preferences through your browser settings.</p>

<h3>Contact Us</h3>
<p>For privacy-related questions:<br>
Email: <a href="mailto:privacy@botsmart.africa">privacy@botsmart.africa</a></p>

<h3>Changes to This Policy</h3>
<p>We may update this policy periodically. Changes will be posted on this page with an updated revision date.</p>',
  'Privacy Policy | Botsmart Africa',
  'Read Botsmart Africa privacy policy. Learn how we collect, use, and protect your personal information.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Terms of Service Page
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES (
  'Terms of Service',
  'terms-of-service',
  '<h2>Terms of Service</h2>
<p>Last updated: January 2025</p>

<h3>Agreement to Terms</h3>
<p>By accessing or using the Botsmart Africa platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.</p>

<h3>Platform Overview</h3>
<p>Botsmart Africa is a multi-vendor e-commerce marketplace operated by The Lebogang Group. We connect buyers with verified sellers across 12 Southern African countries, facilitating the sale of products and services.</p>

<h3>User Accounts</h3>
<p>To access certain features, you must create an account. You are responsible for:</p>
<ul>
<li>Maintaining accurate account information</li>
<li>Protecting your login credentials</li>
<li>All activities under your account</li>
<li>Notifying us of unauthorized access immediately</li>
</ul>

<h3>Buyer Responsibilities</h3>
<p>As a buyer, you agree to:</p>
<ul>
<li>Provide accurate shipping information</li>
<li>Make payments promptly</li>
<li>Not engage in fraudulent transactions</li>
<li>Respect seller policies and return procedures</li>
</ul>

<h3>Seller Responsibilities</h3>
<p>Sellers on Botsmart Africa must:</p>
<ul>
<li>Only sell lawful, authentic products</li>
<li>Provide accurate product descriptions</li>
<li>Ship orders within promised timeframes</li>
<li>Honor return requests per our policy</li>
<li>Comply with all applicable laws and regulations</li>
</ul>

<h3>Intellectual Property</h3>
<p>All content on the platform, including logos, text, images, and design, is property of The Lebogang Group or its licensors. Unauthorized use is prohibited.</p>

<h3>Limitation of Liability</h3>
<p>Botsmart Africa is not liable for:</p>
<ul>
<li>Indirect, incidental, or consequential damages</li>
<li>Seller products, representations, or actions</li>
<li>Force majeure events</li>
<li>User-generated content</li>
</ul>

<h3>Dispute Resolution</h3>
<p>For disputes between buyers and sellers, Botsmart Africa may mediate in good faith. Users agree to attempt resolution through our support team before pursuing legal action.</p>

<h3>Platform Changes</h3>
<p>We reserve the right to:</p>
<ul>
<li>Modify or discontinue services at any time</li>
<li>Update pricing and fees with notice</li>
<li>Change terms with reasonable notice</li>
<li>Restrict access for policy violations</li>
</ul>

<h3>Governing Law</h3>
<p>These terms are governed by the laws of South Africa. Any legal proceedings shall be brought in the courts of South Africa.</p>

<h3>Contact Information</h3>
<p>For questions about these terms:<br>
Email: <a href="mailto:legal@botsmart.africa">legal@botsmart.africa</a></p>',
  'Terms of Service | Botsmart Africa',
  'Read the Botsmart Africa terms of service. Understand the rules and conditions for using our multi-vendor marketplace platform.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Cookie Policy Page
INSERT INTO pages (title, slug, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES (
  'Cookie Policy',
  'cookie-policy',
  '<h2>Cookie Policy</h2>
<p>Last updated: January 2025</p>

<h3>What Are Cookies</h3>
<p>Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your browsing experience.</p>

<h3>How We Use Cookies</h3>
<p>Botsmart Africa uses cookies for:</p>
<ul>
<li><strong>Essential cookies:</strong> Required for the platform to function (shopping cart, checkout, authentication)</li>
<li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
<li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
<li><strong>Preference cookies:</strong> Remember your settings and choices</li>
</ul>

<h3>Types of Cookies We Use</h3>
<table>
<tr><th>Cookie Type</th><th>Purpose</th><th>Duration</th></tr>
<tr><td>Session</td><td>Maintain login state</td><td>Session</td></tr>
<tr><td>Auth</td><td>Security authentication</td><td>30 days</td></tr>
<tr><td>Cart</td><td>Shopping cart functionality</td><td>7 days</td></tr>
<tr><td>Analytics</td><td>Usage statistics</td><td>1 year</td></tr>
<tr><td>Marketing</td><td>Ad targeting</td><td>90 days</td></tr>
</table>

<h3>Managing Cookies</h3>
<p>Control your cookie preferences:</p>
<ul>
<li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies</li>
<li><strong>Platform settings:</strong> You can manage preferences in your account settings</li>
<li><strong>Opt-out tools:</strong> Use industry opt-out tools for marketing cookies</li>
</ul>

<h3>Third-Party Cookies</h3>
<p>Some cookies are placed by third-party services:</p>
<ul>
<li>Payment processors (Stripe)</li>
<li>Analytics providers</li>
<li>Social media platforms</li>
<li>Advertising networks</li>
</ul>

<h3>Impact of Disabling Cookies</h3>
<p>If you disable cookies:</p>
<ul>
<li>Some features may not work properly</li>
<li>You may need to log in each time</li>
<li>Shopping cart may not function</li>
<li>Personalized recommendations unavailable</li>
</ul>

<h3>Updates to This Policy</h3>
<p>We may update this cookie policy periodically. Check back for the latest information.</p>

<h3>Contact Us</h3>
<p>For questions about our cookie practices:<br>
Email: <a href="mailto:privacy@botsmart.africa">privacy@botsmart.africa</a></p>',
  'Cookie Policy | Botsmart Africa',
  'Learn how Botsmart Africa uses cookies and how you can manage your cookie preferences.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Verify pages were created
SELECT 'Pages created successfully:' as status;
SELECT id, title, slug, is_published FROM pages ORDER BY title;
