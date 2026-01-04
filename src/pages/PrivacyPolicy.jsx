import React, { useState } from 'react';
import { Shield, Lock, Eye, Database, Users, FileText, Mail, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 1,
      icon: <FileText className="w-6 h-6" />,
      title: "Information We Collect",
      content: `
        <h3>Personal Information</h3>
        <p>When you create a SolidFlo account, we collect information that identifies you, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, company name, and business address</li>
          <li><strong>Payment Information:</strong> Credit card details, billing address, and payment history (processed securely through our payment partners)</li>
          <li><strong>Profile Information:</strong> Business logo, tax identification numbers, and other business details you choose to provide</li>
        </ul>

        <h3>Usage Information</h3>
        <p>We automatically collect information about how you use SolidFlo:</p>
        <ul>
          <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
          <li><strong>Log Data:</strong> Pages visited, features used, time spent on the platform, and click patterns</li>
          <li><strong>Performance Data:</strong> Error reports, system diagnostics, and feature usage statistics</li>
        </ul>

        <h3>Customer and Invoice Data</h3>
        <p>To provide our invoicing services, we process:</p>
        <ul>
          <li>Client names, addresses, and contact information you add to your account</li>
          <li>Invoice details including services, amounts, dates, and payment terms</li>
          <li>Payment transactions and status information</li>
          <li>Time tracking and expense data you enter into the system</li>
        </ul>

        <h3>Communication Data</h3>
        <p>When you contact us or communicate through our platform:</p>
        <ul>
          <li>Support tickets and correspondence with our team</li>
          <li>Feedback, survey responses, and feature requests</li>
          <li>Email communications and notifications you've received</li>
        </ul>
      `
    },
    {
      id: 2,
      icon: <Database className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: `
        <h3>To Provide Our Services</h3>
        <ul>
          <li>Create and manage your SolidFlo account</li>
          <li>Process invoices and payments on your behalf</li>
          <li>Send invoice reminders and payment notifications to your clients</li>
          <li>Generate financial reports and analytics</li>
          <li>Provide customer support and respond to your inquiries</li>
          <li>Process your transactions and maintain transaction records</li>
        </ul>

        <h3>To Improve Our Platform</h3>
        <ul>
          <li>Analyze usage patterns to enhance features and user experience</li>
          <li>Identify and fix technical issues and bugs</li>
          <li>Develop new features based on user needs and feedback</li>
          <li>Conduct research and testing to improve platform performance</li>
          <li>Monitor and prevent fraud, abuse, and security threats</li>
        </ul>

        <h3>To Communicate With You</h3>
        <ul>
          <li>Send service-related notifications and updates</li>
          <li>Provide account and billing information</li>
          <li>Share product updates, new features, and improvements</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Respond to your questions and support requests</li>
        </ul>

        <h3>Legal and Compliance</h3>
        <ul>
          <li>Comply with legal obligations and regulations</li>
          <li>Enforce our Terms of Service and policies</li>
          <li>Protect our rights and property</li>
          <li>Prevent fraud and ensure platform security</li>
          <li>Respond to legal requests and court orders</li>
        </ul>
      `
    },
    {
      id: 3,
      icon: <Users className="w-6 h-6" />,
      title: "How We Share Your Information",
      content: `
        <h3>Service Providers</h3>
        <p>We share information with trusted third-party service providers who help us operate SolidFlo:</p>
        <ul>
          <li><strong>Payment Processors:</strong> Stripe, PayPal, and other payment gateways to process transactions</li>
          <li><strong>Cloud Hosting:</strong> AWS or similar providers to store and secure your data</li>
          <li><strong>Email Services:</strong> To send invoices, reminders, and notifications</li>
          <li><strong>Analytics Providers:</strong> To understand platform usage and improve our services</li>
          <li><strong>Customer Support Tools:</strong> To provide efficient customer service</li>
        </ul>
        <p>All service providers are contractually obligated to protect your data and use it only for specified purposes.</p>

        <h3>Your Clients</h3>
        <p>When you send invoices through SolidFlo, we share necessary information with your clients:</p>
        <ul>
          <li>Invoice details, amounts, and payment information</li>
          <li>Your business name, logo, and contact information</li>
          <li>Payment links and transaction receipts</li>
        </ul>

        <h3>Business Transfers</h3>
        <p>If SolidFlo is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice on our platform of any such change in ownership.</p>

        <h3>Legal Requirements</h3>
        <p>We may disclose your information when required by law or to:</p>
        <ul>
          <li>Comply with legal processes, court orders, or government requests</li>
          <li>Enforce our Terms of Service and agreements</li>
          <li>Protect the rights, property, or safety of SolidFlo, our users, or the public</li>
          <li>Detect, prevent, or address fraud, security, or technical issues</li>
        </ul>

        <h3>With Your Consent</h3>
        <p>We will share your information with other parties when you explicitly consent to such sharing.</p>
      `
    },
    {
      id: 4,
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: `
        <h3>Security Measures</h3>
        <p>We implement industry-standard security measures to protect your information:</p>
        <ul>
          <li><strong>Encryption:</strong> All data transmission uses 256-bit SSL/TLS encryption</li>
          <li><strong>Secure Storage:</strong> Data at rest is encrypted using AES-256 encryption</li>
          <li><strong>Access Controls:</strong> Strict role-based access controls and authentication requirements</li>
          <li><strong>Regular Audits:</strong> Periodic security audits and vulnerability assessments</li>
          <li><strong>Monitoring:</strong> 24/7 system monitoring for suspicious activity</li>
          <li><strong>Backup Systems:</strong> Regular automated backups to prevent data loss</li>
        </ul>

        <h3>Payment Security</h3>
        <p>We never store complete credit card information on our servers. All payment processing is handled by PCI-DSS compliant payment processors (Stripe, PayPal) that meet the highest security standards.</p>

        <h3>Employee Access</h3>
        <p>Access to customer data is strictly limited to authorized employees who need it to perform their job functions. All employees undergo security training and sign confidentiality agreements.</p>

        <h3>Your Responsibility</h3>
        <p>While we implement strong security measures, you also play a role in protecting your account:</p>
        <ul>
          <li>Use a strong, unique password for your SolidFlo account</li>
          <li>Enable two-factor authentication when available</li>
          <li>Keep your login credentials confidential</li>
          <li>Log out of your account when using shared devices</li>
          <li>Report any suspicious activity immediately</li>
        </ul>

        <h3>Incident Response</h3>
        <p>In the unlikely event of a data breach, we will notify affected users within 72 hours and take immediate steps to secure the platform and mitigate any potential harm.</p>
      `
    },
    {
      id: 5,
      icon: <Eye className="w-6 h-6" />,
      title: "Your Privacy Rights",
      content: `
        <h3>Access and Portability</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Access all personal information we hold about you</li>
          <li>Request a copy of your data in a portable format (CSV, JSON)</li>
          <li>Export your invoices, clients, and financial data at any time</li>
        </ul>

        <h3>Correction and Updates</h3>
        <p>You can update your information at any time through:</p>
        <ul>
          <li>Your account settings page</li>
          <li>Contacting our support team</li>
          <li>Directly editing profile and business information</li>
        </ul>

        <h3>Deletion Rights</h3>
        <p>You can request deletion of your account and data:</p>
        <ul>
          <li>Account deletion removes all personal information within 30 days</li>
          <li>Invoice and transaction records may be retained for legal and tax purposes as required by law</li>
          <li>Anonymized usage data may be retained for analytics purposes</li>
        </ul>

        <h3>Marketing Communications</h3>
        <p>You can opt out of marketing emails:</p>
        <ul>
          <li>Click the "unsubscribe" link in any marketing email</li>
          <li>Update your email preferences in account settings</li>
          <li>Contact our support team to adjust your communication preferences</li>
        </ul>
        <p><em>Note: You cannot opt out of essential service-related communications (account notifications, security alerts, billing information).</em></p>

        <h3>Object to Processing</h3>
        <p>You have the right to object to certain processing of your data, including:</p>
        <ul>
          <li>Marketing and promotional activities</li>
          <li>Analytics and profiling (where legally permissible)</li>
          <li>Automated decision-making processes</li>
        </ul>

        <h3>Exercising Your Rights</h3>
        <p>To exercise any of these rights, contact us at <strong>privacy@solidflo.com</strong>. We will respond to your request within 30 days and may need to verify your identity before processing certain requests.</p>
      `
    },
    {
      id: 6,
      icon: <Globe className="w-6 h-6" />,
      title: "International Data Transfers",
      content: `
        <h3>Global Operations</h3>
        <p>SolidFlo operates globally, and your information may be transferred to, stored, and processed in countries other than your own, including the United States and other regions where our service providers operate.</p>

        <h3>Data Transfer Safeguards</h3>
        <p>When transferring data internationally, we ensure appropriate safeguards are in place:</p>
        <ul>
          <li>Standard contractual clauses approved by regulatory authorities</li>
          <li>Adequacy decisions recognizing equivalent data protection standards</li>
          <li>Privacy Shield frameworks (where applicable)</li>
          <li>Binding corporate rules for internal data transfers</li>
        </ul>

        <h3>Regional Compliance</h3>
        <ul>
          <li><strong>European Union (GDPR):</strong> We comply with all GDPR requirements for EU residents</li>
          <li><strong>California (CCPA):</strong> California residents have additional rights under the CCPA</li>
          <li><strong>Other Jurisdictions:</strong> We comply with local privacy laws where we operate</li>
        </ul>

        <h3>Data Storage Locations</h3>
        <p>Your data is primarily stored in secure data centers located in:</p>
        <ul>
          <li>United States (primary)</li>
          <li>European Union (for EU customers)</li>
          <li>Other regions as needed for service delivery and redundancy</li>
        </ul>
      `
    },
    {
      id: 7,
      icon: <Shield className="w-6 h-6" />,
      title: "Data Retention",
      content: `
        <h3>Active Account Data</h3>
        <p>We retain your information for as long as your account is active or as needed to provide services:</p>
        <ul>
          <li>Account and profile information: Duration of account activity</li>
          <li>Invoice and transaction data: Duration of account activity plus 7 years for tax purposes</li>
          <li>Usage and analytics data: Aggregated data may be retained indefinitely</li>
        </ul>

        <h3>Deleted Account Data</h3>
        <p>When you delete your account:</p>
        <ul>
          <li>Personal information is deleted within 30 days</li>
          <li>Financial records are retained for 7 years as required by tax laws</li>
          <li>Anonymized data may be retained for analytics and research</li>
          <li>Backup copies are purged according to our backup retention schedule (90 days)</li>
        </ul>

        <h3>Legal Requirements</h3>
        <p>We may retain certain information longer when required to:</p>
        <ul>
          <li>Comply with legal, tax, and accounting obligations</li>
          <li>Resolve disputes and enforce agreements</li>
          <li>Prevent fraud and abuse</li>
          <li>Support ongoing business operations</li>
        </ul>

        <h3>Inactive Accounts</h3>
        <p>Accounts inactive for 3+ years may be subject to deletion after proper notice is provided to the account holder.</p>
      `
    },
    {
      id: 8,
      icon: <Mail className="w-6 h-6" />,
      title: "Contact Us",
      content: `
        <h3>Privacy Questions</h3>
        <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>

        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
          <p><strong>Email:</strong> privacy@solidflo.com</p>
          <p><strong>Support:</strong> support@solidflo.com</p>
          <p><strong>Mail:</strong> SolidFlo Privacy Team<br/>
          123 Business Avenue<br/>
          Pretoria, Gauteng<br/>
          South Africa</p>
        </div>

        <h3>Data Protection Officer</h3>
        <p>For GDPR-related inquiries, you can contact our Data Protection Officer at <strong>dpo@solidflo.com</strong></p>

        <h3>Complaints and Regulatory Contact</h3>
        <p>If you believe we have not adequately addressed your privacy concerns, you have the right to lodge a complaint with your local data protection authority.</p>

        <h3>Response Time</h3>
        <p>We strive to respond to all privacy-related inquiries within 5 business days and resolve issues within 30 days.</p>
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

        .privacy-header {
          background: linear-gradient(135deg, #2f3444 0%, #1a1d28 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .privacy-header-icon {
          background: rgba(255, 157, 0, 0.2);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .privacy-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .privacy-header p {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 700px;
          margin: 0 auto;
        }

        .privacy-meta {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .privacy-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
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

        .section-content em {
          color: #666;
          font-style: italic;
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
          .privacy-header h1 {
            font-size: 2rem;
          }

          .privacy-container {
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

          .privacy-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="privacy-header">
        <div className="privacy-header-icon">
          <Shield size={40} />
        </div>
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. This policy explains how SolidFlo collects, uses, and protects your personal information.
        </p>
        <div className="privacy-meta">
          <span>Last Updated: January 3, 2026</span>
          <span>•</span>
          <span>Effective Date: January 1, 2026</span>
        </div>
      </div>

      <div className="privacy-container">
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
            <strong>In Summary:</strong> SolidFlo collects only the information necessary to provide excellent invoicing services. We never sell your data, use bank-level encryption, and give you full control over your information. Read on for complete details.
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
          <h2>Questions About Privacy?</h2>
          <p>Our team is here to help. Contact us anytime with privacy-related questions or concerns.</p>
          <button className="cta-button">Contact Privacy Team</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;