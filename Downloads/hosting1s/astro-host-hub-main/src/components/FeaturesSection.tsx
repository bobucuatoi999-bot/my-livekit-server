import { Globe, Gamepad2, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureCardProps[] = [
  {
    icon: Globe,
    title: "Dịch vụ VPS Cloud",
    description: "Nền tảng Nginx mạnh mẽ, dễ dàng triển khai website aaPanel.",
  },
  {
    icon: Gamepad2,
    title: "Máy chủ Game",
    description: "Low-latency cho Minecraft, Palworld, CS:GO. Tickrate ổn định.",
  },
  {
    icon: Shield,
    title: "Bảo mật tối đa",
    description: "Tích hợp DDoS Protection 24/7, giữ dự án của bạn luôn online.",
  },
];

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="group rounded-2xl bg-card/50 p-8 transition-all duration-300 hover:bg-card/80">
    <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const FeaturesSection = () => {
  return (
    <section id="services" className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Dịch vụ của chúng tôi
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Mọi thứ bạn cần để triển khai và mở rộng dự án.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
