/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
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
  MessageSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    postcode: "",
    quoteInterest: "no",
    contactTime: "morning",
    note: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isQuoteRequested = formData.quoteInterest === 'yes' || formData.quoteInterest === 'maybe';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Conditional validation
    const newErrors: Record<string, string> = {};
    if (isQuoteRequested) {
      if (!formData.phone) newErrors.phone = "Phone number is required for a quote";
      if (!formData.postcode) newErrors.postcode = "Postcode is required for a quote";
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
          // Ensure quoteInterest is explicitly yes, no, or maybe as requested
          quoteInterest: formData.quoteInterest,
          source: "Solar Guide UK Landing Page",
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit lead");
      }

      setIsSubmitted(true);
      setErrors({});
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "There was an error submitting your request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "Price Variation", value: "£2k–£5k+", sub: "between installers" },
    { label: "Avg. Annual Savings", value: "£800–£2k", sub: "for UK homeowners" },
    { label: "Homes on Solar", value: "3.4M", sub: "UK homes already" }
  ];

  const contentCards = [
    {
      title: "Overpaying for installation",
      icon: <Zap className="w-6 h-6 text-[#00C853]" />,
      description: "Installation prices vary by up to £5,000 for the exact same system. Learn how to shop around."
    },
    {
      title: "Choosing the wrong system size",
      icon: <Home className="w-6 h-6 text-[#00C853]" />,
      description: "The sweet spot for most 3-4 bed UK homes is 4-6kWp. Don't let installers oversell you."
    },
    {
      title: "When battery storage matters",
      icon: <Battery className="w-6 h-6 text-[#00C853]" />,
      description: "For working households, a 5-10kWh battery can transform savings. Find out if you need one."
    },
    {
      title: "Bad finance deal warning signs",
      icon: <ShieldAlert className="w-6 h-6 text-[#00C853]" />,
      description: "Watch out for '0% finance' that hides a higher cash price. We show you how to calculate the net figure."
    },
    {
      title: "How to tell if solar is worth it",
      icon: <CheckCircle2 className="w-6 h-6 text-[#00C853]" />,
      description: "82% of UK homes are suitable. South, east, and west-facing roofs all perform well."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#0B1F3B] selection:bg-[#00C853]/30">
      {/* Navigation / Logo */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#0B1F3B] p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-[#00C853] fill-[#00C853]" />
            </div>
            <span className="font-bold text-xl tracking-tight">SolarGuide<span className="text-[#00C853]">UK</span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0B1F3B_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C853]/10 text-[#00C853] text-sm font-semibold">
                <FileText className="w-4 h-4" />
                <span>Free 5-Page PDF Guide (2024 Edition)</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Download the Free Guide: <span className="text-[#00C853]">5 Solar Mistakes</span> That Cost UK Homeowners £1,000s
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Get the quick guide that helps you avoid overpaying, choosing the wrong system, and missing out on real solar savings.
              </p>

              <div className="grid grid-cols-3 gap-4 py-4">
                {stats.map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-xl font-bold text-[#00C853]">{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-tight">
                      {stat.label}<br/>
                      <span className="font-normal lowercase opacity-70">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <ul className="space-y-4">
                {[
                  "Why most homeowners overpay by thousands",
                  "The battery storage decision — when it's worth it",
                  "How to spot a bad finance deal instantly",
                  "The 5-minute check that tells you if solar suits your home"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 bg-[#00C853] rounded-full p-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Right Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00C853] to-[#0B1F3B] rounded-3xl blur opacity-10"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
                
                {isSubmitted ? (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-[#00C853]/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-[#00C853]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Ready to Download!</h3>
                      <p className="text-slate-600">Your free guide "5 Solar Mistakes" is ready. Click below to save your copy.</p>
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        onClick={() => {
                          // Create a simple blob to simulate the PDF download
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
                        }}
                        className="w-full bg-[#0B1F3B] hover:bg-[#1a2e4d] text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                      >
                        <FileText className="w-5 h-5" />
                        Download PDF Guide
                      </button>
                    </div>

                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-slate-400 text-sm hover:text-[#0B1F3B] transition-colors"
                    >
                      Need to change your details?
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          First Name *
                        </label>
                        <input 
                          required
                          type="text"
                          placeholder="Jane"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          Email Address *
                        </label>
                        <input 
                          required
                          type="email"
                          placeholder="jane@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Phone className={`w-4 h-4 ${isQuoteRequested ? 'text-[#00C853]' : 'text-slate-400'}`} />
                          Phone {isQuoteRequested ? '*' : '(Optional)'}
                        </label>
                        <input 
                          required={isQuoteRequested}
                          type="tel"
                          placeholder="07123 456789"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({...formData, phone: e.target.value});
                            if (errors.phone) setErrors({...errors, phone: ""});
                          }}
                        />
                        {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isQuoteRequested ? 'text-[#00C853]' : 'text-slate-400'}`} />
                          Postcode {isQuoteRequested ? '*' : '(Optional)'}
                        </label>
                        <input 
                          required={isQuoteRequested}
                          type="text"
                          placeholder="SW1A 1AA"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all ${errors.postcode ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                          value={formData.postcode}
                          onChange={(e) => {
                            setFormData({...formData, postcode: e.target.value});
                            if (errors.postcode) setErrors({...errors, postcode: ""});
                          }}
                        />
                        {errors.postcode && <p className="text-[10px] text-red-500 font-bold">{errors.postcode}</p>}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-bold text-slate-800">Would you like help with a personalised solar quote?</p>
                      <div className="space-y-2">
                        {[
                          { id: "yes", label: "Yes, I’d like a personalised quote" },
                          { id: "maybe", label: "Maybe, I’d like more information" },
                          { id: "no", label: "No, just send me the guide" }
                        ].map((option) => (
                          <label key={option.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.quoteInterest === option.id ? 'bg-[#00C853]/5 border-[#00C853]' : 'border-slate-100 hover:border-slate-200'}`}>
                            <input 
                              type="radio" 
                              name="quoteInterest"
                              className="w-4 h-4 accent-[#00C853]"
                              checked={formData.quoteInterest === option.id}
                              onChange={() => {
                                setFormData({...formData, quoteInterest: option.id});
                                setErrors({});
                              }}
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isQuoteRequested && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              Best time to contact
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Morning', 'Afternoon', 'Evening'].map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setFormData({...formData, contactTime: time.toLowerCase()})}
                                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${formData.contactTime === time.toLowerCase() ? 'bg-[#0B1F3B] text-white border-[#0B1F3B]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-400" />
                              Anything you’d like us to know?
                            </label>
                            <textarea 
                              placeholder="e.g. I have a south-facing roof..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all h-20 resize-none"
                              value={formData.note}
                              onChange={(e) => setFormData({...formData, note: e.target.value})}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4 space-y-4">
                      {errors.submit && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
                          {errors.submit}
                        </div>
                      )}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-[#00C853] hover:bg-[#00B049] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#00C853]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            Download Free Guide
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-slate-400 font-medium">
                        No obligation. Just useful information to help you decide.
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
      <section className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What’s inside the guide?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We've condensed years of solar industry knowledge into a simple, easy-to-read guide.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {contentCards.map((card, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 transition-all hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
            
            {/* Final "Bonus" Card to make it 6 for grid symmetry or just 5 as requested */}
            <div className="p-8 rounded-3xl bg-[#0B1F3B] text-white space-y-4 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-[#00C853]/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#00C853]" />
              </div>
              <h3 className="text-xl font-bold">Plus much more...</h3>
              <p className="text-slate-300">The guide also includes a checklist for your first installer visit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#0B1F3B] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C853] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00C853] rounded-full blur-[120px] opacity-10 -ml-48 -mb-48"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Want to see if solar is worth it for your home?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
            After downloading the guide, you can also use our Solar Savings Checker to estimate your potential yearly and 10-year savings.
          </p>
          <div className="pt-4">
            <a 
              href="https://solarchecker.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#00C853] hover:bg-[#00B049] text-white font-bold py-5 px-10 rounded-2xl shadow-2xl shadow-[#00C853]/30 transition-all transform hover:scale-105 active:scale-95 text-lg"
            >
              Check My Solar Savings
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
          <p className="text-slate-500 text-sm">
            Free to use. No personal details required for the checker.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-[#0B1F3B] p-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-[#00C853] fill-[#00C853]" />
              </div>
              <span className="font-bold text-lg tracking-tight">SolarGuide<span className="text-[#00C853]">UK</span></span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-[#0B1F3B] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#0B1F3B] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#0B1F3B] transition-colors">Contact Us</a>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 SolarGuideUK. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
