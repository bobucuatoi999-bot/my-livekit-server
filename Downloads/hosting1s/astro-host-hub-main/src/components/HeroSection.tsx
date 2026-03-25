import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8 leading-[1.08] text-foreground">
          Hosting1s –{" "}
          <span className="text-gradient">Nền Tảng Cloud Thế Hệ Mới.</span>
        </h1>
        <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground mb-12 leading-relaxed">
          Khởi tạo VPS Cloud & Server Game chỉ trong 1 giây. Tốc độ, ổn định, chi phí tối ưu cho sinh viên & startup.
        </p>
        <Button variant="neon" size="lg" asChild>
          <a href="#pricing">Khám phá Bảng Giá</a>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
