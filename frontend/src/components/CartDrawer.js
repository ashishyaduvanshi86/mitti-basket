import { useState, useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Check, CreditCard, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import { useRef } from "react";


const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartDrawer({ open, onOpenChange }) {
  const otpTimer = useRef(null);
  const { items, updateQuantity, removeItem, clearCart, subtotal, fmtQty, getItemPrice } = useCart();
  const [view, setView] = useState("cart");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", pincode: "", city: "" });
  const [submitting, setSubmitting] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [minOrderSettings, setMinOrderSettings] = useState({ enabled: true, value: 1200 });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpTriggered, setOtpTriggered] = useState(false);

  const fmtPrice = (val) => val.toLocaleString("en-IN");
  const getIncrementStep = (item) => (item.qtyUnit === "gm" ? 250 : 1);

  useEffect(() => {
  // Load Razorpay key
  axios
    .get(`${API}/razorpay-key`)
    .then((r) => setRazorpayKeyId(r.data.key_id))
    .catch(() => {});

  // Load minimum order settings
  axios
    .get(`${API}/settings/public`)
    .then((r) => {
      setMinOrderSettings({
        enabled: r.data.minimum_order_enabled,
        value: r.data.minimum_order_value || 1200,
      });
    })
    .catch(() => {});
}, []);

useEffect(() => {
  const savedPhone = localStorage.getItem("verified_phone");

  if (savedPhone) {
    setForm((prev) => ({ ...prev, phone: savedPhone }));
    setPhoneVerified(true);
  }
}, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

const triggerOtpVerification = (mobile) => {
  const attemptInit = () => {
  if (!window.initSendOTP) {
    setTimeout(attemptInit, 300);
    return;
  }
  if (document.getElementById("verify-modal")) {
  return;
  }

  window.initSendOTP({
    widgetId: "36646e684d57323330313635",
    tokenAuth: "508408Tl99Q27rW69ddfe00P1",
    identifier: "91" + mobile,
    countryCode: "91",

    success: async (data) => {
      await axios.post(`${API}/verify-phone`, {
        token: data.token,
        phone: mobile,
      });

      setPhoneVerified(true);
      localStorage.setItem("verified_phone", mobile);
    },

    failure: () => {
      setOtpTriggered(false);
    },
  });
};

  attemptInit();
};

const checkIfPhoneAlreadyVerified = async (phone) => {
  try {
    const res = await axios.post(`${API}/check-phone-verified`, { phone });
    return res.data.verified;
  } catch {
    return false;
  }
};
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!phoneVerified) {
  alert("Please verify your mobile number before placing order");
  setSubmitting(false);
  return;
}
    setSubmitting(true);
    

    try {
      const itemsForApi = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: fmtQty(item),
        qtyUnit: item.qtyUnit || "kg",
        unit_price: item.basePrice,
        total_price: getItemPrice(item),
      }));

      // Create order + Razorpay order
      const { data: order } = await axios.post(`${API}/orders`, {
  name: form.name,
  phone: form.phone,
  email: form.email,
  address: form.address,
  city: form.city,
  pincode: form.pincode,
  items: itemsForApi,
  subtotal,
});

      setCurrentOrderId(order.id);

      // Load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Payment system failed to load. Please try again.");
        setSubmitting(false);
        return;
      }

      const options = {
  key: razorpayKeyId,
  amount: subtotal * 100,
  currency: "INR",

  name: "Mitti Basket",
  description: `Order: ${items.map((i) => `${fmtQty(i)} ${i.name}`).join(", ")}`,

  order_id: order.razorpay_order_id,

  prefill: {
    name: form.name,
    email: form.email,
    contact: form.phone,
  },

  notes: {
    order_id: order.id,
  },

  theme: {
    color: "#3A5A40",
  },

  retry: {
    enabled: true,
  },

  timeout: 300,

  method: {
    upi: true,
    card: true,
    netbanking: true,
    wallet: true,
  },

  config: {
    display: {
      blocks: {
        payment_methods: {
          name: "Pay using",
          instruments: [
            { method: "upi" },
            { method: "card" },
            { method: "netbanking" },
          ],
        },
      },
      sequence: ["block.payment_methods"],
      preferences: {
        show_default_blocks: true,
      },
    },
  },

  handler: async function (response) {
    try {
      await axios.post(`${API}/payment/verify`, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: order.id,
      });

      clearCart();
      setCurrentOrderId(order.id);
      setView("success");

    } catch {
      alert("Payment verification failed. Please contact support.");
    }

    setSubmitting(false);
  },

  modal: {
    ondismiss: function () {
      setSubmitting(false);
    },
  },
};
if (!window.Razorpay) {
  alert("Payment system failed to load. Please refresh and try again.");
  return;
}

