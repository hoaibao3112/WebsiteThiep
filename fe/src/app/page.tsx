"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function CinematicHeroPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#031B2A] text-white selection:bg-white/20">
      {/* ------------------------------------------------------------- */}
      {/* 1. FULLSCREEN VIDEO BACKGROUND */}
      {/* ------------------------------------------------------------- */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* ------------------------------------------------------------- */}
      {/* 2. NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="relative z-20 w-full px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="text-3xl tracking-tight text-white flex items-baseline hover:opacity-90 transition"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <span>Velorah</span>
          <sup className="text-xs ml-0.5 font-sans">®</sup>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href="/"
            className="text-white font-medium hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard/cards"
            className="text-white/65 hover:text-white transition-colors"
          >
            Studio
          </Link>
          <Link
            href="#about"
            className="text-white/65 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="#journal"
            className="text-white/65 hover:text-white transition-colors"
          >
            Journal
          </Link>
          <Link
            href="#contact"
            className="text-white/65 hover:text-white transition-colors"
          >
            Reach Us
          </Link>
        </nav>

        {/* RIGHT CTA (DESKTOP) */}
        <div className="hidden md:block">
          <Link
            href="/dashboard/cards/new"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.03] transition-transform inline-flex items-center justify-center cursor-pointer shadow-lg"
          >
            Begin Journey
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/90 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#031B2A]/95 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden animate-in fade-in duration-300">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-8 p-2 text-white/80"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="space-y-6 text-center">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-3xl font-medium text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Home
            </Link>
            <Link
              href="/dashboard/cards"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-3xl font-medium text-white/70 hover:text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Studio
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-3xl font-medium text-white/70 hover:text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              About
            </Link>
            <Link
              href="#journal"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-3xl font-medium text-white/70 hover:text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Journal
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-3xl font-medium text-white/70 hover:text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Reach Us
            </Link>
            <div className="pt-6">
              <Link
                href="/dashboard/cards/new"
                onClick={() => setMobileMenuOpen(false)}
                className="liquid-glass inline-block rounded-full px-8 py-3 text-sm font-medium text-white shadow-xl"
              >
                Begin Journey
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO CONTENT (VERTICALLY CENTERED CINEMATIC HERO) */}
      {/* ------------------------------------------------------------- */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] min-h-[calc(100vh-88px)]">
        {/* H1 HEADLINE WITH FADE-RISE ANIMATION */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-white animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where{" "}
          <em className="not-italic text-white/60">dreams</em> rise{" "}
          <em className="not-italic text-white/60">through the silence.</em>
        </h1>

        {/* SUBTEXT WITH FADE-RISE-DELAY ANIMATION */}
        <p className="text-white/65 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-normal animate-fade-rise-delay">
          We&apos;re designing tools for deep thinkers, bold creators, and quiet
          rebels. Amid the chaos, we build digital spaces for sharp focus and
          inspired work.
        </p>

        {/* CTA BUTTON WITH LIQUID GLASS & FADE-RISE-DELAY-2 */}
        <div className="animate-fade-rise-delay-2">
          <Link
            href="/dashboard/cards/new"
            className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white mt-12 hover:scale-[1.03] transition-transform inline-flex items-center justify-center cursor-pointer shadow-2xl"
          >
            Begin Journey
          </Link>
        </div>
      </main>
    </div>
  );
}
