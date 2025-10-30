"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail, User, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { FunnelTracker } from "../../lib/funnel";
import { trackEvent } from "../../lib/tracking";
import Image from "next/image";

export default function HeroSection({ onCTAClick }) {
  const [step, setStep] = useState("contact"); // Only "contact" and "done" steps

  // Consent-State + Timestamp
  const [consent, setConsent] = useState(false);
  const [consentTs, setConsentTs] = useState(null);
  const [consentError, setConsentError] = useState(""); // Separate consent error state

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", whatsapp: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [vh, setVh] = useState(800);
  const [particleCount, setParticleCount] = useState(10);
  const [remainingSpots, setRemainingSpots] = useState(100);
  const prefersReducedMotion = useReducedMotion();
  const submittedRef = useRef(false);

  const currentOffer = { title: "Dubai-Schokolade", emoji: "🍫" };

  const contactForm = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });

  const funnel = useMemo(() => new FunnelTracker(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateVh = () => setVh(window.innerHeight);
    updateVh();
    window.addEventListener("resize", updateVh);

    const mq = window.matchMedia("(max-width: 768px)");
    const setCount = () => setParticleCount(mq.matches ? 5 : 10);
    setCount();
    mq.addEventListener?.("change", setCount);

    setRemainingSpots(Math.floor(Math.random() * 401) + 100); // 100-500

    return () => {
      window.removeEventListener("resize", updateVh);
      mq.removeEventListener?.("change", setCount);
    };
  }, []);

  const seeds = useMemo(() => {
    // Fixed: Ensure particleCount is always a valid number
    const count = (typeof particleCount === "number" && particleCount > 0) ? particleCount : 10;
    return Array.from({ length: count }, (_, i) => {
      const rng = (x) => {
        const t = Math.sin((i + 1) * 9301 + x * 49297) * 233280;
        return t - Math.floor(t);
      };
      return { 
        leftPct: rng(1) * 100, 
        delay: rng(2) * 8, 
        duration: 8 + rng(3) * 4, 
        xDrift: Math.sin(i) * 100 
      };
    });
  }, [particleCount]);

  const sweetImages = ["/test.svg", "/test.svg", "/test.svg"];

  const getUTMParameter = (param) => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(param);
  };

  // API Call with DOI
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
        statusIfNew: "pending", // Double-Opt-In
      }),
    });
  };

  const onSubmitContact = async (data) => {
    if (isLoading || submittedRef.current) return;

    // Clear previous consent error
    setConsentError("");

    // Validate consent separately (not through react-hook-form)
    if (!consent) {
      setConsentError("Bitte stimme der Datenschutzerklärung zu.");
      return;
    }

    setIsLoading(true);
    try {
      submittedRef.current = true;
      const ts = new Date().toISOString();
      setConsentTs(ts);

      // Track consent
      trackEvent("newsletter_consent_given", { ts, source: "hero_section" });
      funnel.trackEmailCapture(data.email);
      trackEvent("lead_form_start", { source: "hero_section" });

      const res = await callNewsletterAPI({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.whatsapp || "", // WhatsApp number (optional)
        // Consent metadata for backend
        consent: true,
        consentTs: ts,
        consentText: "Einwilligung in den Erhalt von E-Mails und zur Abwicklung der Gratis-Aktion, Hinweise in der Datenschutzerklärung."
      });

      if (!res.ok) throw new Error("Subscription failed");

      setStep("done");
      submittedRef.current = false;
      trackEvent("newsletter_contact_captured", { method: "hero_section", whatsapp_provided: !!data.whatsapp });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      trackEvent("form_error", { type: "newsletter_signup_contact" });
      submittedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl mb-6">🎉</motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">WILLKOMMEN!</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-6">Deine <strong>{currentOffer.title}</strong> ist unterwegs! {currentOffer.emoji}</p>
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg">
            <p className="text-base text-gray-600 mb-1">📧 Bitte bestätige deine Anmeldung in der E-Mail (Double-Opt-In).</p>
            <p className="text-sm text-gray-500 mb-2">Danach erhältst du alle Informationen zur kostenlosen Dubai-Schokolade.</p>
            <p className="text-sm text-gray-500">Falls nichts kommt: Spam-Ordner prüfen.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 overflow-hidden px-4 py-8">
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {seeds.map((s, i) => (
            <motion.div key={i} className="absolute"
              animate={{ y: [-100, vh + 100], x: [0, s.xDrift], rotate: [0, 360] }}
              transition={{ duration: s.duration, repeat: Infinity, ease: "linear", delay: s.delay }}
              style={{ left: `${s.leftPct}%`, top: "-100px" }}>
              <img src={sweetImages[i % sweetImages.length]} alt="Süßigkeit"
                   className="w-24 h-24 md:w-32 md:h-32 opacity-70 object-cover rounded-lg" loading="lazy"
                   onError={(e) => (e.target.style.display = "none")} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="container mx-auto text-center relative z-10 max-w-5xl">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
          <div className="relative w-20 h-20 md:w-28 md:h-28">
            <Image src="/sweeetts.svg" alt="Sweets aus aller Welt – Logo" fill priority className="object-contain drop-shadow-lg"
                   sizes="(max-width: 768px) 80px, 112px" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">JETZT Gratis</span><br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">Dubai-Schokolade</span><br />
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">sichern 🍫</span>
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-2 max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-gray-800 font-bold leading-relaxed">
                Tritt unserer Community bei und wir schicken dir eine exklusive Dubai-Schokolade <span className="text-pink-600">kostenlos nach Hause</span>
              </p>
              <p className="text-base md:text-lg text-amber-600 font-semibold">Nur solange der Vorrat reicht – Aktion für die ersten 500 bestätigten Anmeldungen</p>
            </motion.div>
          </div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-xl inline-block shadow-lg border border-white/20">
            <span className="font-bold text-lg md:text-xl drop-shadow-sm">🔥 Nur noch {remainingSpots} von 500 verfügbar!</span>
          </motion.div>

          {/* FORM */}
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-2xl mx-auto">
            <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/30">

              {/* CONTACT STEP */}
              {step === "contact" && (
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 drop-shadow-sm">🍫 Gratis Dubai-Schokolade sichern!</h3>

                  <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-4">
                    {/* Vorname */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Vorname *"
                          {...contactForm.register("firstName", { required: "Vorname ist erforderlich", minLength: { value: 2, message: "Mindestens 2 Zeichen" } })}
                          className="w-full pl-12 pr-6 py-4 text-base border-2 border-white/30 bg-white/40 rounded-xl focus:border-pink-500 focus:bg-white/60 focus:outline-none placeholder:text-gray-600"
                        />
                      </div>
                      {contactForm.formState.errors.firstName && <p className="text-red-600 text-sm mt-2 text-left font-medium">{contactForm.formState.errors.firstName.message}</p>}
                    </div>

                    {/* Nachname (optional) */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Nachname (optional)"
                          {...contactForm.register("lastName")}
                          className="w-full pl-12 pr-6 py-4 text-base border-2 border-white/30 bg-white/40 rounded-xl focus:border-pink-500 focus:bg-white/60 focus:outline-none placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    {/* E-Mail */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="email"
                          placeholder="E-Mail *"
                          {...contactForm.register("email", {
                            required: "E-Mail ist erforderlich",
                            pattern: { value: /\S+@\S+\.\S+/, message: "Bitte gib eine gültige E-Mail Adresse ein" }
                          })}
                          className="w-full pl-12 pr-6 py-4 text-base border-2 border-white/30 bg-white/40 rounded-xl focus:border-pink-500 focus:bg-white/60 focus:outline-none placeholder:text-gray-600"
                        />
                      </div>
                      {contactForm.formState.errors.email && <p className="text-red-600 text-sm mt-2 text-left font-medium">{contactForm.formState.errors.email.message}</p>}
                    </div>

                    {/* WhatsApp (optional) */}
                    <div>
                      <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <input
                          type="tel"
                          placeholder="WhatsApp Nummer (optional)"
                          {...contactForm.register("whatsapp")}
                          className="w-full pl-12 pr-6 py-4 text-base border-2 border-white/30 bg-white/40 rounded-xl focus:border-pink-500 focus:bg-white/60 focus:outline-none placeholder:text-gray-600"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-1">Für schnellere Updates zur Lieferung</p>
                    </div>

                    {/* Consent Checkbox */}
                    <label className="flex items-start gap-3 text-left bg-white/30 rounded-xl p-3">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          if (e.target.checked) {
                            setConsentError(""); // Clear error when checked
                          }
                        }}
                        className="mt-1 h-4 w-4 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-800">
                        Ich willige ein, E-Mails von <strong>Sweets aus aller Welt</strong> zu erhalten und dass meine Daten zur Abwicklung der Gratis-Aktion verarbeitet werden. Hinweise in der{" "}
                        <a href="https://sweetsausallerwelt.de/pages/datenschutzerklarung" target="_blank" rel="noopener noreferrer" className="underline font-medium">Datenschutzerklärung</a>. Abmeldung jederzeit möglich.
                      </span>
                    </label>
                    {consentError && (
                      <p className="text-red-600 text-sm -mt-2">{consentError}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      type="submit"
                      disabled={isLoading || !consent}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-70 flex items-center justify-center gap-3 text-base"
                    >
                      {isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> Wird verarbeitet...</>) : (<>Jetzt anmelden & Schokolade sichern! <ChevronRight className="w-5 h-5" /></>)}
                    </motion.button>
                  </form>

                  {/* Legal links */}
                  <div className="text-xs text-gray-700 mt-4 text-center drop-shadow-sm space-y-2">
                    <p>🔒 100% kostenlos • Double-Opt-In • Jederzeit abbestellbar</p>
                    <p>
                      <a href="https://sweetsausallerwelt.de/pages/datenschutzerklarung" target="_blank" rel="noopener noreferrer" className="underline font-medium">Datenschutz</a> ·{" "}
                      <a href="https://sweetsausallerwelt.de/pages/teilnahmebedingungen" target="_blank" rel="noopener noreferrer" className="underline font-medium">Teilnahmeinfos</a>
                    </p>
                    <p className="text-xs">
                      <a href="https://sweetsausallerwelt.de/pages/impressum" target="_blank" rel="noopener noreferrer" className="underline">Impressum</a> ·{" "}
                      <a href="https://sweetsausallerwelt.de/pages/datenschutzerklarung" target="_blank" rel="noopener noreferrer" className="underline">Datenschutzerklärung</a> ·{" "}
                      <a href="https://sweetsausallerwelt.de/pages/agb" target="_blank" rel="noopener noreferrer" className="underline">AGB</a>
                    </p>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}