/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from "react";
import { 
  CheckCircle2, 
  FileText, 
  Zap, 
  Battery, 
  ShieldAlert, 
  Home, 
  ArrowRight, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export default function App() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    postcode: "",
    quoteInterest: "",
    consent: false,
    contactTime: "morning",
    note: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isSecondSubmitting, setIsSecondSubmitting] = useState(false);
  const [isSecondSubmitted, setIsSecondSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionCount, setSubmissionCount] = useState<number | null>(null);

  // Fetch and listen to submission count
  useEffect(() => {
    const statsDoc = doc(db, "stats", "global");
    
    const unsubscribe = onSnapshot(statsDoc, (snapshot) => {
      if (snapshot.exists()) {
        setSubmissionCount(snapshot.data().submissionCount);
      } else {
        // Initialize if it doesn't exist
        setDoc(statsDoc, { submissionCount: 0 });
      }
    }, (error) => {
      console.error("Error fetching stats:", error);
    });

    return () => unsubscribe();
  }, []);

  const incrementCount = async () => {
    try {
      const statsDoc = doc(db, "stats", "global");
      await updateDoc(statsDoc, {
        submissionCount: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing count:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Conditional validation
    const newErrors: Record<string, string> = {};
    
    const interest = formData.consent ? 'yes' : 'no';

    if (formData.consent && !formData.phone) {
      newErrors.phone = "Phone number is required for a solar quote";
    } else if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone = "Please enter a valid UK phone number (min 10 digits)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to the provided webhook
      const response = await fetch("https://services.leadconnectorhq.com/hooks/G5krtCrk8a2a4slGH0tG/webhook-trigger/dc9f5d85-f312-4fd8-9ffc-736aa21169bd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quoteInterest: interest,
          source: "Solar Guide UK Landing Page",
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit lead");
      }

      // Increment submission count in Firebase
      await incrementCount();

      // Track Lead event with Meta Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Solar Guide UK PDF',
          status: interest
        });
      }

      setFormData(prev => ({ ...prev, quoteInterest: interest }));
      setIsSubmitted(true);
      setErrors({});
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "There was an error submitting your request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecondSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!formData.phone) {
      newErrors.phone = "Phone number is required for a quote";
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone = "Please enter a valid UK phone number (min 10 digits)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSecondSubmitting(true);

    try {
      const response = await fetch("https://services.leadconnectorhq.com/hooks/G5krtCrk8a2a4slGH0tG/webhook-trigger/dc9f5d85-f312-4fd8-9ffc-736aa21169bd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quoteInterest: "yes", // They are opting in now
          source: "Solar Guide UK Upsell",
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit upsell");
      }

      // Increment submission count in Firebase for the second action
      await incrementCount();

      // Track Lead event again for the upsell
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Solar Guide UK Upsell',
          status: 'yes'
        });
      }

      setIsSecondSubmitted(true);
      setErrors({});
    } catch (error) {
      console.error("Upsell error:", error);
      setErrors({ secondSubmit: "There was an error. Please try again." });
    } finally {
      setIsSecondSubmitting(false);
    }
  };

  const stats = [
    { label: "Price Variation", value: "£2k–£5k+", sub: "between installers" },
    { label: "Avg. Annual Savings", value: "£800–£2k", sub: "for UK homeowners" },
    { label: "Homes on Solar", value: "3.4M", sub: "UK homes already" }
  ];

  const contentCards = [
    {
      title: "How to tell if solar is worth it",
      icon: <CheckCircle2 className="w-6 h-6 text-brand-green" />,
      description: "82% of UK homes are suitable. South, east, and west-facing roofs all perform well."
    },
    {
      title: "The finance mistakes that wipe out savings",
      icon: <ShieldAlert className="w-6 h-6 text-brand-green" />,
      description: "Watch out for '0% finance' that hides a higher cash price. We show you how to calculate the net figure."
    },
    {
      title: "When battery storage is worth it — and when it is not",
      icon: <Battery className="w-6 h-6 text-brand-green" />,
      description: "For working households, a 5-10kWh battery can transform savings. Find out if you need one."
    },
    {
      title: "What to check before getting quotes",
      icon: <Zap className="w-6 h-6 text-brand-green" />,
      description: "Installation prices vary by up to £5,000 for the exact same system. Learn how to shop around."
    }
  ];

  const trustLogos = [
    { name: "MCS Certified", icon: <ShieldAlert className="w-5 h-5" /> },
    { name: "RECC Member", icon: <CheckCircle2 className="w-5 h-5" /> },
    { name: "HIES Protected", icon: <ShieldAlert className="w-5 h-5" /> },
    { name: "TrustMark", icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-brand-blue selection:bg-brand-green/30">
      {/* Navigation / Logo */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-blue p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-brand-green fill-brand-green" />
            </div>
            <span className="font-bold text-xl tracking-tight">SolarGuide<span className="text-brand-green">UK</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {submissionCount !== null && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <Users className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-xs font-bold text-slate-600">{submissionCount.toLocaleString()} forms completed</span>
              </div>
            )}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted by 10,000+ UK Homeowners</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-green/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-bold border border-brand-green/20">
                <FileText className="w-4 h-4" />
                <span>Updated for 2026: Free 5-Page PDF Guide</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-brand-blue">
                Could Solar Actually <span className="text-brand-green">Save You Money?</span> Start With This Free UK Guide
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Learn how to avoid bad finance deals, spot whether your home is a fit, and decide if you want a free personalised solar check after downloading.
              </p>

              {/* Guide Mockup Visual */}
              <div className="relative py-4 flex items-center gap-8">
                <div className="relative w-32 h-44 sm:w-40 sm:h-56 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500 flex-shrink-0 hidden sm:block">
                  <div className="absolute top-0 left-0 w-full h-2 bg-brand-green"></div>
                  <div className="p-4 space-y-3">
                    <div className="w-8 h-8 bg-brand-blue rounded flex items-center justify-center">
                      <Zap className="w-4 h-4 text-brand-green" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                      <div className="h-1.5 w-3/4 bg-slate-100 rounded"></div>
                      <div className="h-1.5 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                    <div className="pt-2">
                      <div className="h-12 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 p-2">
                    <span className="text-[6px] font-bold text-slate-300 uppercase">SolarGuideUK</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-xl sm:text-2xl font-bold text-brand-blue">{stat.value}</div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-tight">
                          {stat.label}<br/>
                          <span className="font-normal lowercase opacity-70">{stat.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <ul className="space-y-5">
                {[
                  "How to tell if solar is worth it for your home",
                  "The finance mistakes that wipe out savings",
                  "When battery storage is worth it — and when it is not",
                  "What to check before getting quotes"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="mt-1 bg-brand-green/10 rounded-lg p-1.5 group-hover:bg-brand-green/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    </div>
                    <span className="text-slate-700 font-medium text-lg">{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Trust Bar */}
              <div className="pt-8 flex flex-wrap items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                {trustLogos.map((logo, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {logo.icon}
                    <span className="text-xs font-bold uppercase tracking-widest">{logo.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-green to-brand-blue rounded-[2rem] blur opacity-10"></div>
              <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10">
                
                {isSubmitted ? (
                  <div className="py-8 text-center space-y-8">
                    {!hasDownloaded ? (
                      <>
                        <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-brand-green/5">
                          <CheckCircle2 className="w-12 h-12 text-brand-green" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-3xl font-bold text-brand-blue">Ready to Download!</h3>
                          <p className="text-slate-600">Your free guide "5 Solar Mistakes" is ready. Click below to save your copy.</p>
                        </div>
                        
                        <div className="pt-4">
                          <button 
                            onClick={() => {
                              if (typeof window !== 'undefined' && (window as any).fbq) {
                                (window as any).fbq('trackCustom', 'PDFDownloadClick');
                              }

                              const content = "5 Solar Mistakes That Cost UK Homeowners £1,000s\n\n" +
                                "1. Accepting the First Quote You Receive\n" +
                                "2. Choosing a System That's the Wrong Size\n" +
                                "3. Skipping Battery Storage Without Thinking It Through\n" +
                                "4. Falling for a Bad Finance Deal\n" +
                                "5. Assuming Solar Probably Isn't Worth It for Your Home\n\n" +
                                "Visit https://solarchecker.netlify.app to check your savings.";
                              
                              const blob = new Blob([content], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', '5-Solar-Mistakes-Guide.pdf');
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                              
                              setHasDownloaded(true);
                            }}
                            className="w-full bg-brand-blue hover:bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group"
                          >
                            <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            Download PDF Guide
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-brand-green/5 border border-brand-green/20 p-5 rounded-2xl flex items-center gap-4 text-brand-green text-sm font-bold">
                          <div className="bg-brand-green p-1.5 rounded-lg">
                            <Zap className="w-5 h-5 text-white animate-pulse" />
                          </div>
                          Downloading now... Check your browser downloads.
                        </div>

                        {formData.quoteInterest === 'yes' && !isSecondSubmitted ? (
                          <div className="bg-white border-2 border-brand-green p-8 rounded-[2rem] shadow-xl space-y-6 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16"></div>
                            <h4 className="text-xl font-bold text-brand-blue leading-tight relative z-10">
                              Almost there! Just one more detail...
                            </h4>
                            <p className="text-sm text-slate-600 relative z-10">
                              {formData.phone 
                                ? "To give you an accurate suitability check, we just need your postcode."
                                : "To give you an accurate suitability check, we just need your phone number and postcode."}
                            </p>
                            
                            <form onSubmit={handleSecondSubmit} className="space-y-5 relative z-10">
                              {!formData.phone && (
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-brand-green" />
                                    Phone Number *
                                  </label>
                                  <input 
                                    required
                                    type="tel"
                                    placeholder="07123 456789"
                                    className={`w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all placeholder:text-slate-300 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                    value={formData.phone}
                                    onChange={(e) => {
                                      setFormData({...formData, phone: e.target.value});
                                      if (errors.phone) setErrors({});
                                    }}
                                  />
                                  {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                                </div>
                              )}

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-brand-green" />
                                  Postcode (Optional)
                                </label>
                                <input 
                                  type="text"
                                  placeholder="SW1A 1AA"
                                  className={`w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all ${errors.postcode ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                  value={formData.postcode}
                                  onChange={(e) => {
                                    setFormData({...formData, postcode: e.target.value});
                                    if (errors.postcode) setErrors({});
                                  }}
                                />
                                {errors.postcode && <p className="text-[10px] text-red-500 font-bold">{errors.postcode}</p>}
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5" />
                                  Best time to contact
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                  {['Morning', 'Afternoon', 'Evening'].map((time) => (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => setFormData({...formData, contactTime: time.toLowerCase()})}
                                      className={`py-3 text-xs font-bold rounded-xl border transition-all ${formData.contactTime === time.toLowerCase() ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button 
                                type="submit"
                                disabled={isSecondSubmitting}
                                className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold py-5 rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                              >
                                {isSecondSubmitting ? (
                                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    Complete My Request
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </button>
                              {errors.secondSubmit && <p className="text-center text-xs text-red-500 font-bold">{errors.secondSubmit}</p>}
                            </form>
                          </div>
                        ) : formData.quoteInterest === 'no' && !isSecondSubmitted ? (
                          <div className="bg-white border-2 border-brand-green p-8 rounded-[2rem] shadow-xl space-y-6 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16"></div>
                            <h4 className="text-xl font-bold text-brand-blue leading-tight relative z-10">
                              Wait! Would you like to get a personalised solar quote too?
                            </h4>
                            <p className="text-sm text-slate-600 relative z-10">
                              Most homeowners save an extra £2,000 just by comparing. Just confirm your details below.
                            </p>
                            
                            <form onSubmit={handleSecondSubmit} className="space-y-5 relative z-10">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-brand-green" />
                                  Phone Number *
                                </label>
                                <input 
                                  required
                                  type="tel"
                                  placeholder="07123 456789"
                                  className={`w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all placeholder:text-slate-300 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                  value={formData.phone}
                                  onChange={(e) => {
                                    setFormData({...formData, phone: e.target.value});
                                    if (errors.phone) setErrors({});
                                  }}
                                />
                                {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                              </div>

                              <button 
                                type="submit"
                                disabled={isSecondSubmitting}
                                className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold py-5 rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                              >
                                {isSecondSubmitting ? (
                                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    Get My Personalised Quote
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </button>
                              {errors.secondSubmit && <p className="text-center text-xs text-red-500 font-bold">{errors.secondSubmit}</p>}
                            </form>
                          </div>
                        ) : isSecondSubmitted ? (
                          <div className="bg-brand-green/5 p-8 rounded-[2rem] border border-brand-green/20 space-y-4">
                            <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-green/20">
                              <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-brand-green">Quote Request Received!</h4>
                            <p className="text-slate-600">We'll be in touch shortly with your personalised solar savings plan.</p>
                          </div>
                        ) : (
                          <div className="py-12">
                            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle2 className="w-10 h-10 text-brand-green" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-blue">Thank you!</h3>
                            <p className="text-slate-600">Enjoy your guide. We hope it helps you on your solar journey.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setHasDownloaded(false);
                        setIsSecondSubmitted(false);
                      }}
                      className="text-slate-400 text-sm font-bold hover:text-brand-blue transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      Need to change your details?
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-brand-blue">Get Your Free Guide</h3>
                      <p className="text-sm text-slate-500">Enter your details and we'll send it over instantly.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          First Name *
                        </label>
                        <input 
                          required
                          type="text"
                          placeholder="Jane"
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all placeholder:text-slate-300"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          Email Address *
                        </label>
                        <input 
                          required
                          type="email"
                          placeholder="jane@example.com"
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all placeholder:text-slate-300"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        Phone Number {formData.consent && <span className="text-red-500">*</span>}
                      </label>
                      <input 
                        type="tel"
                        placeholder="07123 456789"
                        className={`w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all placeholder:text-slate-300 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({...formData, phone: e.target.value});
                          if (errors.phone) setErrors({});
                        }}
                      />
                      {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                    </div>

                    <div className="p-5 bg-brand-green/5 rounded-2xl border border-brand-green/10 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-brand-green p-1 rounded-lg mt-0.5">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-bold text-brand-blue leading-tight">
                          Free optional upgrade: <span className="font-normal text-slate-600">We can also check whether solar is likely worth exploring for your home based on your details.</span>
                        </p>
                      </div>

                      <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all bg-white border-slate-100 hover:border-slate-200">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-brand-green"
                          checked={formData.consent}
                          onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                        />
                        <span className="text-sm font-bold text-brand-blue">I consent to being contacted for a free solar quote</span>
                      </label>
                    </div>

                    <div className="pt-4 space-y-4">
                      {errors.submit && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
                          {errors.submit}
                        </div>
                      )}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold py-5 rounded-2xl shadow-xl shadow-brand-green/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-xl group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            {formData.consent ? 'Get My Guide + Free Solar Check' : 'Get My Free Guide'}
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-slate-400 font-bold">
                        No pressure. Download the guide first, then decide whether a personalised quote makes sense for your home.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mid-page Section */}
      <section className="bg-white py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-blue">What’s inside the guide?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">We've condensed years of solar industry knowledge into a simple, easy-to-read guide.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {contentCards.map((card, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 transition-all hover:shadow-2xl hover:shadow-slate-200/50 group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-brand-green transition-colors duration-300">
                  <div className="group-hover:text-white transition-colors duration-300">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-brand-blue py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-green/10 rounded-full blur-[120px] -mr-[25%] -mt-[25%]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-brand-green/10 rounded-full blur-[120px] -ml-[25%] -mb-[25%]"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/20 text-brand-green text-sm font-bold border border-brand-green/30">
            <Zap className="w-4 h-4" />
            <span>Bonus Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Want to see if solar is worth it for your home?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            After downloading the guide, you can also use our Solar Savings Checker to estimate your potential yearly and 10-year savings.
          </p>
          <div className="pt-6">
            <a 
              href="https://solarchecker.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('trackCustom', 'SavingsCheckerClick');
                }
              }}
              className="inline-flex items-center gap-4 bg-brand-green hover:bg-brand-green-hover text-white font-bold py-6 px-12 rounded-[2rem] shadow-2xl shadow-brand-green/30 transition-all transform hover:scale-105 active:scale-95 text-xl group"
            >
              Check My Solar Savings
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <p className="text-slate-500 text-sm font-bold">
            Free to use. No personal details required for the checker.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-brand-blue p-1.5 rounded-lg">
                  <Zap className="w-5 h-5 text-brand-green fill-brand-green" />
                </div>
                <span className="font-bold text-xl tracking-tight">SolarGuide<span className="text-brand-green">UK</span></span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Helping UK homeowners navigate the solar landscape with confidence. Our mission is to provide clear, unbiased information to help you save money and the planet.
              </p>
              {submissionCount !== null && (
                <div className="flex items-center gap-2 text-brand-green font-bold text-sm">
                  <Users className="w-4 h-4" />
                  <span>{submissionCount.toLocaleString()} forms completed to date</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-brand-blue uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-brand-green transition-colors">Free Solar Guide</a></li>
                <li><a href="https://solarchecker.netlify.app" className="hover:text-brand-green transition-colors">Savings Checker</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Solar FAQ</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-brand-blue uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-brand-green transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">
              © 2026 SolarGuideUK. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center grayscale opacity-50">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center grayscale opacity-50">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
