import Link from "next/link";
import Footer from "@/components/marketing/Footer";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";

export default function TermsPage() {
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
            Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              By creating an account or using Convyr, you agree to these Terms
              of Service and our{" "}
              <Link href="/privacy" className="text-[#25D366] hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use Convyr. These terms apply to all
              users of the platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              2. Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr is a WhatsApp Business Automation platform operated by
              DevCraft Solutions, a business registered in Kenya (Registration
              No. BN-WLS2EKMK). Our registered address is Chandaria Business
              Centre, Northern By-Pass, Kiambu, Kenya. You can contact us at{" "}
              <a
                href="mailto:admin@devcraftechnologies.tech"
                className="text-[#25D366] hover:underline"
              >
                admin@devcraftechnologies.tech
              </a>
              .
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              3. Use of the Service
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-4">
              By using Convyr, you agree to:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Provide
                accurate information when registering your account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Use Convyr only
                for lawful business communication purposes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Comply with
                WhatsApp's Business Policy and Meta's Platform Terms
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Not use Convyr
                to send spam, unsolicited messages, or illegal content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Not attempt to
                reverse engineer, hack, or disrupt the platform
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Keep your
                account credentials secure and not share them with others
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              4. WhatsApp and Meta Compliance
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr operates through the Meta WhatsApp Business Cloud API. Your
              use of Convyr is subject to{" "}
              <a
                href="https://www.whatsapp.com/legal/business-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline"
              >
                WhatsApp's Business Policy
              </a>{" "}
              and{" "}
              <a
                href="https://developers.facebook.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline"
              >
                Meta's Platform Terms
              </a>
              . You are responsible for ensuring your use of WhatsApp messaging
              through Convyr complies with all applicable laws and Meta's
              policies. Convyr is not responsible for any account restrictions
              imposed by Meta on your WhatsApp Business Account.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              5. Subscription and Payments
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-4">
              Convyr is a paid subscription service. By subscribing:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Payments are
                processed via M-Pesa through PayHero
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Subscriptions
                are billed monthly and renew automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> You can cancel
                your subscription at any time from your settings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> Refunds are not
                provided for partial billing periods
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#25D366] mt-0.5">•</span> We reserve the
                right to change pricing with 30 days notice to active
                subscribers
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              6. Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr and all associated branding, code, and content are owned by
              DevCraft Solutions. You may not copy, reproduce, or distribute any
              part of the platform without written permission. Your business
              data and message content remain your property — we do not claim
              ownership over content you create or messages sent through your
              WhatsApp account.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Convyr is provided on an "as is" basis. To the maximum extent
              permitted by law, DevCraft Solutions shall not be liable for any
              indirect, incidental, or consequential damages arising from your
              use of the platform, including but not limited to loss of
              business, loss of data, or service interruptions caused by
              third-party providers including Meta, Supabase, or Render.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              8. Account Termination
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              You may delete your account at any time from your dashboard
              settings. We reserve the right to suspend or terminate accounts
              that violate these terms, engage in abusive behaviour, or are used
              for illegal purposes. Upon termination, your data will be deleted
              within 30 days in accordance with our Privacy Policy.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              9. Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              These Terms of Service are governed by the laws of Kenya. Any
              disputes arising from the use of Convyr shall be subject to the
              jurisdiction of Kenyan courts.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              10. Changes to These Terms
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We may update these Terms of Service from time to time. When we
              do, we will update the "Last updated" date at the top of this page
              and notify active users by email if the changes are significant.
              Continued use of Convyr after changes constitutes acceptance of
              the updated terms.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">
              11. Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              For any questions about these Terms of Service, contact us at:
            </p>
            <div className="mt-4 flex flex-col gap-1 text-sm text-gray-600">
              <p>
                <span className="font-medium text-[#0F172A]">Company:</span>{" "}
                DevCraft Solutions
              </p>
              <p>
                <span className="font-medium text-[#0F172A]">Email:</span>{" "}
                <a
                  href="mailto:admin@devcraftechnologies.tech"
                  className="text-[#25D366] hover:underline"
                >
                  admin@devcraftechnologies.tech
                </a>
              </p>
              <p>
                <span className="font-medium text-[#0F172A]">Address:</span>{" "}
                Chandaria Business Centre, Northern By-Pass, Kiambu, Kenya
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
            Questions about our terms?
          </h2>
          <p className="text-gray-400 mb-8">
            We're happy to clarify anything before you get started.
          </p>
          <a
            href="mailto:admin@devcraftechnologies.tech"
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
