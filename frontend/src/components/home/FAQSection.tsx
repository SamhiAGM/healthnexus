"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Patients" | "Clinics" | "Security";
}

const FAQ_LIST: FAQItem[] = [
  {
    category: "Patients",
    question: "How do I register for clinic appointments without an existing account?",
    answer: "You can click 'Create Patient Account' and enter your full name, National Identity Card (NIC) number, date of birth, and email address. You will receive an instant verification OTP to complete enrollment and begin booking appointments.",
  },
  {
    category: "Patients",
    question: "Can guardians register infants, children, or elderly family members?",
    answer: "Yes. HealthNexus includes assisted guardian registration allowing parents or legal guardians to book visits and track queue tokens on behalf of dependents under one verified master profile.",
  },
  {
    category: "Clinics",
    question: "How does the Digital Queue Ticket work on appointment day?",
    answer: "Upon checking in at the hospital reception or confirming your scheduled arrival in the portal, a live ticket number is issued (e.g., C-024). You can view live serving tokens on your smartphone with estimated wait times, eliminating overcrowded waiting rooms.",
  },
  {
    category: "Clinics",
    question: "Does HealthNexus replace urgent emergency triage?",
    answer: "No. The system manages outpatient clinics, elective consultations, and departmental queues. Severe acute emergencies must always be directed immediately to the Emergency Treatment Unit (ETU) or through 1990 Suwa Seriya ambulance triage.",
  },
  {
    category: "Security",
    question: "How are my National Identity Card (NIC) and medical records protected?",
    answer: "NIC numbers and identifiers are protected with salted one-way cryptographic hashing and encrypted tokenization in our MongoDB persistence layer. Plaintext session tokens are never stored in browser localStorage.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#E7EFF1] text-[#3C5262] relative border-t border-[#D5E0E3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Common Inquiries &amp; Guidelines
          </h2>
          <p className="text-[#667986] text-base">
            Everything you need to know about navigating appointments, queues, and clinical workflows.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {FAQ_LIST.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] overflow-hidden shadow-2xs hover:border-[#108B83]/50 transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#108B83]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <HelpCircle className="w-5 h-5 text-[#108B83] shrink-0" />
                    <span className="font-bold text-[#243847] text-base">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#698399] shrink-0 transition-transform duration-200 ${
                      isOpen ? "transform rotate-180 text-[#108B83]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-[#3C5262] leading-relaxed border-t border-[#D5E0E3] bg-[#F6F9F8]">
                    <p>{item.answer}</p>
                    <span className="inline-block mt-3 text-[11px] font-bold text-[#08786F] uppercase tracking-wider">
                      Category: {item.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
