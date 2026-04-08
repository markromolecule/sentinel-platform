'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@sentinel/ui';
import { FAQ_ITEMS } from '@/app/(public)/landing/faq-section/_constants';
import Image from 'next/image';

export default function FAQSection() {
    return (
        <section id="faq" className="relative overflow-hidden bg-[#0f0f10] py-24 md:py-32">
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-12 text-center md:mb-16">
                        <div className="mb-6 inline-flex items-center gap-2">
                            <Image
                                src="/icons/icon0.svg"
                                alt="Sentinel"
                                width={20}
                                height={20}
                                className="h-5 w-5"
                            />
                            <span className="text-base font-medium text-gray-400">FAQs</span>
                        </div>
                        <h2 className="mb-6 max-w-3xl text-3xl leading-tight font-normal tracking-tight text-blue-100 md:text-5xl">
                            Frequently Asked Questions
                        </h2>
                        <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                            Everything you need to know about Sentinel.
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
                        {FAQ_ITEMS.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.02] px-5 transition-colors duration-200 hover:bg-white/[0.03] md:px-6"
                            >
                                <AccordionTrigger className="py-5 text-base font-medium text-gray-200 transition-colors hover:text-white hover:no-underline md:py-6 md:text-lg">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="pr-8 pb-5 text-sm leading-relaxed text-gray-400 md:pb-6 md:text-base">
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
