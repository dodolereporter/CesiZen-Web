// layouts/DefaultLayout.tsx
import React from "react";
import NextHead from "next/head";

import { siteConfig } from "@/config/site";
import Navbar from "@/components/Navbar";

export default function DefaultLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pageTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.name;
  
  return (
    <div className="flex flex-col min-h-screen">
      <NextHead>
        <title>{pageTitle}</title>
        <meta content={siteConfig.description} name="description" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        <meta name="theme-color" content="#10b981" />
      </NextHead>

      {/* Navbar fixe */}
      <Navbar />

      {/* Main content avec padding-top pour compenser la navbar fixe */}
      <main className="flex-grow w-full pt-16 sm:pt-20">{children}</main>
    </div>
  );
}