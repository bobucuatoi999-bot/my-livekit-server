import { Cpu, HardDrive, MessageCircle, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const techSpecs = [
  {
    title: "CPU Intel Core i7",
    description:
      "Hiệu năng xử lý đa nhân mạnh mẽ, đáp ứng hoàn hảo cho Web Server và Game Server.",
    icon: Cpu,
  },
  {
    title: "Ổ cứng NVMe siêu tốc",
    description:
      "Khởi động máy chủ và load game map chỉ trong chớp mắt với tốc độ đọc/ghi vượt trội.",
    icon: HardDrive,
  },
  {
    title: "Bảo mật Zero-Trust",
    description:
      "Tích hợp sẵn mạng riêng ảo Tailscale, bảo vệ máy chủ khỏi các đợt rà quét từ public internet.",
    icon: ShieldCheck,
  },
];

const faqItems = [
  {
    question: "Làm sao để kết nối với máy chủ?",
    answer:
      "Chúng tôi sử dụng mạng riêng ảo Tailscale để đảm bảo bảo mật tuyệt đối. Bạn chỉ cần tải ứng dụng Tailscale, đăng nhập và sử dụng SSH/Remote Desktop thông qua IP nội bộ (ví dụ: 100.x.x.x).",
  },
  {
    question: "Tôi có thể chạy chung cả Website và Server Game không?",
    answer:
      "Chắc chắn rồi! Khách hàng được cấp toàn quyền quản trị cao nhất (Root Access). Bạn có thể cài đặt Nginx, aaPanel, Docker, hay máy chủ Minecraft tùy ý trên cùng một gói dịch vụ.",
  },
  {
    question: "Tôi cần hỗ trợ kỹ thuật thì liên hệ ở đâu?",
    answer:
      "Đội ngũ Hosting1s luôn túc trực. Bạn có thể nhắn tin trực tiếp vào nhóm Zalo hoặc Telegram của chúng tôi 24/7.",
  },
];

const TrustSignalsSection = () => {
  return (
    <section className="relative z-10 pb-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">
            Sức mạnh phần cứng vượt trội
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {techSpecs.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-border/50 bg-card/40 p-5 transition-colors duration-150 hover:border-cyan-600/40"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-xl border border-border/50 bg-card/30 p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              <h3 className="text-lg font-semibold text-foreground">Câu hỏi thường gặp</h3>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
