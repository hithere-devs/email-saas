import { Github, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white/50 dark:border-gray-800 dark:bg-gray-950/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/hithere-devs/email-saas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/hithere_devs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-gray-900 dark:hover:text-gray-100"
            >
              Home
            </Link>
            <span>•</span>
            <Link
              href="/privacy-policy"
              className="hover:text-gray-900 dark:hover:text-gray-100"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms-of-service"
              className="hover:text-gray-900 dark:hover:text-gray-100"
            >
              Terms of Service
            </Link>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Built by{" "}
            <a
              href="https://x.com/hithere_devs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gray-900 dark:hover:text-gray-100"
            >
              @hithere_devs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
