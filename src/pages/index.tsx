// pages/index.tsx
import React from "react";

import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import CTASection from "../components/CTASection";

import DefaultLayout from "@/layouts/default";

export default function Home() {
  return (
    <DefaultLayout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </DefaultLayout>
  );
}