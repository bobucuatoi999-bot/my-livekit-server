import { MessageCircle, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/30 py-8">
      <div className="container mx-auto flex flex-col items-start justify-between gap-3 px-4 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          © 2026 Hosting1s. Nền tảng Cloud &amp; Game Server.
        </p>

        <div className="flex items-center gap-4 text-sm">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            Hỗ trợ Zalo
          </a>
          <a
            href="https://t.me/Hosting1s"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <Send className="h-4 w-4" />
            Cộng đồng Telegram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
