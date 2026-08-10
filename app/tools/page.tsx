import type { Metadata } from "next";
import PublicToolsClient from "./PublicToolsClient";

export const metadata: Metadata = {
  title: "Free EMI Calculator and SIP Calculator | Finnri",
  description:
    "Use Finnri's free EMI calculator and SIP calculator online. Estimate loan repayments, SIP maturity value, invested amount, returns, and yearly projections without login.",
  keywords: [
    "EMI calculator",
    "SIP calculator",
    "free EMI calculator",
    "free SIP calculator",
    "loan EMI calculator India",
    "mutual fund SIP calculator",
    "investment calculator India",
  ],
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Free EMI Calculator and SIP Calculator | Finnri",
    description:
      "Estimate loan EMI and SIP maturity value online without creating an account.",
    url: "/tools",
    siteName: "Finnri",
    type: "website",
  },
};

export default function ToolsPage() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free EMI Calculator and SIP Calculator",
    description:
      "Free online EMI and SIP calculators for estimating loan repayments and investment projections in India.",
    mainEntity: [
      {
        "@type": "SoftwareApplication",
        name: "EMI Calculator",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      },
      {
        "@type": "SoftwareApplication",
        name: "SIP Calculator",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <PublicToolsClient />
    </>
  );
}
