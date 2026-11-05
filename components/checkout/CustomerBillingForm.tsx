"use client";

import React from "react";
import { User, Building2, Mail, Phone } from "lucide-react";
import { NeumorphicAutocompleteInput } from "@/components/ui/NeumorphicAutocompleteInput";

interface CustomerBillingFormProps {
  ownerName: string;
  setOwnerName: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  billingEmail: string;
  setBillingEmail: (val: string) => void;
  whatsappPhone: string;
  setWhatsappPhone: (val: string) => void;
}

export function CustomerBillingForm({
  ownerName,
  setOwnerName,
  companyName,
  setCompanyName,
  billingEmail,
  setBillingEmail,
  whatsappPhone,
  setWhatsappPhone,
}: CustomerBillingFormProps) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
        1. Company &amp; Owner Profile
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
        <NeumorphicAutocompleteInput
          id="checkout-owner-name"
          name="name"
          type="text"
          label="Account Owner Name"
          required
          placeholder="e.g. Alex Smith"
          value={ownerName}
          onChange={setOwnerName}
          autoComplete="name"
          icon={<User className="w-4 h-4" />}
        />

        <NeumorphicAutocompleteInput
          id="checkout-company-name"
          name="organization"
          type="text"
          label="Business / Company Name"
          required
          placeholder="e.g. Acme Corporation"
          value={companyName}
          onChange={setCompanyName}
          autoComplete="organization"
          icon={<Building2 className="w-4 h-4" />}
        />

        <NeumorphicAutocompleteInput
          id="checkout-billing-email"
          name="email"
          type="email"
          label="Billing Email"
          required
          placeholder="billing@acme.com"
          value={billingEmail}
          onChange={setBillingEmail}
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
        />

        <NeumorphicAutocompleteInput
          id="checkout-whatsapp-phone"
          name="tel"
          type="tel"
          label="Primary WhatsApp Number"
          required
          placeholder="e.g. +1 555 123 4567"
          value={whatsappPhone}
          onChange={setWhatsappPhone}
          autoComplete="tel"
          icon={<Phone className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
