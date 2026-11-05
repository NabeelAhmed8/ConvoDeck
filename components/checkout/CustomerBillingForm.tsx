"use client";

import React from "react";
import { Input } from "@/components/ui/Input";

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
        1. Company & Owner Profile
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          id="checkout-owner-name"
          name="ownerName"
          label="Account Owner Name"
          required
          autoComplete="off"
          placeholder="e.g. Alex Smith"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />

        <Input
          id="checkout-company-name"
          name="companyName"
          label="Business / Company Name"
          required
          autoComplete="off"
          placeholder="e.g. Acme Corporation"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <Input
          id="checkout-billing-email"
          name="billingEmail"
          label="Billing Email"
          type="email"
          required
          autoComplete="off"
          placeholder="billing@acme.com"
          value={billingEmail}
          onChange={(e) => setBillingEmail(e.target.value)}
        />

        <Input
          id="checkout-whatsapp-phone"
          name="whatsappPhone"
          label="Primary WhatsApp Number"
          type="tel"
          required
          autoComplete="off"
          placeholder="e.g. +1 555 123 4567"
          value={whatsappPhone}
          onChange={(e) => setWhatsappPhone(e.target.value)}
        />
      </div>
    </div>
  );
}
