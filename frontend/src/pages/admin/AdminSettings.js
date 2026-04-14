import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Loader2, Save } from "lucide-react";

export default function AdminSettings() {
  const { apiFetch } = useAdmin();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
  setLoading(true);
  apiFetch("/settings")
    .then(setSettings)
    .finally(() => setLoading(false));
}, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#9B9B8E] animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="admin-settings">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-[#1A1A1A]">Settings</h2>
          <p className="font-inter text-sm text-[#9B9B8E] mt-1">Global store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3A5A40] text-white font-inter text-[11px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors disabled:opacity-50"
          data-testid="settings-save-btn"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Minimum Order */}
        <div className="bg-white border border-[#E8E4DE] p-6">
          <h3 className="font-playfair text-lg text-[#1A1A1A] mb-1">Minimum Order Value</h3>
          <p className="font-inter text-[12px] text-[#9B9B8E] mb-5">
            Block checkout when cart total is below a threshold.
          </p>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer" data-testid="min-order-toggle">
              <div
                onClick={() => set("minimum_order_enabled", !settings.minimum_order_enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  settings.minimum_order_enabled ? "bg-[#3A5A40]" : "bg-[#D4D4D4]"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.minimum_order_enabled ? "translate-x-5" : ""
                  }`}
                />
              </div>
              <span className="font-inter text-sm text-[#1A1A1A]">
                {settings.minimum_order_enabled ? "Enabled" : "Disabled"}
              </span>
            </label>
            {settings.minimum_order_enabled && (
              <div className="max-w-[240px]">
                <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">
                  Minimum Value (Rs.)
                </label>
                <input
                  type="number"
                  value={settings.minimum_order_value || 0}
                  onChange={(e) => set("minimum_order_value", Number(e.target.value))}
                  min="0"
                  className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]"
                  data-testid="min-order-value-input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Default Shipping Message */}
        <div className="bg-white border border-[#E8E4DE] p-6">
          <h3 className="font-playfair text-lg text-[#1A1A1A] mb-1">Default Shipping Message</h3>
          <p className="font-inter text-[12px] text-[#9B9B8E] mb-4">
            Shown in the "Order Shipped" email sent to customers.
          </p>
          <textarea
            rows={3}
            value={settings.default_shipping_message || ""}
            onChange={(e) => set("default_shipping_message", e.target.value)}
            className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] resize-none"
            data-testid="shipping-message-input"
          />
        </div>

        {/* Out for Delivery Message */}
        <div className="bg-white border border-[#E8E4DE] p-6">
          <h3 className="font-playfair text-lg text-[#1A1A1A] mb-1">Out for Delivery Message</h3>
          <p className="font-inter text-[12px] text-[#9B9B8E] mb-4">
            Shown in the "Out for Delivery" email sent to customers.
          </p>
          <textarea
            rows={3}
            value={settings.default_ofd_message || ""}
            onChange={(e) => set("default_ofd_message", e.target.value)}
            className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] resize-none"
            data-testid="ofd-message-input"
          />
        </div>

        {/* Broadcast Sender Name */}
        <div className="bg-white border border-[#E8E4DE] p-6">
          <h3 className="font-playfair text-lg text-[#1A1A1A] mb-1">Broadcast Sender Name</h3>
          <p className="font-inter text-[12px] text-[#9B9B8E] mb-4">
            Brand name shown in broadcast emails.
          </p>
          <input
            value={settings.broadcast_sender_name || ""}
            onChange={(e) => set("broadcast_sender_name", e.target.value)}
            className="w-full max-w-[320px] border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]"
            data-testid="broadcast-sender-input"
          />
        </div>
      </div>
    </div>
  );
}
