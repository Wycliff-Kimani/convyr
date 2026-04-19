"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, Smartphone, Bot, Sparkles } from "lucide-react";

const ONBOARDING_KEY = "convyr_onboarded";

export default function OnboardingWizard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem(ONBOARDING_KEY, "true");
      setVisible(false);
      setExiting(false);
    }, 300);
  };

  const next = () => {
    if (step < 3) setStep((s) => s + 1);
    else dismiss();
  };

  const goToSettings = () => {
    dismiss();
    router.push("/settings");
  };

  const steps = [
    {
      icon: <Sparkles size={32} className="text-[#25D366]" />,
      title: "Welcome to Convyr! 🎉",
      subtitle: "Your WhatsApp business is about to get a lot smarter.",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Convyr automatically replies to your customers 24/7 — so you never
            miss a sale while you sleep, eat, or serve other customers.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { icon: "⚡", label: "Auto-replies", sub: "Instant responses" },
              { icon: "📊", label: "Analytics", sub: "Track your growth" },
              { icon: "🤖", label: "AI powered", sub: "Smart suggestions" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-[#0F172A]">
                  {item.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            This quick setup takes less than 2 minutes.
          </p>
        </div>
      ),
      cta: "Let's get started →",
      ctaAction: next,
    },
    {
      icon: <Bot size={32} className="text-violet-500" />,
      title: "Your robots are ready 🤖",
      subtitle: "We've already set up 5 auto-reply rules for you.",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            These rules automatically reply when customers message certain
            keywords — no more copy-pasting the same answers.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { keyword: "hi / hello", reply: "Welcome greeting" },
              { keyword: "price", reply: "Price inquiry response" },
              { keyword: "order", reply: "Order confirmation" },
              { keyword: "delivery", reply: "Delivery info" },
            ].map((rule) => (
              <div
                key={rule.keyword}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#0F172A]">
                    IF message has:{" "}
                    <span className="text-[#25D366]">"{rule.keyword}"</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    → {rule.reply}
                  </p>
                </div>
                <CheckCircle2 size={16} className="text-[#25D366] shrink-0" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Edit or add more rules anytime in{" "}
            <span className="text-[#25D366] font-semibold">Automations</span>.
          </p>
        </div>
      ),
      cta: "Got it, next →",
      ctaAction: next,
    },
    {
      icon: <Smartphone size={32} className="text-blue-500" />,
      title: "Connect your WhatsApp 📱",
      subtitle: "Link your WhatsApp Business number to go live.",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Once connected, every message your customers send will appear here —
            and your auto-replies fire instantly.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              { n: "1", text: "Go to Settings → WhatsApp Connection" },
              {
                n: "2",
                text: "Click 'Connect WhatsApp' and follow Meta's steps",
              },
              {
                n: "3",
                text: "Your number is linked — automation starts immediately",
              },
            ].map((item) => (
              <div key={item.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.n}
                </div>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 font-medium">
              💡 You can test with the sandbox number while waiting for Meta
              approval.
            </p>
          </div>
        </div>
      ),
      cta: "Go to Settings →",
      ctaAction: goToSettings,
    },
    {
      icon: <CheckCircle2 size={32} className="text-[#25D366]" />,
      title: "You're all set! 🚀",
      subtitle: "Convyr is ready to start working for you.",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Here's what to do next to get the most out of Convyr:
          </p>
          <div className="flex flex-col gap-2">
            {[
              {
                emoji: "💬",
                action: "Text your test number",
                sub: "Try 'hello', 'price', or 'order'",
              },
              {
                emoji: "📝",
                action: "Customize your auto-replies",
                sub: "Make them sound like your business",
              },
              {
                emoji: "📊",
                action: "Check your dashboard daily",
                sub: "See time saved and missed leads",
              },
              {
                emoji: "⭐",
                action: "Tag conversations",
                sub: "Mark outcomes as Sale, Lost, or Pending",
              },
            ].map((item) => (
              <div
                key={item.action}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5"
              >
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A]">
                    {item.action}
                  </p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      cta: "Go to my dashboard →",
      ctaAction: dismiss,
    },
  ];

  if (!visible) return null;

  const current = steps[step];

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md transition-all duration-300 ${exiting ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        {/* Skip */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-2 bg-[#25D366]"
                  : i < step
                    ? "w-2 h-2 bg-[#25D366]/40"
                    : "w-2 h-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
              {current.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {current.title}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <div>{current.content}</div>

          <button
            onClick={current.ctaAction}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-2xl text-sm font-bold transition-colors"
          >
            {current.cta}
          </button>

          {step < 3 && (
            <button
              onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-600 text-center transition-colors"
            >
              Skip setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
