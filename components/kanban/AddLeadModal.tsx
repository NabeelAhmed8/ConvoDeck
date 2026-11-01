"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createLead } from "@/actions/leadActions";
import { LeadStage } from "@/types";
import { toast } from "@/store/useToastStore";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
  defaultStage?: LeadStage;
}

export function AddLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
  defaultStage = "NEW",
}: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [stage, setStage] = useState<LeadStage>(defaultStage);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and Phone number are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createLead({
        name: name.trim(),
        phone: phone.trim().replace(/\D/g, ""),
        email: email.trim(),
        company: company.trim(),
        dealValue: Number(dealValue) || 0,
        stage,
        notes: notes.trim(),
        tags: ["Manual Entry"],
      });

      if (res.success) {
        toast.success("Lead Created", `${name} added to the pipeline.`);
        setName("");
        setPhone("");
        setEmail("");
        setCompany("");
        setDealValue("");
        setNotes("");
        onClose();
        if (onLeadCreated) onLeadCreated();
      } else {
        setError(res.error || "Failed to create lead");
        toast.error("Failed to Create Lead", res.error || "Please verify your input");
      }
    } catch {
      setError("An unexpected error occurred.");
      toast.error("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Lead"
      description="Enter contact information to add a lead to your sales pipeline."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="p-3 text-xs bg-rose-100 text-rose-800 rounded-2xl border border-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="lead-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-full-name"
              name="name"
              placeholder="e.g. Bilal Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="lead-phone-number" className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-phone-number"
              name="phone"
              type="tel"
              placeholder="e.g. 923001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="lead-company-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Company
            </label>
            <input
              id="lead-company-name"
              name="company"
              placeholder="e.g. Acme Agency"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="lead-email-address" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="lead-email-address"
              name="email"
              type="email"
              placeholder="bilal@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="lead-deal-value" className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Value ($)
            </label>
            <input
              id="lead-deal-value"
              name="dealValue"
              type="number"
              placeholder="500"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="lead-stage-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Stage
            </label>
            <select
              id="lead-stage-select"
              name="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as LeadStage)}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
            >
              <option value="NEW">New Inquiry</option>
              <option value="CONTACTED">Contacted</option>
              <option value="DEMO_SCHEDULED">Demo Scheduled</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="WON">Closed Won</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="lead-internal-notes" className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Requirements
          </label>
          <textarea
            id="lead-internal-notes"
            name="notes"
            rows={3}
            placeholder="Customer asked about 5-seat WhatsApp plan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} className="neu-btn text-slate-700 border-none">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="neu-btn-primary border-none cursor-pointer">
            {loading ? "Adding..." : "Add to Pipeline"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
