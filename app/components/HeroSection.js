"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail, User } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { FunnelTracker } from "../../lib/funnel";
import { trackEvent } from "../../lib/tracking";
import Image from "next/image";

export default function HeroSection({ onCTAClick }) {
  const [step, setStep] = useState("contact");
  const [consent, setConsent] = useState(false);
  const [consentTs, setConsentTs] = useState(null);
  const [consentError, setConsentError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    street: "", city: "", postalCode: "", country: "DE"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [vh, setVh] = useState(800);
  const [particleCount, setParticleCount] = useState(10);
  const [remainingSpots, setRemainingSpots] = useState(100);
  const prefersReducedMotion = useReducedMotion();
  const submittedRef = useRef(false);

  const currentOffer = { title: "Dubai-Schokolade", emoji: "🍫" };

  const contactForm = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });
  const addressForm = useForm({ mode: "onSubmit", reValidateMode: "onBlur" });

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

    setRemainingSpots(Math.floor(Math.random() * 401) + 100);

    return () => {
      window.removeEventListener("resize", updateVh);
      mq.removeEventListener?.("change", setCount);
    };
  }, []);

  const seeds = useMemo(() => {
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
        statusIfNew: "pending",
      }),
    });
  };

  const onSubmitContact = async (data) => {
    if (isLoading || submittedRef.current) return;

    setConsentError("");

    if (!consent) {
      setConsentError("Bitte stimme der Datenschutzerklärung zu.");
      return;
    }

    setIsLoading(true);
    try {
      submittedRef.current = true;
      const ts = new Date().toISOString();
      setConsentTs(ts);

      trackEvent("newsletter_consent_given", { ts, source: "hero_section" });
      funnel.trackEmailCapture(data.email);
      trackEvent("lead_form_start", { source: "hero_section" });

      setFormData(prev => ({ ...prev, firstName: data.firstName, lastName: data.lastName, email: data.email }));

      const res = await callNewsletterAPI({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        consent: true,
        consentTs: ts,
        consentText: "Einwilligung in den Erhalt des Newsletters (Double-Opt-In), Hinweise in der Datenschutzerklärung."
      });

      if (!res.ok) throw new Error("Subscription failed");

      setStep("address");
      submittedRef.current = false;
      trackEvent("newsletter_contact_captured", { method: "hero_section" });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      trackEvent("form_error", { type: "newsletter_signup_contact" });
      submittedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAddress = async (data) => { await completeRegistration(data, true); };
  const onSkipAddress = async () => { await completeRegistration({}, false); };

  const completeRegistration = async (addressData, includeAddress) => {
    setIsLoading(true);
    try {
      const finalData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(includeAddress ? addressData : {}),
        consent: true,
        consentTs,
      };
      const res = await callNewsletterAPI(finalData);
      if (!res.ok) throw new Error("Update failed");

      setStep("done");
      trackEvent("complete_registration", { method: "newsletter", value: 1.0, currency: "EUR", address_provided: includeAddress });
    } catch (error) {
      console.error("Registration completion error:", error);
      trackEvent("form_error", { type: "newsletter_completion" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToContact = () => setStep("contact");

  if (step === "done") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl mb-6">🎉</motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">WILLKOMMEN!</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-6">Deine <strong>{currentOffer.title}</strong> ist unterwegs! {currentOffer.emoji}</p>
          <div className="bg-white/90 p-5 rounded-xl shadow-lg">
            <p className="text-base text-gray-600 mb-1">📧 Bitte bestätige deine Anmeldung in der E-Mail (Double-Opt-In).</p>
            <p className="text-sm text-gray-500 mb-2">Danach erhältst du alle Informationen zur kostenlosen Dubai-Schokolade.</p>
            <p className="text-sm text-gray-500">Falls nichts kommt: Spam-Ordner prüfen.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-start overflow-hidden px-4 pt-[60vh] md:pt-0 md:justify-end md:pb-12">
      {/* Desktop Background - Newsletter_desktop.png */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src="/Newsletter_desktop.png"
          alt="Background Desktop"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Mobile Background - Newsletter.png */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/Newsletter.png"
          alt="Background Mobile"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Animation nur auf Desktop */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none hidden md:block">
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

      {/* Formular UNTEN platziert - Responsive */}
      <div className="container mx-auto text-center relative z-10 max-w-sm md:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, delay: 0.2 }} 
          className="w-full"
        >
          
          {/* FORM - OPTIMIERT FÜR BEIDE GERÄTE */}
          <div className="bg-transparent p-2 md:p-4 rounded-xl">

              {/* CONTACT STEP */}
              {step === "contact" && (
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-2 md:space-y-3">
                    
                    {/* Name Fields - NEBENEINANDER */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {/* Vorname */}
                      <div>
                        <div className="relative">
                          <User className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="text"
                            placeholder="Vorname"
                            {...contactForm.register("firstName", {
                              required: "Vorname erforderlich",
                              minLength: { value: 2, message: "Mind. 2 Zeichen" }
                            })}
                            className="w-full pl-7 md:pl-10 pr-3 py-2.5 md:py-3.5 text-sm md:text-base text-gray-900 font-medium border-2 border-gray-300 bg-white rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none placeholder:text-gray-500 placeholder:font-normal shadow-sm hover:border-gray-400 transition-all"
                          />
                        </div>
                        {contactForm.formState.errors.firstName && (
                          <p className="text-red-600 text-xs mt-1 text-left">{contactForm.formState.errors.firstName.message}</p>
                        )}
                      </div>

                      {/* Nachname */}
                      <div>
                        <div className="relative">
                          <User className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                          <input
                            type="text"
                            placeholder="Nachname"
                            {...contactForm.register("lastName", {
                              required: "Nachname erforderlich",
                              minLength: { value: 2, message: "Mind. 2 Zeichen" }
                            })}
                            className="w-full pl-7 md:pl-10 pr-3 py-2.5 md:py-3.5 text-sm md:text-base text-gray-900 font-medium border-2 border-gray-300 bg-white rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none placeholder:text-gray-500 placeholder:font-normal shadow-sm hover:border-gray-400 transition-all"
                          />
                        </div>
                        {contactForm.formState.errors.lastName && (
                          <p className="text-red-600 text-xs mt-1 text-left">{contactForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* E-Mail */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                        <input
                          type="email"
                          placeholder="E-Mail Adresse"
                          {...contactForm.register("email", {
                            required: "E-Mail erforderlich",
                            pattern: { value: /\S+@\S+\.\S+/, message: "Ungültige E-Mail" }
                          })}
                          className="w-full pl-7 md:pl-10 pr-3 py-2.5 md:py-3.5 text-sm md:text-base text-gray-900 font-medium border-2 border-gray-300 bg-white rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none placeholder:text-gray-500 placeholder:font-normal shadow-sm hover:border-gray-400 transition-all"
                        />
                      </div>
                      {contactForm.formState.errors.email && (
                        <p className="text-red-600 text-xs mt-1 text-left">{contactForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    {/* WhatsApp Option */}
                    <div className="relative">
                      <svg className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-green-600 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <select
                        {...contactForm.register("whatsappOption")}
                        className="w-full pl-7 md:pl-10 pr-10 py-2.5 md:py-3.5 text-sm md:text-base text-gray-900 font-medium border-2 border-gray-300 bg-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none shadow-sm hover:border-gray-400 transition-all appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2316a34a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.5rem'
                        }}
                      >
                        <option value="">WhatsApp Updates? (Optional)</option>
                        <option value="yes">✅ Ja, WhatsApp Updates</option>
                        <option value="no">❌ Nein, nur E-Mail</option>
                      </select>
                    </div>

                    {/* WhatsApp Nummer wenn Ja gewählt */}
                    {contactForm.watch("whatsappOption") === "yes" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <svg className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <input
                            type="tel"
                            placeholder="WhatsApp Nummer (z.B. +49 123 456789)"
                            {...contactForm.register("whatsapp", {
                              required: contactForm.watch("whatsappOption") === "yes" ? "WhatsApp-Nummer erforderlich" : false
                            })}
                            className="w-full pl-7 md:pl-10 pr-3 py-2.5 md:py-3.5 text-sm md:text-base text-gray-900 font-medium border-2 border-gray-300 bg-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none placeholder:text-gray-500 placeholder:font-normal shadow-sm hover:border-gray-400 transition-all"
                          />
                        </div>
                        {contactForm.formState.errors.whatsapp && (
                          <p className="text-red-600 text-xs mt-1 text-left">{contactForm.formState.errors.whatsapp.message}</p>
                        )}
                      </motion.div>
                    )}

                    {/* Consent Checkbox */}
                    <label className="flex items-start gap-2 md:gap-3 text-left bg-white rounded-lg p-3 md:p-4 border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          if (e.target.checked) setConsentError("");
                        }}
                        className="mt-0.5 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 rounded border-gray-300 text-pink-600 focus:ring-2 focus:ring-pink-500 cursor-pointer"
                      />
                      <span className="text-xs md:text-sm text-gray-800 leading-relaxed">
                        Ich willige ein, den Newsletter von <strong>Sweets aus aller Welt</strong> per E-Mail zu erhalten. Hinweise zu Inhalten, Protokollierung, Versand über Mailchimp, statistischer Auswertung sowie Widerruf findest du in der{" "}
                        <a href="https://sweetsausallerwelt.de/pages/datenschutzerklarung" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-pink-600 hover:text-pink-700 transition-colors">Datenschutzerklärung</a>. Die Einwilligung kann jederzeit über den Abmeldelink widerrufen werden.
                      </span>
                    </label>
                    {consentError && (
                      <p className="text-red-600 text-xs md:text-sm font-medium -mt-1">{consentError}</p>
                    )}
                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.03 }}
                      whileTap={{ scale: isLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={isLoading || !consent}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 md:py-4 px-6 rounded-lg shadow-xl hover:shadow-2xl hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-lg"
                    >
                      {isLoading ? (
                        <><div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent" /> Wird verarbeitet...</>
                      ) : (
                        "Jetzt anmelden & Schokolade sichern!"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}