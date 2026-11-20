import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "PeoplePath | Employee onboarding",
  description: "A simple workspace for welcoming and onboarding new employees.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
