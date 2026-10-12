"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Patients" | "Clinics" | "Security";
}

const FAQ_LIST: FAQItem[] = [
  {
    category: "Patients",
    question: "How do I register for clinic appointments without an existing account?",
    answer: "You can click 'Patient Register' and enter your full name, National Identity Card (NIC) number or alternative approved identifier, date of birth, and mobile number. You will receive an instant verification OTP to complete enrollment.",
  },
  {
    category: "Patients",
    question: "Can guardians register infants, children, or elderly family members?",
    answer: "Yes. HealthConnect LK includes assisted guardian registration allowing parents or legal guardians to book visits and track queue tokens on behalf of dependents.",
  },
  {
    category: "Clinics",
    question: "How does the Digital Queue Ticket work on appointment day?",
    answer: "Upon checking in at the hospital reception or confirming your scheduled arrival in the portal, a live ticket number is issued (e.g., C-024). You can view live serving tokens on your smartphone with estimated wait times, eliminating overcrowded waiting rooms.",
  },
  {
    category: "Clinics",
    question: "Does HealthConnect LK replace urgent emergency triage?",
    answer: "No. The system manages outpatient clinics and elective consultation queues. Severe acute emergencies must always be directed to the emergency treatment unit (ETU) or through Suwasariya 1990 ambulance triage immediately.",
  },
  {
    category: "Security",
    question: "How are my National Identity Card (NIC) and medical records protected?",
    answer: "NIC numbers and identifiers are protected with salted one-way hashing and encrypted tokenization in our MongoDB persistence layer. Plaintext secrets are never stored or logged in browser client storage.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#F8FAFC] text-[#172B4D] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Common Inquiries & Guidelines
          </h2>
          <p className="text-slate-600 text-base">
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
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <HelpCircle className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-900 text-base">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "transform rotate-180 text-teal-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#F8FAFC]">
                    <p>{item.answer}</p>
                    <span className="inline-block mt-3 text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
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
