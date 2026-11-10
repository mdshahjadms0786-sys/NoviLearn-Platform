"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingNav } from "@/components/landing/landing-nav";
import { useAuth } from "@/lib/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { status } = useAuth();

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    }
  }, [router, status]);

  return (
    <>
      <LandingNav />
      <main className="min-h-screen">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCta />
      </main>
      <LandingFooter />
    </>
  );
}
