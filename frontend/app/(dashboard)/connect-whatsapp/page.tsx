"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const META_APP_ID = "1291380596389693";

export default function ConnectWhatsAppPage() {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v21.0",
      });
      setSdkReady(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }
  }, []);

  const handleConnect = () => {
    if (!sdkReady || !window.FB) {
      setErrorMessage("Facebook SDK not loaded. Please refresh and try again.");
      setStatus("error");
      return;
    }

    setStatus("connecting");

    window.FB.login(
      async (response: any) => {
        if (response.authResponse?.code) {
          try {
            await api.connectWhatsApp(response.authResponse.code);
            setStatus("success");
            setTimeout(() => router.push("/overview"), 2000);
          } catch (err: any) {
            setStatus("error");
            setErrorMessage(
              err.message || "Failed to connect WhatsApp. Please try again.",
            );
          }
        } else {
          setStatus("error");
          setErrorMessage(
            "WhatsApp connection was cancelled or failed. Please try again.",
          );
        }
      },
      {
        config_id: META_APP_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2C8.268 2 2 8.268 2 16c0 2.4.632 4.652 1.74 6.6L2 30l7.6-1.72A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
              fill="#25D366"
            />
            <path
              d="M22.4 19.2c-.32-.16-1.88-.92-2.16-1.04-.28-.12-.48-.16-.68.16-.2.32-.76.96-.92 1.16-.16.2-.32.2-.64.08-.32-.16-1.36-.48-2.6-1.56-.96-.84-1.6-1.88-1.8-2.2-.16-.32 0-.48.16-.64.16-.16.32-.4.48-.6.16-.2.2-.32.32-.52.12-.2.04-.4-.04-.56-.08-.16-.68-1.64-.92-2.24-.24-.6-.48-.52-.68-.52h-.56c-.2 0-.52.08-.8.36-.28.28-1.04 1-1.04 2.44s1.08 2.84 1.24 3.04c.16.2 2.12 3.24 5.16 4.52.72.32 1.28.52 1.72.64.72.2 1.36.16 1.88.12.56-.08 1.88-.76 2.16-1.52.28-.76.28-1.4.2-1.52-.08-.12-.28-.2-.56-.36z"
              fill="white"
            />
          </svg>
        </div>

        {status === "idle" && (
          <>
            <h1 className="text-xl font-bold text-[#0F172A] mb-2">
              Connect your WhatsApp
            </h1>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Link your WhatsApp Business number to Convyr to start automating
              customer replies. This takes under 2 minutes.
            </p>
            <div className="flex flex-col gap-3 text-left mb-8">
              {[
                "Log in with your Facebook account",
                "Select your WhatsApp Business number",
                "Authorize Convyr to manage messages",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#25D366]">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{step}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleConnect}
              disabled={!sdkReady}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {sdkReady ? "Connect WhatsApp" : "Loading..."}
            </button>
            <p className="text-xs text-gray-300 mt-4">
              You can disconnect at any time from your settings.
            </p>
          </>
        )}

        {status === "connecting" && (
          <>
            <Loader2
              size={32}
              className="text-[#25D366] animate-spin mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-[#0F172A] mb-2">
              Connecting...
            </h1>
            <p className="text-sm text-gray-400">
              Complete the steps in the Facebook popup to finish connecting your
              WhatsApp number.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-[#25D366] mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#0F172A] mb-2">
              WhatsApp connected!
            </h1>
            <p className="text-sm text-gray-400">
              Your WhatsApp Business number is now connected. Redirecting to
              your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#0F172A] mb-2">
              Connection failed
            </h1>
            <p className="text-sm text-gray-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => setStatus("idle")}
              className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
