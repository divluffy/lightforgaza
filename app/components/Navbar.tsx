// app/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

type NavbarProps = {
  currentLocale: string;
  supportedLocales: string[];
};

export default function Navbar({
  currentLocale,
  supportedLocales,
}: NavbarProps) {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // shared menu items
  const menuItems = [
    { href: "/campaigns", label: t("navbar.key.campaigns") },
    { href: "/policies", label: t("navbar.key.policies") },
    { href: "/contact", label: t("navbar.key.contactUs") },
    { href: "/about", label: t("navbar.key.aboutPlatform") },
  ];

  // highlight active route
  const linkClasses = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-primary text-white"
        : "text-base-content hover:text-primary hover:bg-base-200"
    }`;

  // Framer Motion variants
  const backdropVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const menuVariant = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { y: "-100%", opacity: 0, transition: { ease: "easeInOut" } },
  };

  const handleCloseMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 inset-x-0 bg-base-100 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleCloseMenu}
            className="flex items-center space-x-2"
          >
            <img
              src="https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2Flogo_medium.png?alt=media&token=82359115-925c-4364-b00c-835b7b626aa8"
              alt={t("navbar.key.lightForGaza")}
              className="h-10 w-10 rounded-full"
            />
            <span className="text-xl font-bold">
              {t("navbar.key.lightForGaza")}
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:space-x-4 lg:items-center lg:flex-1 lg:justify-center">
            {menuItems.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClasses(href)}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Auth buttons */}
            {status !== "loading" && !session && (
              <>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-primary hover:text-white transition"
                >
                  {t("navbar.key.signUp")}
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-base-content rounded-md text-sm font-medium hover:bg-base-200 transition"
                >
                  {t("navbar.key.login")}
                </Link>
              </>
            )}

            {/* User dropdown */}
            {status !== "loading" && session && (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={
                        (session.user as any)?.thumbnailUrl ||
                        "/favicon_lightforgaza.png"
                      }
                      alt="Avatar"
                      className="object-cover"
                    />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-48"
                >
                  <li>
                    <Link href="/profile" className="text-base-content text-sm">
                      {t("navbar.key.profile")}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-base-content text-sm"
                    >
                      {t("navbar.key.logout")}
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Language + Theme */}
            <LanguageSwitcher
              currentLocale={currentLocale}
              supportedLocales={supportedLocales}
            />
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              variants={backdropVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCloseMenu}
            />
            <motion.div
              className="fixed top-0 inset-x-0 bg-base-100 shadow-lg z-50"
              variants={menuVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-4 py-4">
                <nav className="space-y-2">
                  {menuItems.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={handleCloseMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-base-content hover:bg-base-200 transition"
                    >
                      {label}
                    </Link>
                  ))}

                  {status !== "loading" && !session && (
                    <>
                      <Link
                        href="/auth/register"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary hover:text-white transition"
                      >
                        {t("navbar.key.signUp")}
                      </Link>
                      <Link
                        href="/auth/login"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-md text-base font-medium text-base-content hover:bg-base-200 transition"
                      >
                        {t("navbar.key.login")}
                      </Link>
                    </>
                  )}

                  {status !== "loading" && session && (
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        handleCloseMenu();
                      }}
                      className="text-start w-full cursor-pointer px-3 py-2 rounded-md text-base font-medium text-base-content hover:bg-base-200 transition"
                    >
                      {t("navbar.key.logout")}
                    </button>
                  )}
                </nav>

                <div className="mt-4 flex justify-between items-center px-3">
                  <LanguageSwitcher
                    currentLocale={currentLocale}
                    supportedLocales={supportedLocales}
                  />
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
