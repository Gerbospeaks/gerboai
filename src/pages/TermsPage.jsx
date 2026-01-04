import React, { useState } from 'react';
import { FileText, AlertCircle, Scale, CreditCard, Users, Shield, Ban, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const TermsPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 1,
      icon: <FileText className="w-6 h-6" />,
      title: "Agreement to Terms",
      content: `
        <h3>Acceptance of Terms</h3>
        <p>By accessing or using SolidFlo ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.</p>

        <h3>Who May Use the Service</h3>
        <p>You may use the Service only if:</p>
        <ul>
          <li>You are at least 18 years old and capable of forming a binding contract</li>
          <li>You are not prohibited from using the Service under applicable law</li>
          <li>Your use complies with all local, state, national, and international laws</li>
          <li>You have not previously been suspended or removed from the Service</li>
        </ul>

        <h3>Business Use</h3>
        <p>SolidFlo is intended for business and professional use. You represent that you are using the Service for legitimate business purposes related to invoicing, billing, and financial management.</p>

        <h3>Changes to Terms</h3>
        <p>We reserve the right to modify these Terms at any time. We will notify you of material changes via:</p>
        <ul>
          <li>Email notification to your registered email address</li>
          <li>Prominent notice on the SolidFlo platform</li>
          <li>In-app notification upon your next login</li>
        </ul>
        <p>Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.</p>

        <h3>Additional Policies</h3>
        <p>These Terms incorporate by reference our:</p>
        <ul>
          <li>Privacy Policy</li>
          <li>Acceptable Use Policy</li>
          <li>Payment Terms and Conditions</li>
          <li>Data Processing Agreement (for applicable users)</li>
        </ul>
      `
    },
    {
      id: 2,
      icon: <Users className="w-6 h-6" />,
      title: "Account Registration and Security",
      content: `
        <h3>Account Creation</h3>
        <p>To use SolidFlo, you must create an account by providing:</p>
        <ul>
          <li>Accurate and complete registration information</li>
          <li>A valid email address</li>
          <li>Business information (name, address, tax details)</li>
          <li>Payment information (for paid plans)</li>
        </ul>

        <h3>Account Responsibility</h3>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Immediately notifying us of any unauthorized access or security breach</li>
          <li>Ensuring your account information remains accurate and up-to-date</li>
          <li>All charges incurred under your account, whether authorized by you or not</li>
        </ul>

        <h3>Account Security</h3>
        <p>To maintain account security, you must:</p>
        <ul>
          <li>Use a strong, unique password</li>
          <li>Enable two-factor authentication when available</li>
          <li>Not share your login credentials with others</li>
          <li>Log out after each session on shared devices</li>
          <li>Report suspicious activity immediately</li>
        </ul>

        <h3>Multiple Users</h3>
        <p>If your plan allows multiple users:</p>
        <ul>
          <li>The account owner is responsible for all user activity</li>
          <li>Users must comply with these Terms</li>
          <li>The account owner can manage user permissions and access</li>
          <li>Removed users no longer have access to account data</li>
        </ul>

        <h3>Account Termination by User</h3>
        <p>You may terminate your account at any time by:</p>
        <ul>
          <li>Accessing account settings and selecting "Delete Account"</li>
          <li>Contacting our support team</li>
          <li>Following our account closure procedures</li>
        </ul>
        <p>Account deletion is permanent and cannot be reversed. Certain data may be retained as required by law.</p>
      `
    },
    {
      id: 3,
      icon: <CreditCard className="w-6 h-6" />,
      title: "Subscription Plans and Billing",
      content: `
        <h3>Plan Types</h3>
        <p>SolidFlo offers multiple subscription plans:</p>
        <ul>
          <li><strong>Free Plan:</strong> Limited features with basic functionality</li>
          <li><strong>Professional Plan:</strong> Monthly subscription with full features</li>
          <li><strong>Enterprise Plan:</strong> Custom pricing for larger organizations</li>
        </ul>

        <h3>Billing Cycle</h3>
        <p>Paid subscriptions are billed:</p>
        <ul>
          <li>Monthly or annually, as selected during signup</li>
          <li>In advance at the beginning of each billing cycle</li>
          <li>Automatically using your stored payment method</li>
          <li>In the currency specified at the time of purchase</li>
        </ul>

        <h3>Payment Methods</h3>
        <p>We accept payment via:</p>
        <ul>
          <li>Credit cards (Visa, Mastercard, American Express)</li>
          <li>Debit cards</li>
          <li>PayPal</li>
          <li>Bank transfers (for Enterprise plans)</li>
        </ul>

        <h3>Automatic Renewal</h3>
        <p>Your subscription automatically renews unless you cancel before the renewal date. You will be charged at the then-current rate for your plan level.</p>

        <h3>Price Changes</h3>
        <p>We may change subscription prices with 30 days' notice. Price changes:</p>
        <ul>
          <li>Do not affect your current billing cycle</li>
          <li>Take effect at your next renewal</li>
          <li>Will be communicated via email and in-app notification</li>
          <li>Give you the option to cancel before the new price takes effect</li>
        </ul>

        <h3>Refund Policy</h3>
        <p>Refunds are handled as follows:</p>
        <ul>
          <li><strong>Free Trial:</strong> No charges if canceled during trial period</li>
          <li><strong>Monthly Plans:</strong> No refunds for partial months</li>
          <li><strong>Annual Plans:</strong> Pro-rated refunds within 30 days of purchase</li>
          <li><strong>Disputed Charges:</strong> Reviewed on a case-by-case basis</li>
        </ul>

        <h3>Failed Payments</h3>
        <p>If a payment fails:</p>
        <ul>
          <li>We will retry the charge up to 3 times over 7 days</li>
          <li>Your account may be downgraded to the Free plan</li>
          <li>Access to paid features will be suspended</li>
          <li>We will notify you via email to update payment information</li>
        </ul>

        <h3>Taxes</h3>
        <p>You are responsible for all applicable taxes. We may collect taxes where legally required. Prices displayed may not include applicable taxes, which will be added at checkout.</p>

        <h3>Plan Upgrades and Downgrades</h3>
        <p><strong>Upgrades:</strong> Take effect immediately. You will be charged a pro-rated amount for the remainder of your billing cycle.</p>
        <p><strong>Downgrades:</strong> Take effect at the end of your current billing cycle. No refunds are provided for unused time on the higher plan.</p>
      `
    },
    {
      id: 4,
      icon: <Scale className="w-6 h-6" />,
      title: "User Content and Data Ownership",
      content: `
        <h3>Your Content</h3>
        <p>"Your Content" includes all data you input into SolidFlo:</p>
        <ul>
          <li>Client information and contact details</li>
          <li>Invoice data and financial records</li>
          <li>Business documents and attachments</li>
          <li>Time tracking and expense entries</li>
          <li>Custom templates and branding</li>
        </ul>

        <h3>Content Ownership</h3>
        <p>You retain all ownership rights to Your Content. By using SolidFlo, you do NOT transfer ownership of your data to us.</p>

        <h3>License to Use Your Content</h3>
        <p>You grant SolidFlo a limited license to:</p>
        <ul>
          <li>Store and process Your Content to provide the Service</li>
          <li>Display Your Content as necessary for Service functionality</li>
          <li>Transmit Your Content to your clients (e.g., sending invoices)</li>
          <li>Create backups for data protection and recovery</li>
          <li>Use anonymized, aggregated data for analytics and improvement</li>
        </ul>
        <p>This license ends when you delete Your Content or terminate your account.</p>

        <h3>Content Responsibility</h3>
        <p>You are solely responsible for:</p>
        <ul>
          <li>The accuracy and legality of Your Content</li>
          <li>Ensuring Your Content does not violate any laws or third-party rights</li>
          <li>Obtaining necessary permissions to use client data</li>
          <li>Compliance with data protection regulations</li>
          <li>Backing up Your Content independently</li>
        </ul>

        <h3>Prohibited Content</h3>
        <p>You may not use SolidFlo to store, transmit, or process content that:</p>
        <ul>
          <li>Is illegal, fraudulent, or deceptive</li>
          <li>Infringes on intellectual property rights</li>
          <li>Contains malware, viruses, or harmful code</li>
          <li>Violates privacy laws or regulations</li>
          <li>Harasses, threatens, or defames others</li>
          <li>Is used for money laundering or terrorist financing</li>
        </ul>

        <h3>Data Portability</h3>
        <p>You can export Your Content at any time in standard formats (CSV, PDF, JSON) through the platform interface.</p>

        <h3>Data Deletion</h3>
        <p>You can delete Your Content at any time. Upon account deletion:</p>
        <ul>
          <li>Your Content is permanently deleted within 30 days</li>
          <li>Certain records may be retained for legal compliance (up to 7 years)</li>
          <li>Backup copies are purged according to our retention schedule</li>
        </ul>

        <h3>SolidFlo's Content</h3>
        <p>The Service itself, including software, templates, features, and documentation, remains the property of SolidFlo. You may not:</p>
        <ul>
          <li>Copy, modify, or distribute our software</li>
          <li>Reverse engineer or decompile the Service</li>
          <li>Remove copyright or proprietary notices</li>
          <li>Use our trademarks without permission</li>
        </ul>
      `
    },
    {
      id: 5,
      icon: <Ban className="w-6 h-6" />,
      title: "Acceptable Use Policy",
      content: `
        <h3>Permitted Uses</h3>
        <p>SolidFlo may be used for:</p>
        <ul>
          <li>Creating and managing business invoices</li>
          <li>Tracking time and expenses</li>
          <li>Processing legitimate business payments</li>
          <li>Managing client relationships</li>
          <li>Generating financial reports</li>
        </ul>

        <h3>Prohibited Activities</h3>
        <p>You may NOT use SolidFlo to:</p>
        <ul>
          <li><strong>Illegal Activities:</strong> Money laundering, fraud, tax evasion, or any illegal business activity</li>
          <li><strong>Prohibited Industries:</strong> Adult content, gambling, weapons, illegal substances, or pyramid schemes</li>
          <li><strong>Abuse:</strong> Spam, phishing, harassment, or unauthorized marketing</li>
          <li><strong>System Abuse:</strong> Attempting to breach security, overload servers, or scrape data</li>
          <li><strong>Impersonation:</strong> Misrepresenting your identity or business</li>
          <li><strong>Intellectual Property Violations:</strong> Using copyrighted material without permission</li>
        </ul>

        <h3>Fair Use</h3>
        <p>To ensure quality service for all users:</p>
        <ul>
          <li>Do not create excessive API calls or automated requests</li>
          <li>Do not circumvent usage limits or restrictions</li>
          <li>Do not use the Service in ways that degrade performance for others</li>
          <li>Do not create multiple accounts to evade restrictions</li>
        </ul>

        <h3>Compliance with Laws</h3>
        <p>You must comply with all applicable laws, including:</p>
        <ul>
          <li>Tax regulations and reporting requirements</li>
          <li>Data protection and privacy laws (GDPR, CCPA, etc.)</li>
          <li>Anti-money laundering regulations</li>
          <li>Consumer protection laws</li>
          <li>Industry-specific regulations applicable to your business</li>
        </ul>

        <h3>Reporting Violations</h3>
        <p>If you become aware of violations of these Terms or illegal activity, report it to: <strong>abuse@solidflo.com</strong></p>

        <h3>Enforcement</h3>
        <p>Violations may result in:</p>
        <ul>
          <li>Warning and requirement to cease prohibited activity</li>
          <li>Temporary suspension of account access</li>
          <li>Permanent account termination</li>
          <li>Legal action and cooperation with law enforcement</li>
          <li>No refund of fees paid</li>
        </ul>
      `
    },
    {
      id: 6,
      icon: <Shield className="w-6 h-6" />,
      title: "Service Availability and Support",
      content: `
        <h3>Service Availability</h3>
        <p>We strive to provide reliable service with:</p>
        <ul>
          <li>99.9% uptime target (excluding scheduled maintenance)</li>
          <li>24/7 system monitoring</li>
          <li>Redundant data storage and backup systems</li>
          <li>Regular security updates and improvements</li>
        </ul>

        <h3>Scheduled Maintenance</h3>
        <p>We may perform scheduled maintenance:</p>
        <ul>
          <li>During off-peak hours when possible</li>
          <li>With advance notice (typically 48-72 hours)</li>
          <li>For security updates, feature releases, and system improvements</li>
        </ul>

        <h3>Service Interruptions</h3>
        <p>The Service may be temporarily unavailable due to:</p>
        <ul>
          <li>Emergency maintenance or security issues</li>
          <li>Force majeure events (natural disasters, wars, etc.)</li>
          <li>Third-party service failures (hosting, payment processors)</li>
          <li>Network or infrastructure issues beyond our control</li>
        </ul>
        <p>We are not liable for service interruptions or resulting losses.</p>

        <h3>Customer Support</h3>
        <p>Support levels vary by plan:</p>
        <ul>
          <li><strong>Free Plan:</strong> Email support, community forums</li>
          <li><strong>Professional Plan:</strong> Priority email support, live chat</li>
          <li><strong>Enterprise Plan:</strong> Dedicated account manager, phone support</li>
        </ul>

        <h3>Support Response Times</h3>
        <ul>
          <li><strong>Critical Issues:</strong> 2-4 hours (paid plans)</li>
          <li><strong>High Priority:</strong> 12-24 hours</li>
          <li><strong>General Inquiries:</strong> 24-48 hours</li>
          <li><strong>Feature Requests:</strong> Acknowledged within 5 business days</li>
        </ul>

        <h3>Service Modifications</h3>
        <p>We reserve the right to:</p>
        <ul>
          <li>Modify, suspend, or discontinue features with notice</li>
          <li>Update the Service to improve functionality</li>
          <li>Change APIs and integrations as needed</li>
          <li>Retire features that are no longer viable</li>
        </ul>
        <p>Major changes will be communicated with reasonable advance notice.</p>

        <h3>No Guarantee of Specific Features</h3>
        <p>We do not guarantee that specific features will always be available or that the Service will meet your specific needs.</p>
      `
    },
    {
      id: 7,
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Limitation of Liability and Disclaimers",
      content: `
        <h3>Service "As Is"</h3>
        <p>SolidFlo is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
        <ul>
          <li>Warranties of merchantability or fitness for a particular purpose</li>
          <li>Warranties that the Service will be uninterrupted or error-free</li>
          <li>Warranties regarding accuracy, reliability, or completeness</li>
          <li>Warranties that defects will be corrected</li>
        </ul>

        <h3>No Financial or Legal Advice</h3>
        <p>SolidFlo provides invoicing tools but does NOT provide:</p>
        <ul>
          <li>Financial, tax, or accounting advice</li>
          <li>Legal advice or contract review</li>
          <li>Compliance guidance for specific industries</li>
          <li>Audit or validation of your financial data</li>
        </ul>
        <p>Consult qualified professionals for financial and legal matters.</p>

        <h3>User Responsibility for Accuracy</h3>
        <p>You are solely responsible for:</p>
        <ul>
          <li>Accuracy of invoices and financial data</li>
          <li>Compliance with tax and reporting requirements</li>
          <li>Proper classification of income and expenses</li>
          <li>Retention of necessary records</li>
        </ul>

        <h3>Limitation of Liability</h3>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOLIDFLO SHALL NOT BE LIABLE FOR:</p>
        <ul>
          <li>Indirect, incidental, consequential, or punitive damages</li>
          <li>Loss of profits, revenue, data, or business opportunities</li>
          <li>Service interruptions or data loss</li>
          <li>Third-party actions or content</li>
          <li>Errors in calculations or reports</li>
        </ul>

        <h3>Liability Cap</h3>
        <p>Our total liability to you for all claims shall not exceed the greater of:</p>
        <ul>
          <li>The amount you paid to SolidFlo in the 12 months preceding the claim, OR</li>
          <li>$100 USD</li>
        </ul>

        <h3>Exceptions</h3>
        <p>These limitations do not apply to:</p>
        <ul>
          <li>Liability that cannot be excluded by law</li>
          <li>Death or personal injury caused by our negligence</li>
          <li>Fraud or fraudulent misrepresentation</li>
          <li>Gross negligence or willful misconduct</li>
        </ul>

        <h3>Third-Party Services</h3>
        <p>We are not responsible for:</p>
        <ul>
          <li>Payment processor errors or failures (Stripe, PayPal)</li>
          <li>Third-party integrations or services</li>
          <li>Client disputes or payment issues</li>
          <li>Banking or financial institution actions</li>
        </ul>

        <h3>Data Loss</h3>
        <p>While we implement robust backup systems, you are responsible for maintaining your own backups. We are not liable for data loss or corruption.</p>

        <h3>Force Majeure</h3>
        <p>We are not liable for failures caused by events beyond our reasonable control, including natural disasters, wars, strikes, government actions, or internet/telecommunications failures.</p>
      `
    },
    {
      id: 8,
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Termination and Account Suspension",
      content: `
        <h3>Termination by User</h3>
        <p>You may terminate your account at any time:</p>
        <ul>
          <li>Through account settings</li>
          <li>By contacting customer support</li>
          <li>No penalties for cancellation</li>
          <li>Access continues until end of paid period</li>
        </ul>

        <h3>Termination by SolidFlo</h3>
        <p>We may suspend or terminate your account if:</p>
        <ul>
          <li>You violate these Terms of Service</li>
          <li>Your account is used for illegal activities</li>
          <li>Payment fails and remains unpaid for 30 days</li>
          <li>You engage in abusive behavior toward our staff</li>
          <li>Your account poses security risks to other users</li>
          <li>We're required to do so by law</li>
        </ul>

        <h3>Suspension Process</h3>
        <p>Before termination, we typically:</p>
        <ul>
          <li>Send warning notices via email</li>
          <li>Provide opportunity to cure violations</li>
          <li>Suspend account temporarily (7-30 days)</li>
          <li>Allow data export before permanent deletion</li>
        </ul>
        <p>Serious violations may result in immediate termination without warning.</p>

        <h3>Effects of Termination</h3>
        <p>Upon termination:</p>
        <ul>
          <li>Access to the Service is immediately revoked</li>
          <li>Your Content becomes inaccessible</li>
          <li>Data deletion begins (completed within 30 days)</li>
          <li>No refunds for unused subscription time</li>
          <li>Outstanding invoices become immediately due</li>
        </ul>

        <h3>Data Retrieval</h3>
        <p>You have 30 days after termination to:</p>
        <ul>
          <li>Export Your Content</li>
          <li>Download invoices and reports</li>
          <li>Retrieve any necessary business records</li>
        </ul>
        <p>After 30 days, data may be permanently deleted and unrecoverable.</p>

        <h3>Surviving Provisions</h3>
        <p>The following sections survive termination:</p>
        <ul>
          <li>Payment obligations for services rendered</li>
          <li>Intellectual property provisions</li>
          <li>Limitation of liability</li>
          <li>Dispute resolution and arbitration</li>
          <li>Confidentiality obligations</li>
        </ul>

        <h3>Reinstatement</h3>
        <p>Suspended accounts may be reinstated if:</p>
        <ul>
          <li>Violations are resolved</li>
          <li>Outstanding payments are made</li>
          <li>You agree to comply with Terms going forward</li>
        </ul>
        <p>Reinstatement is at our sole discretion and not guaranteed.</p>
      `
    },
    {
      id: 9,
      icon: <Scale className="w-6 h-6" />,
      title: "Dispute Resolution and Governing Law",
      content: `
        <h3>Governing Law</h3>
        <p>These Terms are governed by the laws of South Africa, without regard to conflict of law principles.</p>

        <h3>Informal Resolution</h3>
        <p>Before filing any legal claim, you agree to:</p>
        <ul>
          <li>Contact us at legal@solidflo.com to describe the issue</li>
          <li>Allow 60 days for good-faith negotiation</li>
          <li>Provide all relevant information to facilitate resolution</li>
        </ul>
        <p>Most disputes can be resolved through informal discussion.</p>

        <h3>Arbitration Agreement</h3>
        <p>If informal resolution fails, disputes will be resolved through binding arbitration rather than court, except for:</p>
        <ul>
          <li>Small claims court actions (under $10,000)</li>
          <li>Intellectual property disputes</li>
          <li>Injunctive relief for urgent matters</li>
        </ul>

        <h3>Arbitration Rules</h3>
        <ul>
          <li>Conducted under rules of recognized arbitration body</li>
          <li>Single arbitrator mutually agreed upon or appointed</li>
          <li>Location: Pretoria, Gauteng, South Africa (or virtual)</li>
          <li>Language: English</li>
          <li>Each party bears own costs unless otherwise awarded</li>
        </ul>

        <h3>Class Action Waiver</h3>
        <p>You agree that disputes must be brought individually, not as a class action, class arbitration, or representative action. You waive the right to participate in class actions.</p>

        <h3>Jurisdiction and Venue</h3>
        <p>For matters not subject to arbitration, you agree to jurisdiction in the courts of Pretoria, Gauteng, South Africa.</p>

        <h3>Time Limitation</h3>
        <p>Any claim must be filed within one year after the claim arises. Claims filed later are permanently barred.</p>

        <h3>Severability</h3>
        <p>If any provision of these Terms is found unenforceable, the remaining provisions continue in full effect.</p>
      `
    },
    {
      id: 10,
      icon: <FileText className="w-6 h-6" />,
      title: "General Provisions",
      content: `
        <h3>Entire Agreement</h3>
        <p>These Terms, together with our Privacy Policy and other referenced policies, constitute the entire agreement between you and SolidFlo.</p>

        <h3>Assignment</h3>
        <p>You may not assign or transfer your rights under these Terms without our written consent. We may assign our rights to any affiliate or successor without restriction.</p>

        <h3>No Waiver</h3>
        <p>Our failure to enforce any provision does not waive our right to enforce it later. Any waiver must be in writing.</p>

        <h3>Severability</h3>
        <p>If any provision is held invalid or unenforceable, the remaining provisions remain in full force and effect, and the invalid provision will be modified to be enforceable.</p>

        <h3>Force Majeure</h3>
        <p>Neither party is liable for delays or failures caused by circumstances beyond reasonable control, including natural disasters, wars, strikes, or government actions.</p>

        <h3>Independent Contractors</h3>
        <p>Nothing in these Terms creates a partnership, joint venture, employment, or agency relationship between you and SolidFlo.</p>

        <h3>Third-Party Beneficiaries</h3>
        <p>These Terms do not confer any third-party beneficiary rights. Only you and SolidFlo may enforce these Terms.</p>

        <h3>Notices</h3>
        <p>Legal notices must be sent to:</p>
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
          <p><strong>SolidFlo Legal Department</strong><br/>
          123 Business Avenue<br/>
          Pretoria, Gauteng<br/>
          South Africa<br/>
          Email: legal@solidflo.com</p>
        </div>

        <h3>Electronic Communications</h3>
        <p>You consent to receive communications electronically. We may communicate with you by email or by posting notices on the Service. Electronic communications satisfy legal requirements for written communications.</p>

        <h3>Export Compliance</h3>
        <p>You agree not to export or re-export the Service or any data in violation of applicable export laws and regulations.</p>

        <h3>Language</h3>
        <p>These Terms are provided in English. Any translations are for convenience only. In case of conflict, the English version prevails.</p>

        <h3>Feedback</h3>
        <p>If you provide suggestions, ideas, or feedback about SolidFlo, we may use them without obligation to you and without compensation.</p>

        <h3>Contact Information</h3>
        <p>For questions about these Terms:</p>
        <ul>
          <li><strong>Email:</strong> legal@solidflo.com</li>
          <li><strong>Support:</strong> support@solidflo.com</li>
          <li><strong>Address:</strong> 123 Business Avenue, Pretoria, Gauteng, South Africa</li>
        </ul>
      `
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
        }

        .terms-header {
          background: linear-gradient(135deg, #2f3444 0%, #1a1d28 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .terms-header-icon {
          background: rgba(255, 157, 0, 0.2);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .terms-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .terms-header p {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 700px;
          margin: 0 auto;
        }

        .terms-meta {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .terms-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .important-notice {
          background: linear-gradient(135deg, #ff9d00 0%, #ff8800 100%);
          color: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .important-notice h2 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .important-notice p {
          font-size: 1rem;
          line-height: 1.7;
          opacity: 0.95;
        }

        .quick-links {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .quick-links h2 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #2f3444;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: #f8f9fa;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.95rem;
          color: #666;
        }

        .quick-link:hover {
          background: #ffe5cc;
          color: #ff9d00;
          transform: translateX(5px);
        }

        .section {
          background: white;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: all 0.3s;
        }

        .section:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          cursor: pointer;
          background: white;
          transition: background 0.3s;
        }

        .section-header:hover {
          background: #f8f9fa;
        }

        .section-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .section-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2f3444;
        }

        .section-toggle {
          color: #ff9d00;
          transition: transform 0.3s;
        }

        .section-toggle.expanded {
          transform: rotate(180deg);
        }

        .section-content {
          padding: 0 2rem 2rem;
          display: none;
        }

        .section-content.expanded {
          display: block;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .section-content h3 {
          font-size: 1.2rem;
          margin: 1.5rem 0 1rem;
          color: #2f3444;
          font-weight: 600;
        }

        .section-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
          color: #555;
        }

        .section-content ul {
          margin: 1rem 0 1.5rem 1.5rem;
          line-height: 1.9;
        }

        .section-content li {
          margin-bottom: 0.5rem;
          color: #555;
        }

        .section-content strong {
          color: #2f3444;
          font-weight: 600;
        }

        .highlight-box {
          background: #fff8e1;
          border-left: 4px solid #ff9d00;
          padding: 1.5rem;
          margin: 1.5rem 0;
          border-radius: 4px;
        }

        .highlight-box p {
          margin: 0;
          color: #666;
        }

        .footer-cta {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem;
          border-radius: 12px;
          text-align: center;
          margin-top: 3rem;
        }

        .footer-cta h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .footer-cta p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.95;
        }

        .cta-button {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          border: none;
          font-size: 1rem;
          cursor: pointer;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
          .terms-header h1 {
            font-size: 2rem;
          }

          .terms-container {
            padding: 2rem 1rem;
          }

          .section-header {
            padding: 1.25rem 1.5rem;
          }

          .section-content {
            padding: 0 1.5rem 1.5rem;
          }

          .quick-links-grid {
            grid-template-columns: 1fr;
          }

          .terms-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="terms-header">
        <div className="terms-header-icon">
          <FileText size={40} />
        </div>
        <h1>Terms of Service</h1>
        <p>
          Please read these terms carefully before using SolidFlo. By using our service, you agree to be bound by these terms.
        </p>
        <div className="terms-meta">
          <span>Last Updated: January 3, 2026</span>
          <span>•</span>
          <span>Effective Date: January 1, 2026</span>
        </div>
      </div>

      <div className="terms-container">
        <div className="important-notice">
          <h2>
            <AlertCircle size={24} />
            Important Information
          </h2>
          <p>
            These Terms include an arbitration clause and class action waiver that affect your rights. By using SolidFlo, you agree to resolve disputes through individual arbitration rather than court proceedings or class actions. Please review Section 9 carefully.
          </p>
        </div>

        <div className="quick-links">
          <h2>Quick Navigation</h2>
          <div className="quick-links-grid">
            {sections.map(section => (
              <div
                key={section.id}
                className="quick-link"
                onClick={() => {
                  setExpandedSection(section.id);
                  document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {section.icon}
                <span>{section.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="highlight-box">
          <p>
            <strong>In Plain English:</strong> You're agreeing to use SolidFlo responsibly for legitimate business purposes. We'll provide invoicing services, you'll pay for your plan, and we'll all play nice. Read on for the legal details.
          </p>
        </div>

        {sections.map(section => (
          <div key={section.id} className="section" id={`section-${section.id}`}>
            <div className="section-header" onClick={() => toggleSection(section.id)}>
              <div className="section-header-left">
                <div className="section-icon">{section.icon}</div>
                <h2 className="section-title">{section.title}</h2>
              </div>
              <div className={`section-toggle ${expandedSection === section.id ? 'expanded' : ''}`}>
                <ChevronDown size={24} />
              </div>
            </div>
            <div className={`section-content ${expandedSection === section.id ? 'expanded' : ''}`}>
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </div>
        ))}

        <div className="footer-cta">
          <h2>Questions About Our Terms?</h2>
          <p>Our legal team is here to help clarify any questions you may have about these Terms of Service.</p>
          <button className="cta-button">Contact Legal Team</button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;