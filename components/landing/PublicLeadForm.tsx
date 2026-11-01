"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Phone, Mail, User } from "lucide-react";
import { capturePublicLead } from "@/actions/leadActions";
import { toast } from "@/store/useToastStore";

export function PublicLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await capturePublicLead({
      name,
      phone,
      email,
      message,
    });

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      toast.success("Inquiry Received!", "Our sales team has received your message.");
    } else {
      setError(res.error || "Unable to send inquiry. Please check your details.");
      toast.error("Inquiry Failed", res.error || "Unable to send inquiry.");
    }
  };

  if (submitted) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="neu-card p-8 rounded-3xl text-center space-y-3 bg-white text-slate-800"
      >
        <div className="w-12 h-12 neu-pressed text-blue-600 rounded-2xl flex items-center justify-center mx-auto bg-[#f1f5f9]">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h4 className="text-xl font-bold text-slate-900">Inquiry Received</h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          Thank you, <strong className="text-slate-900">{name}</strong>! Our sales team has received your message and will reach out to you directly on WhatsApp (+{phone}) shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setPhone("");
            setEmail("");
            setMessage("");
          }}
          className="text-xs font-semibold text-blue-600 neu-btn px-5 py-2 rounded-full pt-2 inline-block cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Direct sales contact form"
      className="neu-card p-6 sm:p-8 rounded-3xl space-y-4 text-left bg-white text-slate-800"
    >
      <div>
        <h4 className="text-lg font-bold text-slate-900">Connect with Our Sales Team</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Tell us about your team size or workflow requirements and we will be in touch.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="contact-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="contact-full-name"
              name="name"
              type="text"
              required
              aria-required="true"
              autoComplete="name"
              placeholder="e.g. Asad Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-phone-number" className="block text-xs font-semibold text-slate-700 mb-1">
            WhatsApp Phone <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="contact-phone-number"
              name="phone"
              type="tel"
              required
              aria-required="true"
              autoComplete="tel"
              placeholder="e.g. +92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="contact-email-address" className="block text-xs font-semibold text-slate-700 mb-1">
          Work Email (Optional)
        </label>
        <div className="relative">
          <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="contact-email-address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="asad@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message-body" className="block text-xs font-semibold text-slate-700 mb-1">
          How can we help your team? <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message-body"
          name="message"
          rows={3}
          required
          aria-required="true"
          placeholder="We are looking for a multi-agent WhatsApp inbox for our 5 sales representatives..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-label="Send sales consultation message"
        className="w-full py-3 neu-btn-primary text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
