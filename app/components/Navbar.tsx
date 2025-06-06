// app/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when any link or button inside is clicked
  const handleCloseMenu = () => {
    setIsOpen(false);
  };

  // Framer Motion variants for the sliding menu
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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-base-100 shadow-md px-4 md:px-8 py-3 flex flex-wrap items-center">
      {/* START: Logo + Mobile Controls */}
      <div className="w-full flex items-center justify-between lg:w-auto">
        <Link
          href="/"
          onClick={handleCloseMenu}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2Flogo_medium.png?alt=media&token=82359115-925c-4364-b00c-835b7b626aa8"
              alt={t("navbar.key.lightForGaza")}
              className="w-full h-full rounded-full"
            />
          </div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-base-content">
            {t("navbar.key.lightForGaza")}
          </span>
        </Link>

        {/* Mobile: Avatar (if logged in) + Hamburger Button */}
        <div className="flex items-center lg:hidden">
          {status !== "loading" && session && (
            <Link href="/profile" onClick={handleCloseMenu} className="mr-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={
                    (session.user as any)?.thumbnailUrl ||
                    "/favicon_lightforgaza.png"
                  }
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          )}
          <button
            className="btn btn-ghost btn-circle text-base-content"
            aria-label="Toggle menu"
            onClick={() => setIsOpen((prev) => !prev)}
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

      {/* DESKTOP MENU: page links take remaining width and centered */}
      <div className="navbar-center hidden lg:flex flex-1">
        <ul className="flex flex-1 justify-center space-x-1">
          <li className="flex-1 text-center">
            <Link
              href="/campaigns"
              className="btn btn-ghost hover:bg-transparent hover:text-primary text-base-content w-full whitespace-nowrap text-sm sm:text-base md:text-lg"
            >
              {t("navbar.key.campaigns")}
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link
              href="/policies"
              className="btn btn-ghost hover:bg-transparent hover:text-primary text-base-content w-full whitespace-nowrap text-sm sm:text-base md:text-lg"
            >
              {t("navbar.key.policies")}
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link
              href="/contact"
              className="btn btn-ghost hover:bg-transparent hover:text-primary text-base-content w-full whitespace-nowrap text-sm sm:text-base md:text-lg"
            >
              {t("navbar.key.contactUs")}
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link
              href="/about"
              className="btn btn-ghost hover:bg-transparent hover:text-primary text-base-content w-full whitespace-nowrap text-sm sm:text-base md:text-lg"
            >
              {t("navbar.key.aboutPlatform")}
            </Link>
          </li>
        </ul>
      </div>

      {/* DESKTOP RIGHT-SIDE: SignUp/Login or Avatar + Language + Theme */}
      <div className="navbar-end hidden lg:flex items-center space-x-2">
        {status !== "loading" && !session && (
          <>
            <Link
              href="/auth/register"
              className="btn btn-outline text-base-content whitespace-nowrap text-sm sm:text-base"
            >
              {t("navbar.key.signUp")}
            </Link>
            <Link
              href="/auth/login"
              className="btn btn-ghost text-base-content whitespace-nowrap text-sm sm:text-base"
            >
              {t("navbar.key.login")}
            </Link>
          </>
        )}

        {status !== "loading" && session && (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-8 h-8 rounded-full">
                <img
                  src={
                    (session.user as any)?.thumbnailUrl ||
                    "/favicon_lightforgaza.png"
                  }
                  alt="User Avatar"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 dark:bg-base-100 rounded-box w-48"
            >
              <li>
                <Link
                  href="/profile"
                  className="text-base-content whitespace-nowrap text-sm sm:text-base"
                >
                  {t("navbar.key.profile")}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-base-content whitespace-nowrap text-sm sm:text-base"
                >
                  {t("navbar.key.logout")}
                </button>
              </li>
            </ul>
          </div>
        )}

        <LanguageSwitcher
          currentLocale={currentLocale}
          supportedLocales={supportedLocales}
        />
        <ThemeToggle />
      </div>

      {/* MOBILE MENU: Animated with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              variants={backdropVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCloseMenu}
            />

            <motion.div
              className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-base-100 to-base-200 shadow-lg"
              variants={menuVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                <Link
                  href="/"
                  onClick={handleCloseMenu}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2Flogo_medium.png?alt=media&token=82359115-925c-4364-b00c-835b7b626aa8"
                      alt={t("navbar.key.lightForGaza")}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <span className="text-lg font-bold text-base-content">
                    {t("navbar.key.lightForGaza")}
                  </span>
                </Link>
                <button
                  aria-label="Close menu"
                  onClick={handleCloseMenu}
                  className="btn btn-ghost btn-circle text-base-content"
                >
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
                </button>
              </div>
              <ul className="flex flex-col space-y-2 px-4 py-4">
                <li>
                  <Link
                    href="/campaigns"
                    onClick={handleCloseMenu}
                    className="block px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                  >
                    {t("navbar.key.campaigns")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policies"
                    onClick={handleCloseMenu}
                    className="block px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                  >
                    {t("navbar.key.policies")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={handleCloseMenu}
                    className="block px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                  >
                    {t("navbar.key.contactUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={handleCloseMenu}
                    className="block px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                  >
                    {t("navbar.key.aboutPlatform")}
                  </Link>
                </li>
                {status !== "loading" && !session && (
                  <>
                    <li>
                      <Link
                        href="/auth/register"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                      >
                        {t("navbar.key.signUp")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/auth/login"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                      >
                        {t("navbar.key.login")}
                      </Link>
                    </li>
                  </>
                )}
                {status !== "loading" && session && (
                  <li>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        handleCloseMenu();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg text-base-content text-base font-medium hover:bg-base-300"
                    >
                      {t("navbar.key.logout")}
                    </button>
                  </li>
                )}
                <li className="flex justify-between items-center px-3 py-2">
                  <LanguageSwitcher
                    currentLocale={currentLocale}
                    supportedLocales={supportedLocales}
                  />
                  <ThemeToggle />
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
