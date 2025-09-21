"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { FunnelTracker } from "../../lib/funnel";
import { trackEvent } from "../../lib/tracking";
import Image from "next/image";

export default function HeroSection({ onCTAClick }) {
  const [step, setStep] = useState("email");
  const [emailSaved, setEmailSaved] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vh, setVh] = useState(800);
  const [particleCount, setParticleCount] = useState(14);
  const [remainingSpots, setRemainingSpots] = useState(100);
  const prefersReducedMotion = useReducedMotion();
  const submittedRef = useRef(false);

  // Vereinfachtes Angebot
  const currentOffer = { title: "Dubai-Schokolade", emoji: "🍫" };

  // Forms
  const emailForm = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });
  const nameForm = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });

  const funnel = useMemo(() => new FunnelTracker(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateVh = () => setVh(window.innerHeight);
    updateVh();
    window.addEventListener("resize", updateVh);

    const mq = window.matchMedia("(max-width: 640px)");
    const setCount = () => setParticleCount(mq.matches ? 8 : 14);
    setCount();
    mq.addEventListener?.("change", setCount);

    setRemainingSpots(Math.floor(Math.random() * 81) + 20);

    return () => {
      window.removeEventListener("resize", updateVh);
      mq.removeEventListener?.("change", setCount);
    };
  }, []);

  // Deterministische Partikel-Seeds
  const seeds = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const rng = (x) => {
        const t = Math.sin((i + 1) * 9301 + x * 49297) * 233280;
        return t - Math.floor(t);
      };
      return {
        leftPct: rng(1) * 100,
        delay: rng(2) * 8,
        duration: 8 + rng(3) * 4,
        xDrift: Math.sin(i) * 100,
      };
    });
  }, [particleCount]);

  const sweetImages = ["/test.svg", "/test.svg", "/test.svg"];

  const getUTMParameter = (param) => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(param);
  };

  // API Call Helper
  const callNewsletterAPI = async (data) => {
    return fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        source: "hero_offer",
        offer: currentOffer.title,
        utm_source: getUTMParameter("utm_source") || "direct",
        utm_medium: getUTMParameter("utm_medium") || "organic",
        utm_campaign: getUTMParameter("utm_campaign") || "default",
        statusIfNew: "subscribed",
      }),
    });
  };

  // Email Step
  const onSubmitEmail = async (data) => {
    if (isLoading || submittedRef.current) return;
    setIsLoading(true);

    try {
      submittedRef.current = true;
      funnel.trackEmailCapture(data.email);
      trackEvent("lead_form_start", { source: "hero_section" });

      const res = await callNewsletterAPI({ email: data.email, firstName: "" });
      if (!res.ok) throw new Error("Subscription failed");

      setEmailSaved(data.email);
      setStep("name");
      submittedRef.current = false;

      trackEvent("newsletter_email_captured", { method: "hero_section" });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      trackEvent("form_error", { type: "newsletter_signup_email" });
      submittedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // Name Step
  const onSubmitName = async (data) => {
    if (!emailSaved) return;
    setIsLoading(true);
    
    try {
      const res = await callNewsletterAPI({ email: emailSaved, firstName: data.firstName });
      if (!res.ok) throw new Error("Update failed");

      setStep("done");
      trackEvent("complete_registration", { method: "newsletter", value: 1.0, currency: "EUR" });
    } catch (error) {
      console.error("Name update error:", error);
      trackEvent("form_error", { type: "newsletter_signup_name" });
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (step === "done") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center max-w-2xl mx-auto px-4"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }} 
            className="text-8xl mb-6"
          >
            🎉
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              WILLKOMMEN!
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-8">
            Deine <strong>{currentOffer.title}</strong> ist unterwegs! {currentOffer.emoji}
          </p>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
            <p className="text-lg text-gray-600 mb-1">
              📧 Prüfe dein Postfach für Details & deinen exklusiven Rabattcode!
            </p>
            <p className="text-sm text-gray-500">Bitte auch den Spam-Ordner prüfen.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Fallende Bilder */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {seeds.map((s, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{ 
                y: [-100, vh + 100], 
                x: [0, s.xDrift], 
                rotate: [0, 360] 
              }}
              transition={{ 
                duration: s.duration, 
                repeat: Infinity, 
                ease: "linear", 
                delay: s.delay 
              }}
              style={{ 
                left: `${s.leftPct}%`, 
                top: "-100px" 
              }}
            >
              <img
                src={sweetImages[i % sweetImages.length]}
                alt="Süßigkeit"
                className="w-32 h-32 md:w-40 md:h-40 opacity-80 object-cover rounded-lg"
                loading="lazy"
                onError={(e) => e.target.style.display = 'none'}
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-center mb-12"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <Image
              src="/sweeetts.svg"
              alt="Sweets aus aller Welt – Logo"
              fill
              priority
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 80px, 96px"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          {/* Headline */}
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                SÜSSIGKEITEN
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">aus aller</span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                WELT! 🌍
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3 }} 
              className="text-xl md:text-2xl text-gray-700 font-semibold"
            >
              Geliebt auf TikTok, Instagram und mehr – schließ dich der Community an!
            </motion.p>
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }} 
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/30">
              {step === "email" && (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 drop-shadow-sm">
                    🎁 Deine süße Reise beginnt hier!
                  </h3>
                  <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="email"
                          placeholder="Deine E-Mail für gratis Dubai-Schokolade 🍫"
                          {...emailForm.register("email", {
                            required: "E-Mail ist erforderlich",
                            pattern: { 
                              value: /\S+@\S+\.\S+/, 
                              message: "Bitte gib eine gültige E-Mail Adresse ein" 
                            },
                          })}
                          className="w-full px-6 py-5 text-lg border-2 border-white/30 bg-white/40 backdrop-blur-sm rounded-2xl focus:border-pink-500 focus:bg-white/60 focus:outline-none transition-all placeholder:text-gray-600"
                        />
                        {emailForm.formState.errors.email && (
                          <p className="text-red-600 text-sm mt-2 text-left font-medium">
                            {emailForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-5 px-10 rounded-2xl shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 min-w-[200px]"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                            Wird gesendet...
                          </>
                        ) : (
                          <>
                            <Mail className="w-6 h-6" />
                            Jetzt beitreten
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                  <p className="text-xs text-gray-700 mt-4 text-center drop-shadow-sm">
                    🔒 100% kostenlos • Jederzeit abbestellbar • Keine Spam-Mails
                  </p>
                </>
              )}

              {step === "name" && (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 drop-shadow-sm">Fast geschafft!</h3>
                    <p className="text-gray-700 drop-shadow-sm">Wie dürfen wir dich ansprechen?</p>
                  </div>
                  
                  <form onSubmit={nameForm.handleSubmit(onSubmitName)} className="space-y-5">
                    <input
                      type="text"
                      placeholder="Dein Vorname"
                      {...nameForm.register("firstName", { 
                        required: "Bitte gib deinen Vornamen ein",
                        minLength: { value: 2, message: "Mindestens 2 Zeichen" }
                      })}
                      className="w-full px-6 py-5 text-lg border-2 border-white/30 bg-white/40 backdrop-blur-sm rounded-2xl focus:border-pink-500 focus:bg-white/60 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                    {nameForm.formState.errors.firstName && (
                      <p className="text-red-600 text-sm text-left font-medium">
                        {nameForm.formState.errors.firstName.message}
                      </p>
                    )}

                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-5 px-6 rounded-2xl shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-70"
                    >
                      {isLoading ? "Speichere..." : "Dubai-Schokolade sichern! 🍫"}
                    </motion.button>
                  </form>
                  
                  <p className="text-xs text-gray-700 mt-4 text-center drop-shadow-sm">
                    Optional, aber hilft uns bei der persönlichen Ansprache.
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* CTA Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.7 }} 
            className="bg-gradient-to-r from-amber-400/80 to-orange-500/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl inline-block shadow-xl border border-white/20"
          >
            <span className="font-bold text-xl drop-shadow-sm">
              🔥 GRATIS: {currentOffer.title} für die ersten {remainingSpots} Anmeldungen!
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}