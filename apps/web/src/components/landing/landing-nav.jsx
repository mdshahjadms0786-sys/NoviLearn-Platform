"use client";

import { GraduationCap, Menu } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AuthLinks } from "@/components/auth/auth-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Header, HeaderActions, HeaderBrand } from "@/components/ui/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LANDING_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
];

function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <GraduationCap className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export function LandingNav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <Header
      className={scrolled ? "border-b shadow-sm" : "border-b-transparent"}
    >
      <div className="flex min-w-0 items-center gap-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2">
                <BrandMark />
                NoviLearn
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 py-4">
              {LANDING_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
              <Button asChild>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Start learning free
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <HeaderBrand href="/">
          <BrandMark />
          NoviLearn
        </HeaderBrand>
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Page sections"
        >
          {LANDING_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <HeaderActions>
        <ThemeToggle />
        <AuthLinks />
      </HeaderActions>
    </Header>
  );
}
