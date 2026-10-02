import React from "react";
import { Link } from "react-router-dom";
import { AudioLines } from "lucide-react";
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Top section: brand + link columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="group flex items-center gap-2 text-slate-900 transition-colors hover:text-indigo-600"
            >
              <AudioLines className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="text-xl font-semibold tracking-tight">
                Vocalis
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Find your voice. Build, share, and grow with a community that
              listens.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/features"
                  className="text-slate-600 transition-colors hover:text-indigo-600"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-slate-600 transition-colors hover:text-indigo-600"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/changelog"
                  className="text-slate-600 transition-colors hover:text-indigo-600"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-slate-600 transition-colors hover:text-indigo-600"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-600 transition-colors hover:text-indigo-600"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-slate-600 transition-colors hover:text-indigo-600"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Connect</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@vocalis.com"
                aria-label="Email"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                <FaEnvelope className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 sm:flex-row sm:text-left">
          <p>© {currentYear} Vocalis. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="transition-colors hover:text-indigo-600"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-indigo-600"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
