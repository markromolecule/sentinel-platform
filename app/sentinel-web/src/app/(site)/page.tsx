import {
  HeroSection,
  FeatureSection,
  HowItWorksSection,
  CompareSection,
  DownloadSection,
  FAQSection
} from '@/app/(public)/landing';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <CompareSection />
      <FAQSection />
      <DownloadSection />
    </>
  );
}