setTimeout(() => {
  const rzp = new window.Razorpay(options);
  rzp.open();
}, 300);
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setView("cart");
    setForm({ name: "", phone: "", email: "", address: "", pincode: "", city: "" });    setCurrentOrderId(null);
    onOpenChange(false);
  };

  return (
<Sheet
  modal={false}
  open={open}
  onOpenChange={(v) => {
    if (!v) return;
    onOpenChange(v);
  }}
>      <SheetContent
        side="right"
        className="bg-[#FAF7F2] w-[340px] sm:w-[420px] border-l border-[#3A5A40]/10 p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>

        {/* ── CART VIEW ── */}
        {view === "cart" && (
          <div className="flex flex-col h-full" data-testid="cart-view">
            <div className="px-6 pt-6 pb-4 border-b border-[#3A5A40]/8">
              <div className="flex items-center justify-between pr-6">
                <h2 className="font-playfair text-xl text-[#1A1A1A]">Your Basket</h2>
              </div>
              {items.length > 0 && (
                <p className="font-inter text-xs text-[#4B5563] mt-1">{items.length} item{items.length !== 1 && "s"}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center" data-testid="cart-empty">
                  <ShoppingBag className="w-12 h-12 text-[#3A5A40]/15 mb-4" />
                  <p className="font-playfair text-lg text-[#1A1A1A]/60">Your basket is empty</p>
                  <p className="font-inter text-xs text-[#4B5563] mt-2">Browse our harvest and add items</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const step = getIncrementStep(item);
                    return (
                      <div key={item.id} className="flex gap-3 pb-4 border-b border-[#3A5A40]/5 last:border-0" data-testid={`cart-item-${item.id}`}>
                        <img src={item.image} alt={item.name} className="w-16 h-20 object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-playfair text-sm text-[#1A1A1A] leading-tight truncate">{item.name}</h4>
                          <p className="font-inter text-[10px] text-[#4B5563] mt-0.5">{item.unit}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-[#3A5A40]/15">
                              <button onClick={() => updateQuantity(item.id, Math.max(item.minQty, item.quantity - step))}
                                className="w-7 h-7 flex items-center justify-center hover:bg-[#3A5A40]/5" data-testid={`cart-qty-minus-${item.id}`}>
                                <Minus className="w-3 h-3 text-[#3A5A40]" />
                              </button>
                              <span className="w-12 text-center font-inter text-[11px] font-semibold text-[#1A1A1A]">{fmtQty(item)}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + step)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-[#3A5A40]/5" data-testid={`cart-qty-plus-${item.id}`}>
                                <Plus className="w-3 h-3 text-[#3A5A40]" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 transition-colors ml-auto" data-testid={`cart-remove-${item.id}`}>
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="font-inter text-sm font-semibold text-[#1A1A1A] flex-shrink-0">&#8377;{fmtPrice(getItemPrice(item))}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#3A5A40]/10 px-6 py-5 bg-white/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-inter text-[11px] uppercase tracking-[0.12em] text-[#4B5563]">Subtotal</span>
                  <span className="font-inter text-lg font-bold text-[#1A1A1A]" data-testid="cart-subtotal">&#8377;{fmtPrice(subtotal)}</span>
                </div>
                {(() => {
                  const belowMin = minOrderSettings.enabled && subtotal < minOrderSettings.value;
                  return (
                    <>
                      {belowMin && (
                        <p className="font-inter text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mb-3" data-testid="min-order-warning">
                          Minimum order value is &#8377;{minOrderSettings.value.toLocaleString("en-IN")}. Add &#8377;{(minOrderSettings.value - subtotal).toLocaleString("en-IN")} more to proceed.
                        </p>
                      )}
                      <button onClick={() => setView("checkout")} disabled={belowMin}
                        className="w-full bg-[#3A5A40] text-white py-3.5 font-inter font-semibold text-[12px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="cart-checkout-btn">
                        Proceed to Checkout
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── CHECKOUT VIEW ── */}
        {view === "checkout" && (
          <div className="flex flex-col h-full" data-testid="checkout-view">
            <div className="px-6 pt-6 pb-4 border-b border-[#3A5A40]/8">
              <div className="flex items-center gap-3">
                <button onClick={() => setView("cart")} className="p-1 hover:bg-[#3A5A40]/5 transition-colors" data-testid="checkout-back-btn">
                  <ArrowLeft className="w-4 h-4 text-[#4B5563]" />
                </button>
                <h2 className="font-playfair text-xl text-[#1A1A1A]">Delivery Details</h2>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1.5 bg-white border border-[#3A5A40]/10 px-4 py-2.5 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
                    placeholder="Your full name" data-testid="checkout-name" />
                </div>
                <div>
  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">
    Phone Number *
  </label>

  <input
    type="tel"
    required
    value={form.phone}
    disabled={phoneVerified}
    onChange={async (e) => {
      const value = e.target.value.replace(/\D/g, "");

      setForm({ ...form, phone: value });

if (value.length < 10) {
  setOtpTriggered(false);
  setPhoneVerified(false);
}

clearTimeout(otpTimer.current);

otpTimer.current = setTimeout(async () => {
  if (value.length === 10 && !otpTriggered) {
    const alreadyVerified = await checkIfPhoneAlreadyVerified(value);

    if (alreadyVerified) {
      setPhoneVerified(true);
      localStorage.setItem("verified_phone", value);
      return;
    }

    setOtpTriggered(true);
    triggerOtpVerification(value);
  }
}, 400);
    }}
    className="w-full mt-1.5 bg-white border border-[#3A5A40]/10 px-4 py-2.5 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
    placeholder="10-digit phone number"
    data-testid="checkout-phone"
  />

  {phoneVerified && (
    <div className="mt-2 flex items-center gap-3">
      <span className="text-green-600 font-semibold text-xs">
        Verified ✓
      </span>

      <button
        type="button"
        className="text-xs underline"
        onClick={() => {
          setPhoneVerified(false);
          setOtpTriggered(false);
          setForm({ ...form, phone: "" });
        }}
      >
        Change number
      </button>
    </div>
  )}
                </div>
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full mt-1.5 bg-white border border-[#3A5A40]/10 px-4 py-2.5 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
                    placeholder="your@email.com" data-testid="checkout-email" />
                </div>
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Delivery Address *</label>
                  <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full mt-1.5 bg-white border border-[#3A5A40]/10 px-4 py-2.5 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors resize-none"
                    placeholder="Full delivery address" data-testid="checkout-address" />
                </div>
                <div>
  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">
    City *
  </label>

  <select
    required
    value={form.city}
    onChange={(e) => setForm({ ...form, city: e.target.value })}
    className="w-full mt-1.5 bg-white border border-[#3A5A40]/10 px-4 py-2.5 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
  >
    <option value="">Select city</option>

    <option value="Bengaluru">Bengaluru</option>

    <optgroup label="Expanding Soon">
      <option disabled>Mumbai</option>
      <option disabled>Pune</option>
      <option disabled>Hyderabad</option>
    </optgroup>
  </select>

  <p className="font-inter text-[10px] text-[#4B5563] mt-1">
    Currently delivering only in Bengaluru for our first farm drop 🌱
  </p>
</div>
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Pincode *</label>
                  <input type="text" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full mt-1.5 bg-white border border-[#3A5A40]/10 px-4 py-2.5 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
                    placeholder="6-digit pincode" data-testid="checkout-pincode" />
                </div>
              </div>

              {/* Order summary */}
              <div className="mt-6 pt-4 border-t border-[#3A5A40]/10">
                <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#4B5563] font-medium mb-3">Order Summary</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span className="font-inter text-xs text-[#4B5563]">{fmtQty(item)} {item.name}</span>
                    <span className="font-inter text-xs font-medium text-[#1A1A1A]">&#8377;{fmtPrice(getItemPrice(item))}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 mt-2 border-t border-[#3A5A40]/10">
                  <span className="font-inter text-sm font-semibold text-[#1A1A1A]">Total</span>
                  <span className="font-inter text-sm font-bold text-[#3A5A40]">&#8377;{fmtPrice(subtotal)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full mt-6 bg-[#3A5A40] text-white py-3.5 font-inter font-semibold text-[12px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="checkout-submit-btn">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Proceed to Payment</>
                )}
              </button>
              <p className="font-inter text-[10px] text-center text-[#4B5563] mt-3">
                Secure payment via Razorpay (UPI, Cards, Netbanking)
              </p>
            </form>
          </div>
        )}

        {/* ── SUCCESS VIEW ── */}
        {view === "success" && (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center" data-testid="checkout-success">
            <div className="w-16 h-16 bg-[#3A5A40]/10 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-[#3A5A40]" />
            </div>
            <h2 className="font-playfair text-2xl text-[#1A1A1A]">Payment Successful!</h2>
            {currentOrderId && (
              <div className="mt-4 bg-[#F4F1EC] border border-[#E8E4DE] px-5 py-3" data-testid="order-id-display">
                <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#9B9B8E]">Order ID</p>
                <p className="font-inter text-lg font-semibold text-[#3A5A40] mt-0.5 tracking-wide">#{currentOrderId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}
            <p className="font-inter text-sm text-[#4B5563] mt-4 leading-relaxed max-w-xs">
              Your order has been confirmed. A confirmation email with your order ID has been sent to your inbox.
            </p>
            <button onClick={resetAndClose}
              className="mt-8 bg-[#3A5A40] text-white px-8 py-3 font-inter font-semibold text-[12px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors"
              data-testid="checkout-done-btn">
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
