import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Trang chủ", href: "#" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Dịch vụ", href: "#services" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#" className="text-xl font-black tracking-tight text-foreground">
          <span className="brand-swap">
            <span className="brand-chip rounded-md border border-cyan-600/40 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
              h1s
            </span>
            <span className="brand-name">Hosting1s</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-border/50 text-muted-foreground hover:text-foreground"
          >
            <Link to="/login">Đăng nhập Khách hàng</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-2xl px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="outline" size="sm" asChild className="mt-2 w-full border-border/50">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              Đăng nhập Khách hàng
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
