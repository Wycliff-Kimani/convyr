import Link from "next/link";
import Footer from "@/components/marketing/Footer";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";

export default function PrivacyPage() {
  return (
    <main>
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#075E54] text-xs font-medium px-4 py-2 rounded-full mb-8 border border-green-100">
            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] leading-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Last updated: April 12, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              1. Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr is a WhatsApp Business Automation platform operated by
              DevCraft Solutions, a business registered in Kenya. Our registered
              address is Spur Mall, Ruiru, Kiambu County, Kenya. You can contact
              us at{" "}
              <a
                href="mailto:wycliffkimani9@gmail.com"
                className="text-[#25D366] hover:underline"
              >
                wycliffkimani9@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              2. What Data We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-4">
              When you create an account and use Convyr, we collect the
              following information:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Your full name,
                business name, and email address provided during registration
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Your WhatsApp
                Business Account details connected through Meta's API
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Messages sent
                and received through your connected WhatsApp number
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Contact
                information of your customers who message your WhatsApp number
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Automation
                rules and settings you configure in your dashboard
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Payment
                information (M-Pesa phone number) for subscription billing
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              3. How We Use Your Data
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-4">
              We use the data we collect solely to provide and improve the
              Convyr service:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> To operate your
                WhatsApp automation and deliver auto-replies on your behalf
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> To display your
                conversation history and analytics in your dashboard
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> To process
                subscription payments via M-Pesa through PayHero
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> To send you
                important service notifications and updates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> To improve and
                debug the Convyr platform
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-sm mt-4">
              We do not sell your data or your customers' data to any third
              party.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              4. WhatsApp and Meta
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr integrates with the Meta WhatsApp Business Cloud API. By
              connecting your WhatsApp Business Account to Convyr, you authorize
              Convyr to send and receive messages on your behalf through Meta's
              platform. Your use of WhatsApp through Convyr is also subject to{" "}
              <a
                href="https://www.whatsapp.com/legal/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline"
              >
                WhatsApp's Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://www.facebook.com/privacy/policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline"
              >
                Meta's Privacy Policy
              </a>
              .
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              5. Data Storage and Security
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Your data is stored securely in a PostgreSQL database hosted on
              Supabase. Our backend is hosted on Render. We use
              industry-standard security practices including encrypted
              connections (HTTPS) and secure authentication tokens. We do not
              store WhatsApp access tokens beyond what is necessary for the
              service to function.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              6. Data Retention
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We retain your account data and message history for as long as
              your account is active. If you delete your account, we will delete
              your data within 30 days. Your customers' message data is retained
              as part of your conversation history and is deleted when your
              account is deleted.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              7. Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-4">
              You have the right to:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Access the
                personal data we hold about you
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Request
                correction of inaccurate data
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Request
                deletion of your account and associated data
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Disconnect your
                WhatsApp Business Account from Convyr at any time
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-sm mt-4">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:wycliffkimani9@gmail.com"
                className="text-[#25D366] hover:underline"
              >
                wycliffkimani9@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              8. Cookies
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr uses minimal cookies strictly necessary for authentication
              and session management. We do not use tracking cookies or
              third-party advertising cookies.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              9. Changes to This Policy
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We may update this Privacy Policy from time to time. When we do,
              we will update the "Last updated" date at the top of this page and
              notify active users by email if the changes are significant.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              10. Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              If you have any questions about this Privacy Policy or how we
              handle your data, contact us at:
            </p>
            <div className="mt-4 flex flex-col gap-1 text-sm text-gray-600">
              <p>
                <span className="font-medium text-[#0F172A]">Company:</span>{" "}
                DevCraft Solutions
              </p>
              <p>
                <span className="font-medium text-[#0F172A]">Email:</span>{" "}
                <a
                  href="mailto:wycliffkimani9@gmail.com"
                  className="text-[#25D366] hover:underline"
                >
                  wycliffkimani9@gmail.com
                </a>
              </p>
              <p>
                <span className="font-medium text-[#0F172A]">Address:</span>{" "}
                Spur Mall, Ruiru, Kiambu County, Kenya
              </p>
              <p>
                <span className="font-medium text-[#0F172A]">WhatsApp:</span>{" "}
                +254 793 790 005
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F172A] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Any questions about your data?
          </h2>
          <p className="text-gray-400 mb-8">
            We're always available to answer your privacy questions.
          </p>
          <a
            href="mailto:wycliffkimani9@gmail.com"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3 rounded-lg text-sm font-semibold transition-colors inline-block"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
