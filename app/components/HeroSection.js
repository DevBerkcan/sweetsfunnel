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

  // Modal & Gewinnspiel States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [giveawayOptIn, setGiveawayOptIn] = useState(false);
  const [giveawaySubmitted, setGiveawaySubmitted] = useState(false);

  const currentOffer = { title: "Willkommensgeschenk", emoji: "🎁" };
  const [isExpanded, setIsExpanded] = useState(false);

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

      setFormData(prev => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        whatsapp: data.whatsapp
      }));

      const res = await callNewsletterAPI({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        whatsapp: data.whatsapp,
        consent: true,
        consentTs: ts,
        consentText: "Einwilligung in den Erhalt des Newsletters (Double-Opt-In), Hinweise in der Datenschutzerklärung."
      });

      if (!res.ok) throw new Error("Subscription failed");

      // Direkt Success Modal anzeigen statt zum Adressschritt zu gehen
      setShowSuccessModal(true);
      submittedRef.current = false;
      trackEvent("newsletter_contact_captured", { method: "hero_section" });
      trackEvent("complete_registration", { method: "newsletter", value: 1.0, currency: "EUR" });
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

      setShowSuccessModal(true);
      trackEvent("complete_registration", { method: "newsletter", value: 1.0, currency: "EUR", address_provided: includeAddress });
    } catch (error) {
      console.error("Registration completion error:", error);
      trackEvent("form_error", { type: "newsletter_completion" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToContact = () => setStep("contact");

  const handleGiveawayOptIn = async () => {
    if (giveawaySubmitted) return;

    setIsLoading(true);
    try {
      // Hier kannst du das Gewinnspiel-Opt-in an dein Backend senden
      await callNewsletterAPI({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        giveawayOptIn: true,
        giveawayTs: new Date().toISOString()
      });

      setGiveawaySubmitted(true);
      trackEvent("giveaway_opt_in", { email: formData.email });
    } catch (error) {
      console.error("Giveaway opt-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setStep("done");
  };

  return (
    <>
      {/* Erfolgsmodal mit Gewinnspiel */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 md:p-6 rounded-t-2xl text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-5xl md:text-6xl mb-2 md:mb-3"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2">
                Herzlich Willkommen!
              </h2>
              <p className="text-white/90 text-base md:text-lg">
                Du bist jetzt beim Newsletter angemeldet! 🎊
              </p>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Success Info */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 md:p-4">
                <p className="text-green-800 font-semibold text-sm md:text-base mb-2 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">📧</span>
                  Bestätigungs-E-Mail unterwegs
                </p>
                <p className="text-green-700 text-xs md:text-sm leading-relaxed">
                  Bitte bestätige deine Anmeldung über den Link in der E-Mail, um die Chance auf eine <strong>Süßigkeitenbox</strong> zu erhalten!
                </p>
                <p className="text-green-600 text-xs mt-2">
                  💡 Tipp: Schau auch im Spam-Ordner nach!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all text-sm md:text-base"
              >
                {giveawaySubmitted ? "Fertig! 🎉" : "Fertig! 🎉"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section Formular - nur anzeigen wenn nicht done */}
      {step !== "done" && (
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

                    {/* WhatsApp Nummer - Pflichtfeld */}
                    <div>
                      <div className="relative">
                        <svg className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <input
                          type="tel"
                          placeholder="WhatsApp Nummer (z.B. +49 123 456789)"
                          {...contactForm.register("whatsapp", {
                            required: "WhatsApp-Nummer erforderlich",
                            pattern: {
                              value: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                              message: "Ungültige Telefonnummer"
                            }
                          })}
                          className="w-full pl-7 md:pl-10 pr-3 py-2.5 md:py-3.5 text-sm md:text-base text-gray-900 font-medium border-2 border-gray-300 bg-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none placeholder:text-gray-500 placeholder:font-normal shadow-sm hover:border-gray-400 transition-all"
                        />
                      </div>
                      {contactForm.formState.errors.whatsapp && (
                        <p className="text-red-600 text-xs mt-1 text-left">{contactForm.formState.errors.whatsapp.message}</p>
                      )}
                    </div>

                   {/* Gewinnspiel Info */}
<div className="text-left bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 md:p-4 border-2 border-pink-200 shadow-sm">
  <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
    <span className="text-xs md:text-sm text-gray-800 leading-relaxed flex-1">
      Jeden Monat die Chance auf eine Süßigkeiten-Box! Unter allen aktiven Newsletter-Abonnent:innen verlosen wir in der Regel einmal pro Monat drei <strong>„Sweets aus aller Welt"-Boxen</strong> oder andere Süßigkeiten-Highlights.
    </span>
    <svg 
      className={`w-4 h-4 text-pink-600 transition-transform flex-shrink-0 mt-0.5 ${isExpanded ? 'rotate-180' : ''}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
  
  {isExpanded && (
    <div className="mt-2 pt-2 border-t border-pink-200">
      <span className="text-xs md:text-sm text-gray-800 leading-relaxed">
        <span className="font-semibold text-pink-700">So nimmst du teil:</span> Newsletter anmelden & per E-Mail bestätigen (Double-Opt-In), solange du eingetragen bist, bist du automatisch im Lostopf. Gewinner:innen werden per E-Mail informiert.
      </span>
    </div>
  )}
</div>

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
                        Mit meiner Anmeldung willige ich ein, den E-Mail-Newsletter von{" "}
                        <strong>Sweets aus aller Welt</strong> mit Infos zu neuen Produkten, Aktionen,
                        Gewinnspielen und Angeboten zu erhalten und automatisch an der{" "}
                        <strong>monatlichen Überraschungsbox-Verlosung</strong> teilzunehmen.
                        Ich kann meine Einwilligung jederzeit über den Abmeldelink widerrufen.
                        Details in der{" "}
                        <a
                          href="https://sweetsausallerwelt.de/pages/datenschutzerklarung"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                        >
                          Datenschutzerklärung
                        </a>
                        .
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
                        "Jetzt anmelden & Geschenk sichern!"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
          </div>
        </motion.div>
      </div>
      </div>
      )}

      {/* Success Screen nach Modal */}
      {step === "done" && !showSuccessModal && (
        <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-teal-200/30 rounded-full blur-xl"></div>
          </div>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-8xl md:text-9xl"
                  >
                    🎉
                  </motion.div>
                  <div className="absolute -top-4 -right-4 text-5xl md:text-6xl">✨</div>
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
              >
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Geschafft!
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-700 mb-8 font-medium"
              >
                Du bist jetzt Teil unserer süßen Community! 🍬
              </motion.p>

              {/* Info Boxes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8"
              >
                {/* Email Confirmation Box */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-green-200">
                  <div className="text-4xl mb-3">📧</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Bestätige deine E-Mail
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Wir haben dir eine E-Mail geschickt. Klicke auf den Bestätigungslink, um deine Anmeldung abzuschließen.
                  </p>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      💡 <strong>Tipp:</strong> Schau auch im Spam-Ordner nach!
                    </p>
                  </div>
                </div>

                {/* Giveaway Info Box */}
                {giveawaySubmitted ? (
                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 shadow-xl border-2 border-pink-300">
                    <div className="text-4xl mb-3">🍀</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Gewinnspiel aktiv!
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Du nimmst ab jetzt jeden Monat automatisch an der Verlosung teil. Viel Glück! 🎁
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-emerald-200">
                    <div className="text-4xl mb-3">🎁</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Willkommensgeschenk
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Nach deiner Bestätigung hast du jeden Monat die Chance, unsere Süßigkeiten-Box und eine Dubai-Schokolade zu gewinnen.
                    </p>
                    <p className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                      💡 <strong>Tipp:</strong> Je länger du im Newsletter bleibst, desto höher sind deine Gewinnchancen!
                    </p>
                  </div>
                )}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <a
                  href="https://sweetsausallerwelt.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Zum Shop 🛍️
                </a>
              </motion.div>

              {/* Footer Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-gray-500 mt-8"
              >
                Danke, dass du dich für SweetsausallerWelt entschieden hast! ❤️
              </motion.p>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}