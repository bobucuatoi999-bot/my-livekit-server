import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface PricingTier {
  name: string;
  price: string;
  resources: string;
  cta: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Gói Sơ Cấp",
    price: "45.000",
    resources: "1GB RAM · 20GB Storage",
    cta: "Thuê Ngay",
  },
  {
    name: "Gói Chuyên Nghiệp",
    price: "100.000",
    resources: "4GB RAM · 50GB Storage",
    cta: "Chọn Gói Này",
    popular: true,
  },
  {
    name: "Gói Ultra",
    price: "250.000",
    resources: "8GB RAM · 100GB Storage",
    cta: "Liên Hệ",
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  const handleGoToBilling = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      navigate("/login");
      return;
    }

    navigate("/dashboard#billing");
  };

  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Bảng giá đơn giản
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Không phí ẩn. Mở rộng khi bạn cần.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                tier.popular
                  ? "bg-primary/5 ring-1 ring-primary/30"
                  : "bg-card/50 hover:bg-card/80"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Phổ Biến Nhất
                </span>
              )}
              <h3 className="text-base font-semibold mb-4 text-foreground">{tier.name}</h3>
              <div className="mb-1">
                <span className="text-3xl font-black text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-sm ml-1">VNĐ/tháng</span>
              </div>
              <p className="text-xs text-muted-foreground mb-8">{tier.resources}</p>
              <div className="mt-auto">
                <Button
                  variant={tier.popular ? "neon" : "neon-outline"}
                  className="w-full"
                  size="sm"
                  onClick={handleGoToBilling}
                >
                  {tier.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 max-w-4xl mx-auto rounded-xl border border-border/50 bg-card/40 p-4 text-center">
          <p className="text-sm text-foreground">
            Thông tin thanh toán nhanh: <span className="font-mono">0912863155</span> (Cake)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Nội dung chuyển khoản: <span className="font-mono">H1S &lt;GOI_DICH_VU&gt; &lt;SODIENTHOAI_LIENHE&gt;</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
