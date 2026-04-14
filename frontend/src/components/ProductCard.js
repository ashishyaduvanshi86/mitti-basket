import { useState, useMemo, useRef } from "react";
import { ShoppingBag, Minus, Plus, Check, Bell, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const BADGE_TYPE_LABELS = {
  SOLD_OUT: "Sold Out",
  BEST_SELLER: "Best Seller",
  COMING_SOON: "Coming Soon",
  LIMITED_HARVEST: "Limited Harvest",
  SEASON_ENDING: "Season Ending",
};

export function ProductCard({ product }) {
  const {
    id, name, tagline, origin, basePrice, unit,
    minQty = 1, qtyStep = 1, qtyUnit = "kg",
    badge, badge_type, badge_text, badge_color,
    image, subscribable = false, comingSoon = false,
    availability_status,
    next_harvest_window, show_harvest_window,
  } = product;

  // Derive availability from new field, fallback to legacy
  const avail = availability_status || (comingSoon ? "COMING_SOON" : "AVAILABLE");
  const isSoldOut = avail === "SOLD_OUT";
  const isComingSoon = avail === "COMING_SOON";
  const isPreorder = avail === "PREORDER";
  const canPurchase = avail === "AVAILABLE" || avail === "PREORDER";
  const showNotifyMe = isSoldOut || isComingSoon;

  const { items, addToCart, updateQuantity: updateCartQty } = useCart();
  const cartItem = items.find((i) => i.id === id);
  const inCart = !!cartItem;

  const [showButton, setShowButton] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [quantity, setQuantity] = useState(minQty);
  const [justAdded, setJustAdded] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);
  const hideTimer = useRef(null);
  const addedTimer = useRef(null);

  const incrementStep = qtyUnit === "gm" ? (qtyStep || 250) : 1;
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

  const fmtQty = (val) => {
    if (qtyUnit === "gm" && val >= 1000) return `${val / 1000} kg`;
    return `${val} ${qtyUnit}`;
  };

  const totalPrice = useMemo(() => {
    if (!basePrice) return null;
    return Math.round(basePrice * (quantity / minQty));
  }, [basePrice, quantity, minQty]);

  const cartPrice = useMemo(() => {
    if (!inCart || !basePrice) return null;
    return Math.round(basePrice * (cartItem.quantity / minQty));
  }, [inCart, cartItem, basePrice, minQty]);

  const fmtPrice = (val) => (val ? val.toLocaleString("en-IN") : "");

  // Badge display logic
  const getBadgeInfo = () => {
    if (badge_type && badge_type !== "") {
      const text = badge_type === "CUSTOM" ? (badge_text || "") : (BADGE_TYPE_LABELS[badge_type] || badge_type);
      return { text, color: badge_color || null };
    }
    // Availability status takes priority over legacy badge
    if (isSoldOut) return { text: "Sold Out", color: null };
    if (isComingSoon) return { text: "Coming Soon", color: null };
    if (badge) return { text: badge, color: null };
    return null;
  };

  const badgeInfo = getBadgeInfo();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, quantity);
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => {
      setJustAdded(false);
      setShowOptions(false);
      setShowButton(false);
    }, 1200);
  };

  const handleCartIncrement = (e) => {
    e.stopPropagation();
    updateCartQty(id, cartItem.quantity + incrementStep);
  };

  const handleCartDecrement = (e) => {
    e.stopPropagation();
    updateCartQty(id, Math.max(minQty, cartItem.quantity - incrementStep));
  };

  const handleNotifyMe = async (e) => {
    e.stopPropagation();
    if (!notifyEmail.trim()) return;
    setNotifyLoading(true);
    try {
      await fetch(`${API}/products/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id, email: notifyEmail.trim() }),
      });
      setNotifyDone(true);
      setTimeout(() => {
        setNotifyDone(false);
        setShowOptions(false);
        setShowButton(false);
        setNotifyEmail("");
      }, 2000);
    } catch {
      // silent fail
    }
    setNotifyLoading(false);
  };

  /* ── Desktop hover handlers ── */
  const handleCardEnter = () => {
    if (!isTouchDevice) { clearTimeout(hideTimer.current); setShowButton(true); }
  };
  const handleCardLeave = () => {
    if (!isTouchDevice) {
      hideTimer.current = setTimeout(() => { setShowOptions(false); setShowButton(false); }, 150);
    }
  };
  const handlePillEnter = () => {
    if (!isTouchDevice) { clearTimeout(hideTimer.current); setShowOptions(true); }
  };
  const handlePillLeave = () => {
    if (!isTouchDevice) { hideTimer.current = setTimeout(() => setShowOptions(false), 200); }
  };
  const handleOptionsEnter = () => clearTimeout(hideTimer.current);
  const handleOptionsLeave = () => {
    if (!isTouchDevice) { hideTimer.current = setTimeout(() => setShowOptions(false), 200); }
  };

  /* ── Touch handlers ── */
  const handleCardTap = () => {
    if (!isTouchDevice) return;
    if (showOptions) { setShowOptions(false); setShowButton(false); }
    else if (showButton) { setShowButton(false); }
    else { setShowButton(true); }
  };
  const handlePillTap = (e) => {
    if (!isTouchDevice) return;
    e.stopPropagation();
    setShowOptions(true);
  };

  // Badge style helpers
  const getBadgeClasses = () => {
    if (badge_color) {
      return "border-transparent text-white";
    }
    if (isSoldOut || isComingSoon) return "bg-[#1A1A1A]/70 text-white border-transparent";
    if (badge === "Best Seller" || badge_type === "BEST_SELLER") return "border-[#3A5A40] text-[#3A5A40] bg-white/90";
    if (badge === "Limited Edition" || badge_type === "LIMITED_HARVEST") return "border-[#3A5A40] text-[#3A5A40] bg-white/90";
    if (badge === "New" || badge === "Grand Size") return "bg-[#3A5A40] text-white border-[#3A5A40]";
    if (badge === "Superfood" || badge_type === "SEASON_ENDING") return "bg-[#DDB892] text-[#1A1A1A] border-[#DDB892]";
    return "border-[#DDB892] text-[#3A5A40] bg-white/90";
  };

  return (
    <div
      className="group relative bg-[#F0EDE8] overflow-hidden cursor-pointer flex flex-col"
      data-testid={`product-card-${id}`}
      onMouseEnter={handleCardEnter}
      onMouseLeave={handleCardLeave}
      onClick={handleCardTap}
    >
      {/* Badge */}
      {badgeInfo && badgeInfo.text && (
        <div className="absolute top-4 left-4 z-20">
          <span
            className={`inline-block px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.1em] rounded-full border ${getBadgeClasses()}`}
            style={badge_color ? { backgroundColor: badge_color } : undefined}
            data-testid={`product-badge-${id}`}
          >
            {badgeInfo.text}
          </span>
        </div>
      )}

      {/* Preorder label */}
      {isPreorder && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-block px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.1em] rounded-full bg-blue-600 text-white border-transparent"
            data-testid={`preorder-badge-${id}`}>
            Pre-order
          </span>
        </div>
      )}

      {/* In-cart indicator badge (top right) */}
      {inCart && canPurchase && (
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.08em] rounded-full bg-[#3A5A40] text-white">
            <Check className="w-3 h-3" />
            In Basket
          </span>
        </div>
      )}

      {/* Image container */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
        <img
          src={image}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${showButton ? "scale-105" : ""} ${isSoldOut ? "grayscale-[30%]" : ""}`}
          loading="lazy"
        />

        {/* Gradient at bottom when pill visible */}
        <div className={`absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 pointer-events-none ${showButton && !showOptions ? "opacity-100" : "opacity-0"}`} />

        {/* ── Stage 1: Pill button ── */}
        <div
          className={`absolute inset-x-3 bottom-3 z-20 transition-all duration-300 ease-out ${showButton && !showOptions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          onMouseEnter={handlePillEnter}
          onMouseLeave={handlePillLeave}
          onClick={handlePillTap}
        >
          {showNotifyMe ? (
            <div
              className="w-full rounded-full flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 shadow-lg bg-[#1A1A1A]/80 backdrop-blur-sm cursor-pointer"
              data-testid={`notify-pill-${id}`}
            >
              <Bell className="w-3.5 h-3.5 text-white mr-2" />
              <span className="font-inter text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.06em] text-white">
                Notify Me When Available
              </span>
            </div>
          ) : inCart ? (
            <div
              className="w-full rounded-full flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 shadow-lg bg-[#3A5A40]/95 backdrop-blur-sm hover:bg-[#3A5A40] transition-colors cursor-pointer"
              data-testid={`preorder-pill-${id}`}
            >
              <span className="font-inter text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.06em] text-white">
                {fmtQty(cartItem.quantity)} Added
              </span>
              <span className="font-inter text-[10px] md:text-[11px] text-white/70">
                Tap to edit
              </span>
            </div>
          ) : (
            <div
              className="w-full rounded-full flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 shadow-lg bg-[#FAF7F2]/95 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer"
              data-testid={`preorder-pill-${id}`}
            >
              <span className="font-inter text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.06em] text-[#1A1A1A]">
                {isPreorder ? "Pre-order Now" : "Add to Basket"}
              </span>
              {totalPrice !== null && (
                <span className="font-inter text-[12px] md:text-[14px] font-bold text-[#1A1A1A]">
                  &#8377;{fmtPrice(totalPrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Stage 2: Options panel ── */}
        <div
          className={`absolute inset-0 bg-white/95 backdrop-blur-sm transition-all duration-300 flex flex-col justify-center px-5 z-30 ${showOptions ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onMouseEnter={handleOptionsEnter}
          onMouseLeave={handleOptionsLeave}
        >
          {showNotifyMe ? (
            /* ── Notify Me form ── */
            notifyDone ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-10 h-10 bg-[#3A5A40]/10 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-5 h-5 text-[#3A5A40]" />
                </div>
                <p className="font-inter text-sm font-semibold text-[#3A5A40]">You're on the list!</p>
                <p className="font-inter text-[11px] text-[#4B5563] mt-1">We'll email you when it's back.</p>
              </div>
            ) : (
              <>
                <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#3A5A40] font-bold mb-1 text-center">
                  {isSoldOut ? "Sold Out" : "Coming Soon"}
                </p>
                <p className="font-inter text-[12px] text-[#4B5563] text-center mb-4">
                  Get notified when <strong>{name}</strong> is available
                </p>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => { e.stopPropagation(); setNotifyEmail(e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="your@email.com"
                  className="w-full border border-[#3A5A40]/20 px-3 py-2.5 text-sm font-inter focus:outline-none focus:border-[#3A5A40] mb-3"
                  data-testid={`notify-email-${id}`}
                />
                <button
                  onClick={handleNotifyMe}
                  disabled={notifyLoading || !notifyEmail.trim()}
                  className="w-full bg-[#3A5A40] text-white py-2.5 font-inter font-semibold text-[12px] uppercase tracking-[0.08em] flex items-center justify-center gap-2 hover:bg-[#2c4430] transition-colors disabled:opacity-40"
                  data-testid={`notify-submit-${id}`}
                >
                  {notifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  Notify Me
                </button>
              </>
            )
          ) : justAdded ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-10 h-10 bg-[#3A5A40]/10 rounded-full flex items-center justify-center mb-2">
                <Check className="w-5 h-5 text-[#3A5A40]" />
              </div>
              <p className="font-inter text-sm font-semibold text-[#3A5A40]">Added to Basket!</p>
            </div>
          ) : inCart ? (
            /* ── In-cart editing mode ── */
            <>
              <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#3A5A40] font-bold mb-3 text-center">
                {fmtQty(cartItem.quantity)} in your basket
              </p>
              <div className="flex items-center border border-[#3A5A40]/20 mb-3">
                <button
                  onClick={handleCartDecrement}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#3A5A40]/5 transition-colors"
                  data-testid={`qty-minus-${id}`}
                >
                  <Minus className="w-3.5 h-3.5 text-[#3A5A40]" />
                </button>
                <span className="flex-1 text-center font-inter text-sm font-semibold text-[#1A1A1A]">
                  {fmtQty(cartItem.quantity)}
                </span>
                <button
                  onClick={handleCartIncrement}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#3A5A40]/5 transition-colors"
                  data-testid={`qty-plus-${id}`}
                >
                  <Plus className="w-3.5 h-3.5 text-[#3A5A40]" />
                </button>
              </div>
              {cartPrice !== null && (
                <div className="py-2 border-y border-[#3A5A40]/10 flex items-center justify-between mb-3">
                  <span className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#4B5563]">Total</span>
                  <span className="font-inter text-lg font-bold text-[#3A5A40]" data-testid={`total-price-${id}`}>
                    &#8377;{fmtPrice(cartPrice)}
                  </span>
                </div>
              )}
              <p className="font-inter text-[10px] text-center text-[#4B5563]">
                Adjust by {fmtQty(incrementStep)} at a time
              </p>
            </>
          ) : (
            /* ── New add-to-cart mode ── */
            <>
              <div className="mb-3">
                <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                  {isPreorder ? "Pre-order" : "Quantity"} (min {fmtQty(minQty)})
                </p>
                <div className="flex items-center border border-[#3A5A40]/20">
                  <button
                    onClick={(e) => { e.stopPropagation(); setQuantity((q) => Math.max(minQty, q - incrementStep)); }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#3A5A40]/5 transition-colors"
                    data-testid={`qty-minus-${id}`}
                  >
                    <Minus className="w-3.5 h-3.5 text-[#3A5A40]" />
                  </button>
                  <span className="flex-1 text-center font-inter text-sm font-semibold text-[#1A1A1A]">
                    {fmtQty(quantity)}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setQuantity((q) => q + incrementStep); }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#3A5A40]/5 transition-colors"
                    data-testid={`qty-plus-${id}`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#3A5A40]" />
                  </button>
                </div>
              </div>

              {totalPrice !== null && (
                <div className="mb-3 py-2 border-y border-[#3A5A40]/10 flex items-center justify-between">
                  <span className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#4B5563]">Total</span>
                  <span className="font-inter text-lg font-bold text-[#3A5A40]" data-testid={`total-price-${id}`}>
                    &#8377;{fmtPrice(totalPrice)}
                  </span>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full bg-[#3A5A40] text-white py-3 font-inter font-semibold text-[12px] uppercase tracking-[0.08em] flex items-center justify-between px-4 hover:bg-[#2c4430] transition-colors"
                data-testid={`add-to-cart-${id}`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {isPreorder ? "Pre-order" : "Add to Basket"}
                </span>
                {totalPrice !== null && <span>&#8377;{fmtPrice(totalPrice)}</span>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content below image */}
      <div className="p-3 pb-4 md:p-5 md:pb-6 flex-1">
        {origin && (
          <p className="font-inter text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-[#3A5A40]/60 mb-0.5 md:mb-1">
            {origin}
          </p>
        )}
        <h3 className="font-playfair text-sm md:text-lg text-[#1A1A1A] tracking-tight leading-tight">
          {name}
        </h3>
        {show_harvest_window && next_harvest_window && (
          <p className="font-inter text-[9px] md:text-[10px] italic text-[#3A5A40]/70 mt-0.5 leading-snug"
            data-testid={`harvest-window-${id}`}>
            {next_harvest_window}
          </p>
        )}
        {tagline && (
          <p className="font-inter text-[11px] md:text-[13px] text-[#4B5563] mt-0.5 md:mt-1 leading-relaxed line-clamp-2">
            {tagline}
          </p>
        )}
        {basePrice && (
          <div className="flex items-baseline gap-1 mt-2 md:mt-3">
            <span className={`font-inter text-[13px] md:text-[15px] font-semibold ${!canPurchase ? "text-[#4B5563]" : "text-[#1A1A1A]"}`}>
              &#8377;{fmtPrice(basePrice)}
            </span>
            {unit && (
              <span className="font-inter text-[9px] md:text-[11px] text-[#4B5563]">/ {unit}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
