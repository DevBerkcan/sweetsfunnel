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
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [remainingSpots, setRemainingSpots] = useState(100);
  const prefersReducedMotion = useReducedMotion();
  const submittedRef = useRef(false);
  const offerIntervalRef = useRef(null);

  // Forms separat halten, damit die Validierungen nicht kollidieren
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    setFocus: setEmailFocus,
  } = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors },
    setFocus: setNameFocus,
  } = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });

  // Angebotsrotation für mehr Dynamik
  const offers = useMemo(
    () => [
      { title: "Dubai-Schokolade", description: "Kostenlos nach Hause", emoji: "🍫", color: "text-amber-600" },
      { title: "USA-Süßigkeiten", description: "Exklusiv für Newsletter-Abonnenten", emoji: "🇺🇸", color: "text-red-500" },
      { title: "Asien-Snacks", description: "Limitierte Edition", emoji: "🥠", color: "text-orange-500" },
    ],
    []
  );

  const funnel = useMemo(() => new FunnelTracker(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateVh = () => setVh(window.innerHeight);
    updateVh();
    window.addEventListener("resize", updateVh);

    const mq = window.matchMedia("(max-width: 640px)");
    const setCount = () => setParticleCount(mq.matches ? 8 : 14);
    setCount();
    if (mq.addEventListener) {
      mq.addEventListener("change", setCount);
    }

    offerIntervalRef.current = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4000);

    setRemainingSpots(Math.floor(Math.random() * 81) + 20);

    const focusTimer = setTimeout(() => {
      if (step === "email") {
        setEmailFocus("email");
      } else if (step === "name") {
        setNameFocus("firstName");
      }
    }, 600);

    return () => {
      window.removeEventListener("resize", updateVh);
      if (mq.removeEventListener) {
        mq.removeEventListener("change", setCount);
      }
      if (offerIntervalRef.current) clearInterval(offerIntervalRef.current);
      clearTimeout(focusTimer);
    };
  }, [offers.length, setEmailFocus, setNameFocus, step]);

  // Deko-Partikel - deterministische Seeds
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

  // Deine fallenden Bilder
  const sweetImages = ["/test.svg", "/test.svg", "/test.svg"];

  const getUTMParameter = (param) => {
    if (typeof window === "undefined") return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const currentOffer = offers[currentOfferIndex];

  // STEP 1: E-Mail absenden
  const onSubmitEmail = async (data) => {
    if (isLoading || submittedRef.current) return;
    setIsLoading(true);

    try {
      submittedRef.current = true;

      funnel.trackEmailCapture(data.email);
      trackEvent("lead_form_start", {
        source: "hero_section",
        offer: currentOffer.title.toLowerCase(),
      });

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: "", // Leer für Step 1
          source: "hero_offer",
          offer: currentOffer.title,
          utm_source: getUTMParameter("utm_source") || "direct",
          utm_medium: getUTMParameter("utm_medium") || "organic",
          utm_campaign: getUTMParameter("utm_campaign") || "default",
          statusIfNew: "subscribed", // Oder "pending" für Double-Opt-In
        }),
      });

      if (!res.ok) throw new Error("Subscription failed");

      setEmailSaved(data.email);
      setStep("name");
      submittedRef.current = false; // Reset für nächsten Step

      trackEvent("newsletter_email_captured", {
        method: "hero_section",
        offer: currentOffer.title.toLowerCase(),
        source: getUTMParameter("utm_source") || "direct",
      });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      trackEvent("form_error", { type: "newsletter_signup_email", error: error.message });
      submittedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Name absenden - auch als POST (deine API macht intern PUT)
  const onSubmitName = async (data) => {
    if (!emailSaved) return;
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST", // Deine API erwartet POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailSaved,
          firstName: data.firstName,
          source: "hero_offer",
          offer: currentOffer.title,
          utm_source: getUTMParameter("utm_source") || "direct",
          utm_medium: getUTMParameter("utm_medium") || "organic", 
          utm_campaign: getUTMParameter("utm_campaign") || "default",
          statusIfNew: "subscribed", // Wichtig: Status beibehalten
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }

      setStep("done");
      trackEvent("complete_registration", { 
        method: "newsletter", 
        value: 1.0, 
        currency: "EUR",
        offer: currentOffer.title.toLowerCase()
      });
    } catch (error) {
      console.error("Name update error:", error);
      trackEvent("form_error", { type: "newsletter_signup_name", error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Success-Screen
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
            aria-hidden
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
                className="w-40 h-40 md:w-40 md:h-40 opacity-80 object-cover rounded-lg"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.log('Bild konnte nicht geladen werden:', e.target.src);
                }}
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Logo mittig */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="flex justify-center mb-8"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <Image
              src="/sweeetts.svg"
              alt="Sweets aus aller Welt – Logo"
              fill
              priority
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 80px, 96px"
              onError={(e) => {
                console.log('Logo konnte nicht geladen werden');
              }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          {/* Social Proof Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg border border-pink-100"
          >
            <div className="flex -space-x-2" aria-hidden>
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="w-7 h-7 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full border-2 border-white shadow-sm" 
                />
              ))}
            </div>
            <span className="font-bold text-gray-800 text-lg">Über 50.000 zufriedene Kunden 🤩</span>
          </motion.div>

          {/* Main Headline */}
          <div className="mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }} 
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                SÜSSIGKEITEN
              </span>
              <br />
              <span className="text-gray-800">aus aller</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                WELT! 🌍
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4 }} 
              className="text-xl md:text-2xl text-gray-700 font-semibold mb-6"
            >
              Geliebt auf TikTok, Instagram und mehr – schließ dich der Community an!
            </motion.p>

           
          </div>

          {/* MULTI-STEP FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8 }} 
            className="max-w-2xl mx-auto mb-10"
          >
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-pink-100">
              
              {/* STEP 1: EMAIL */}
              {step === "email" && (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    🎁 Deine süße Reise beginnt hier!
                  </h3>
                  <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-5" noValidate>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="Deine E-Mail für gratis Dubai-Schokolade 🍫"
                          aria-invalid={!!emailErrors.email}
                          aria-describedby={emailErrors.email ? "email-error" : undefined}
                          {...registerEmail("email", {
                            required: "E-Mail ist erforderlich",
                            pattern: { 
                              value: /\S+@\S+\.\S+/, 
                              message: "Bitte gib eine gültige E-Mail Adresse ein" 
                            },
                          })}
                          className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-all duration-300 shadow-sm"
                        />
                        {emailErrors.email && (
                          <p id="email-error" className="text-red-500 text-sm mt-2 text-left">
                            {emailErrors.email.message}
                          </p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-5 px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 whitespace-nowrap min-w-[200px]"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                            Wird gesendet...
                          </>
                        ) : (
                          <>
                            <Mail className="w-6 h-6" aria-hidden />
                            Jetzt beitreten
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    🔒 100% kostenlos • Jederzeit abbestellbar • Keine Spam-Mails
                  </p>
                </>
              )}

              {/* STEP 2: NAME */}
              {step === "name" && (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      Fast geschafft!
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Wie dürfen wir dich ansprechen?
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmitName(onSubmitName)} className="space-y-5" noValidate>
                    <div>
                      <input
                        type="text"
                        placeholder="Dein Vorname"
                        autoComplete="given-name"
                        {...registerName("firstName", { 
                          required: "Bitte gib deinen Vornamen ein",
                          minLength: { value: 2, message: "Mindestens 2 Zeichen" }
                        })}
                        className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-all duration-300 shadow-sm"
                      />
                      {nameErrors.firstName && (
                        <p className="text-red-500 text-sm mt-2 text-left">
                          {nameErrors.firstName.message}
                        </p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent inline-block mr-2" />
                          Speichere...
                        </>
                      ) : (
                        "Dubai-Schokolade sichern! 🍫"
                      )}
                    </motion.button>
                  </form>
                  
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Optional, aber hilft uns bei der persönlichen Ansprache.
                  </p>
                </>
              )}
            </div>
          </motion.div>


           {/* Exklusiv-Angebot */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.6 }} 
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-2xl inline-block mb-6 shadow-xl"
            >
              <span className="font-bold text-xl">
                🔥 GRATIS: {currentOffer.title} für die ersten {remainingSpots} Anmeldungen!
              </span>
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
}