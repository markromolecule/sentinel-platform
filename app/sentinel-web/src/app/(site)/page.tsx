import {
  HeroSection,
  FeatureSection,
  HowItWorksSection,
  CompareSection,
  DownloadSection
} from '@/app/(public)/landing';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <CompareSection />
      <DownloadSection />
    </>
  );
}
