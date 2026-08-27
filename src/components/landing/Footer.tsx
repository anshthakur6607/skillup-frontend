"use client";
/**
 * Footer — professional government-style footer with site sections.
 * Calmer/flatter than the hero — no competing visual weight.
 */
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Sign In", href: "/login" },
  { label: "Register", href: "/register" },
];

const resources = [
  { label: "iGOT Karmayogi", href: "https://igotkarmayogi.gov.in", external: true },
  { label: "Competency Framework", href: "/#features" },
  { label: "API Documentation", href: "#" },
  { label: "System Status", href: "/status" },
];

export function Footer() {
  return (
    <footer id="about" className="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpeg" alt="SkillUp" className="h-8 w-8 rounded-full object-cover" />
              <span className="text-white font-bold text-lg">SkillUp</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              An AI-enabled Skill Intelligence &amp; Learning Platform for
              India&apos;s Official Statistical System. Integrating with iGOT
              Karmayogi for national-scale capacity building.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 list-none p-0 m-0">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors no-underline text-slate-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 list-none p-0 m-0">
              {resources.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-white transition-colors no-underline text-slate-400"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors no-underline text-slate-400"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 list-none p-0 m-0">
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="shrink-0 mt-0.5 text-slate-500" />
                <span>
                  Ministry of Statistics &amp; Programme Implementation
                  <br />
                  Sardar Patel Bhawan, New Delhi
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} className="shrink-0 text-slate-500" />
                <span>support@skillup.gov.in</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} className="shrink-0 text-slate-500" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SkillUp — Government of India. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 no-underline transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 no-underline transition-colors">
              Terms of Use
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 no-underline transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
