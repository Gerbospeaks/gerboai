import slide1 from "../assets/img/slide1.avif";
import slide2 from "../assets/img/slide2.avif";
import slide3 from "../assets/img/slide3.jpg";

const slides = [
  {
    image: slide1,
    title: "Seamless work experience",
    description: "Everything you need in an easily customizable dashboard",
  },
  {
    image: slide2,
    title: "Boost your productivity",
    description: "Streamline your workflow with powerful tools",
  },
  {
    image: slide3,
    title: "Collaborate effortlessly",
    description: "Work together with your team in real-time",
  },
];

export default function AuthRightPanel({ currentSlide, setCurrentSlide }) {
  return (
    <div className="hidden lg:flex lg:w-[48%] bg-[#0f1c3f] relative overflow-hidden items-center justify-center p-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1655e0]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1655e0]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2563eb]/10 rounded-full blur-2xl" />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-sm w-full">
        <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative overflow-hidden" style={{ height: "260px" }}>
            {slides.map((slide, i) => (
              <img
                key={i}
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c3f]/60 to-transparent" />
          </div>
          <div className="px-8 py-7">
            <div className="relative" style={{ minHeight: "80px" }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 ${i === currentSlide ? "opacity-100 translate-y-0 relative" : "opacity-0 absolute top-0 translate-y-2 pointer-events-none"}`}
                >
                  <h3 className="text-[20px] font-bold text-white mb-2">
                    {slide.title}
                  </h3>
                  <p className="text-[14px] text-white/60 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 h-2 bg-[#1655e0]" : "w-2 h-2 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { value: "28+", label: "Industries" },
            { value: "10k+", label: "Businesses" },
            { value: "99.9%", label: "Uptime" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-center backdrop-blur-sm"
            >
              <div className="text-[18px] font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-white/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
