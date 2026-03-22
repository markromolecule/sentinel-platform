'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@sentinel/ui";
import { FAQ_ITEMS } from "@/app/(public)/landing/faq-section/_constants";
import Image from "next/image";

export default function FAQSection() {
    return (
        <section id="faq" className="py-24 md:py-32 bg-[#0f0f10] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <Image src="/icons/icon0.svg" alt="Sentinel" width={20} height={20} className="w-5 h-5" />
                            <span className="text-base text-gray-400 font-medium">FAQs</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-normal text-blue-200 mb-6 font-sans tracking-tight max-w-3xl leading-tight">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Everything you need to know about Sentinel.
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <Accordion type="single" collapsible className="space-y-4">
                        {FAQ_ITEMS.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="border border-white/10 bg-white/5 rounded-2xl px-6 transition-all duration-300 hover:bg-white/[0.07] overflow-hidden"
                            >
                                <AccordionTrigger className="text-lg font-medium text-gray-200 py-6 hover:no-underline hover:text-white transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-400 leading-relaxed pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
