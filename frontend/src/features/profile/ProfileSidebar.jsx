import { useState, useEffect, useRef } from "react";
import { X, LogOut, Star, TrendingUp, Award, Clock } from "lucide-react";
import { fetchUserProfile, fetchLoyaltyInfo } from "./profileService";

export default function ProfileSidebar({ isOpen, onClose, onLogout }) {
  const [user, setUser] = useState(null);
  const [loyalty, setLoyalty] = useState({ currentPoints: 0, dollarValue: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setLoading(true);
      const profile = await fetchUserProfile();
      setUser(profile);
      if (profile?.user_id) {
        const loyaltyData = await fetchLoyaltyInfo(profile.user_id);
        setLoyalty(loyaltyData);
      }
      setLoading(false);
    }
    load();
  }, [isOpen]);

  useEffect(() => {
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const ordersCount = loyalty.transactions?.filter(t => t.type === "earned").length * 5 || 0;
  const ordersToNext = 5 - (ordersCount % 5) === 5 ? 0 : 5 - (ordersCount % 5);
  const progressPercent = ordersToNext === 0 ? 100 : ((5 - ordersToNext) / 5) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 bg-black/30 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] w-[360px] shadow-2xl`}
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Top bar — matches Shop's sticky tab bar style */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <span className="text-xs font-semibold tracking-[3px] uppercase text-gray-900">
            My Account
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div
                className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin"
              />
            </div>
          ) : (
            <>
              {/* Profile Hero */}
              <div className="px-6 py-7 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <span
                      className="text-white text-xl font-semibold tracking-wide"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {initials}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-xl font-semibold text-gray-900 leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 tracking-wide">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Loyalty Rewards */}
              <div className="px-6 py-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={13} className="text-gray-900" />
                  <span className="text-[10px] font-semibold tracking-[3px] uppercase text-gray-900">
                    Loyalty Rewards
                  </span>
                </div>

                {/* Dark points card — preserved intentionally */}
                <div className="bg-gray-900 rounded-xl p-5 mb-4 relative overflow-hidden">
                  {/* Subtle decorative rings */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border border-white/5" />
                  <div className="absolute -bottom-8 left-10 w-32 h-32 rounded-full border border-white/5" />

                  <div className="relative">
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-bold text-white leading-none tabular-nums">
                        {loyalty.currentPoints ?? 0}
                      </span>
                      <span className="text-xs text-white/40 mb-1">pts</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/40">
                        Worth{" "}
                        <span className="text-white font-medium">
                          ${loyalty.dollarValue?.toFixed(2) ?? "0.00"}
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Star size={10} className="text-white/50 fill-white/50" />
                        <span className="text-[10px] text-white/50 tracking-wide">Velore Member</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress to next reward */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500">Next reward in</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {ordersToNext === 0 ? "🎉 Reward ready!" : `${ordersToNext} order${ordersToNext !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2.5">Every 5 orders = +10 pts = $1 off</p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="px-6 py-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={13} className="text-gray-900" />
                  <span className="text-[10px] font-semibold tracking-[3px] uppercase text-gray-900">
                    History
                  </span>
                </div>

                {loyalty.transactions?.length === 0 ? (
                  <div className="text-center py-10">
                    <TrendingUp size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No transactions yet</p>
                    <p className="text-xs text-gray-300 mt-1">Start shopping to earn points!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {loyalty.transactions.slice(0, 8).map((tx) => (
                      <div
                        key={tx.transaction_id}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-lg border text-sm ${
                          tx.type === "earned"
                            ? "bg-gray-50 border-gray-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {tx.type === "earned" ? "Points Earned" : "Points Redeemed"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(tx.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            tx.type === "earned" ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {tx.type === "earned" ? "+" : "−"}{Math.abs(tx.points)} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sign Out */}
        <div className="px-6 py-5 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full py-3 border border-gray-900 text-gray-900 text-xs font-semibold tracking-[2px] uppercase flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}