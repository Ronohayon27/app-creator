"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import UserControl from "@/components/user-control";
import { SunMoon } from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href={"/"} className="flex items-center gap-2">
          <Image src={"/Logo.svg"} width={24} height={24} alt="Appcreator" />
          <span className="font-semibold text-lg">Appcreator</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            <SunMoon className="h-5 w-5" />
          </Button>
          <SignedOut>
            <div className="flex gap-2">
              <SignUpButton>
                <Button variant={"outline"} size={"sm"}>
                  Sign Up
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button size={"sm"}>Sign In</Button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserControl showName />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
