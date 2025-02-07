import { FAQPageJsonLd } from "next-seo";

import HeadingCentered from "@/components/shared/HeadingCentered";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@fastform/ui/Accordion";

const FAQ_DATA = [
  {
    question: "What is Fastform?",
    answer: () => (
      <>
        Fastform is an open-source Experience Management tool that helps businesses understand what customers
        think and feel about their products. It integrates natively into your platform to conduct user
        research with a focus on data privacy and minimal development intervention.
      </>
    ),
  },
  {
    question: "How do I integrate Fastform into my application?",
    answer: () => (
      <>
        Integrating Fastform is a breeze. Simply copy a script tag to your HTML head, or use NPM to install
        Fastform for platforms like React, Vue, Svelte, etc. Once installed, initialize Fastform with your
        environment details. Learn more with our framework guides{" "}
        <a href="/docs/getting-started/framework-guides" className="text-brand-dark dark:text-brand-light">
          here
        </a>
        .
      </>
    ),
  },
  {
    question: "Is Fastform GDPR compliant?",
    answer: () => (
      <>
        Yes, Fastform is fully GDPR compliant. Whether you use our cloud solution or decide to self-host, we
        ensure compliance with all data privacy regulations.
      </>
    ),
  },
  {
    question: "Can I self-host Fastform?",
    answer: () => (
      <>
        Absolutely! We provide an option for users to host Fastform on their own server, ensuring even more
        control over data and compliance. And the best part? Self-hosting is available for free, always. For
        documentation on self hosting, click{" "}
        <a href="/docs/self-hosting/deployment" className="text-brand-dark dark:text-brand-light">
          here
        </a>
        .
      </>
    ),
  },
  {
    question: "How does Fastform pricing work?",
    answer: () => (
      <>
        Fastform offers a Free forever plan on the cloud that includes unlimited forms, in-product forms,
        and more. We also provide a self-hosting option which includes all free features and more, available
        at no cost. If you require additional features or responses, check out our pricing section above for
        more details.
      </>
    ),
  },
];

const faqJsonLdData = FAQ_DATA.map((faq) => ({
  questionName: faq.question,
  acceptedAnswerText: faq.answer(),
}));

export default function FAQ() {
  return (
    <div className="max-w-7xl py-4 sm:px-6 sm:pb-6 lg:px-8" id="faq">
      <FAQPageJsonLd mainEntity={faqJsonLdData} />
      <HeadingCentered heading="Frequently Asked Questions" teaser="FAQ" closer />
      <Accordion type="single" collapsible className="px-4 sm:px-0">
        {FAQ_DATA.map((faq, index) => (
          <AccordionItem key={`item-${index}`} value={`item-${index + 1}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer()}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
