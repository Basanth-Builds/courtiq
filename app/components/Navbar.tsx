"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-700 dark:bg-black/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <span className="text-white font-bold text-lg">CQ</span>
            </div>
            <span className="text-xl font-bold text-black dark:text-white hidden sm:inline">
              Court IQ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Login Button - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
          >
            <span
              className={`w-6 h-0.5 bg-black dark:bg-white rounded-full transition-all ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-black dark:bg-white rounded-full transition-all ${
                isOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-black dark:bg-white rounded-full transition-all ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-700 py-4">
            <div className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
