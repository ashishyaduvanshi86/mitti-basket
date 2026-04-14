import { useEffect, useRef, useState } from "react";

const variants = {
  up: { hidden: "translate-y-8", visible: "translate-y-0" },
  down: { hidden: "-translate-y-8", visible: "translate-y-0" },
  left: { hidden: "translate-x-12", visible: "translate-x-0" },
  right: { hidden: "-translate-x-12", visible: "translate-x-0" },
  scale: { hidden: "scale-95", visible: "scale-100" },
};

export default function FadeInSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 700,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: "0px 0px 100px 0px" }
    );
    const current = ref.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  const v = variants[direction] || variants.up;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const actualDelay = isMobile ? Math.min(delay, 100) : delay;

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${actualDelay}ms`,
        transitionDuration: `${duration}ms`,
        transform: isVisible ? "" : undefined,
      }}
    >
      <div className={`transition-transform ease-out ${isVisible ? v.visible : v.hidden}`}
        style={{ transitionDelay: `${actualDelay}ms`, transitionDuration: `${duration}ms` }}>
        {children}
      </div>
    </div>
  );
}
