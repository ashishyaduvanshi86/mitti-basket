import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Loader2, Send, Users, UserCheck } from "lucide-react";

export default function AdminBroadcast() {
  const { apiFetch } = useAdmin();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const loadCustomers = useCallback(() => {
    setLoadingCustomers(true);
    apiFetch("/customers")
  .then(setCustomers)
      .finally(() => setLoadingCustomers(false));
  }, [apiFetch]);

  useEffect(() => {
    if (mode === "selected") loadCustomers();
  }, [mode, loadCustomers]);

  const toggleSelect = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    if (mode === "selected" && selected.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const data = await apiFetch("/broadcast", {
  method: "POST",
  body: JSON.stringify({
    subject,
    body,
    recipients: mode === "selected" ? selected : [],
  }),
});
      setResult({ success: true, count: data.recipients_count });
      setSubject("");
      setBody("");
      setSelected([]);
    } catch {
      setResult({ success: false });
    }
    setSending(false);
  };

  return (
    <div data-testid="admin-broadcast">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl text-[#1A1A1A]">Broadcast Email</h2>
        <p className="font-inter text-sm text-[#9B9B8E] mt-1">
          Send email to all customers or selected recipients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E8E4DE] p-6 space-y-4">
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">
                Subject *
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line..."
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40]"
                data-testid="broadcast-subject-input"
              />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-1">
                Body * (HTML supported)
              </label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email content here... HTML tags are supported."
                className="w-full border border-[#E8E4DE] px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#3A5A40] resize-none font-mono"
                data-testid="broadcast-body-input"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim() || (mode === "selected" && selected.length === 0)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3A5A40] text-white font-inter text-[11px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors disabled:opacity-40"
              data-testid="broadcast-send-btn"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {sending ? "Sending..." : "Send Broadcast"}
            </button>
            {result && (
              <p
                className={`font-inter text-sm mt-2 ${
                  result.success ? "text-green-700" : "text-red-600"
                }`}
                data-testid="broadcast-result"
              >
                {result.success
                  ? `Broadcast sent to ${result.count} recipients!`
                  : "Failed to send. Please try again."}
              </p>
            )}
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E4DE] p-5">
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#9B9B8E] mb-3">
              Recipients
            </p>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                  mode === "all"
                    ? "border-[#3A5A40] bg-[#3A5A40]/5"
                    : "border-[#E8E4DE] hover:border-[#9B9B8E]"
                }`}
                data-testid="broadcast-mode-all"
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "all"}
                  onChange={() => setMode("all")}
                  className="accent-[#3A5A40]"
                />
                <Users className="w-4 h-4 text-[#3A5A40]" />
                <span className="font-inter text-sm">All Customers</span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                  mode === "selected"
                    ? "border-[#3A5A40] bg-[#3A5A40]/5"
                    : "border-[#E8E4DE] hover:border-[#9B9B8E]"
                }`}
                data-testid="broadcast-mode-selected"
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "selected"}
                  onChange={() => setMode("selected")}
                  className="accent-[#3A5A40]"
                />
                <UserCheck className="w-4 h-4 text-[#3A5A40]" />
                <span className="font-inter text-sm">Selected Only</span>
              </label>
            </div>
            {mode === "selected" && (
              <div className="mt-4">
                <p className="font-inter text-[11px] text-[#9B9B8E] mb-2">
                  {selected.length} selected
                </p>
                {loadingCustomers ? (
                  <Loader2 className="w-4 h-4 text-[#9B9B8E] animate-spin" />
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-1">
                    {customers.map((c) => (
                      <label
                        key={c.email}
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#F4F1EC] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(c.email)}
                          onChange={() => toggleSelect(c.email)}
                          className="accent-[#3A5A40]"
                        />
                        <div className="min-w-0">
                          <p className="font-inter text-[12px] text-[#1A1A1A] truncate">
                            {c.name}
                          </p>
                          <p className="font-inter text-[10px] text-[#9B9B8E] truncate">
                            {c.email}
                          </p>
                        </div>
                      </label>
                    ))}
                    {customers.length === 0 && (
                      <p className="font-inter text-[12px] text-[#9B9B8E] text-center py-4">
                        No customers yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
