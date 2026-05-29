import { useState, useEffect, useCallback } from "react";
import { AdminAuthProvider, useAdminAuth } from "./auth/AdminAuthContext";
import AdminLogin from "./auth/AdminLogin";
import adminService from "./adminService";

// ─── Status styles ──────────────────────────────────────────────────────────
const statusStyle = {
  delivered:  "bg-emerald-100 text-emerald-700",
  shipped:    "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  pending:    "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-100 text-red-700",
};

// ─── Status pill styles (Velore design system) ──────────────────────────────
const statusPillStyle = {
  delivered:  { background: "linear-gradient(135deg,#22a55b,#1a8a4a)", color: "#fff" },
  shipped:    { background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff" },
  processing: { background: "linear-gradient(135deg,#76CDD6,#5bb8c2)", color: "#fff" },
  pending:    { background: "rgba(30,29,34,0.08)", color: "rgba(30,29,34,0.60)" },
  cancelled:  { background: "linear-gradient(135deg,#e05555,#c0392b)", color: "#fff" },
};

// ─── Nav items ──────────────────────────────────────────────────────────────
const navItems = [
  { icon: "⊡",  label: "Dashboard" },
  { icon: "👥", label: "Users" },
  { icon: "📦", label: "Products" },
  { icon: "🛍️", label: "Orders" },
  { icon: "📋", label: "Audit Logs" },
];

// ─── Mini sparkline chart ───────────────────────────────────────────────────
const MiniChart = ({ values }) => {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const h = 56, w = 220;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="rgba(255,255,255,0.15)" />
    </svg>
  );
};

// ─── Revenue bar chart ──────────────────────────────────────────────────────
const RevenueBar = ({ values, months }) => {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t transition-all duration-300 cursor-pointer relative"
            style={{
              height: `${(v / max) * 100}%`,
              background: "rgba(118,205,214,0.35)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#76CDD6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(118,205,214,0.35)"; }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
              style={{ background: "#1E1D22", color: "#fff" }}>
              ${v}k
            </div>
          </div>
          <span className="text-[9px] hidden sm:block" style={{ color: "rgba(30,29,34,0.40)" }}>{months[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Spinner ────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 rounded-full animate-spin"
      style={{ border: "2px solid rgba(118,205,214,0.25)", borderTopColor: "#76CDD6" }} />
  </div>
);

// ─── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ pagination, onPage }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4"
      style={{ borderTop: "1px solid rgba(118,205,214,0.22)" }}>
      <p className="text-xs" style={{ color: "rgba(30,29,34,0.45)" }}>
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <button
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
          className="px-3 py-1.5 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            borderRadius: "4px",
            border: "1.5px solid #76CDD6",
            color: "#76CDD6",
            background: "transparent",
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = "#76CDD6"; e.currentTarget.style.color = "#fff"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#76CDD6"; }}
        >← Prev</button>
        <button
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPage(pagination.page + 1)}
          className="px-3 py-1.5 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            borderRadius: "4px",
            border: "1.5px solid #76CDD6",
            color: "#76CDD6",
            background: "transparent",
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = "#76CDD6"; e.currentTarget.style.color = "#fff"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#76CDD6"; }}
        >Next →</button>
      </div>
    </div>
  );
};

// ─── Page Header ────────────────────────────────────────────────────────────
const PageHeader = ({ section, title, subtitle }) => (
  <div className="pb-8" style={{ borderBottom: "1px solid rgba(118,205,214,0.30)" }}>
    <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "#76CDD6" }}>
      {section}
    </span>
    <h1 className="text-4xl font-light mt-2" style={{ color: "#1E1D22" }}>{title}</h1>
    {subtitle && <p className="text-sm mt-1 font-light" style={{ color: "rgba(30,29,34,0.50)" }}>{subtitle}</p>}
  </div>
);

// ─── Section Card ────────────────────────────────────────────────────────────
const SectionCard = ({ children, className = "" }) => (
  <div className={`p-6 sm:p-8 ${className}`} style={{
    background: "#ffffff",
    border: "1px solid rgba(118,205,214,0.22)",
    borderRadius: "4px",
  }}>
    {children}
  </div>
);

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className="text-[10px] px-2.5 py-1 font-medium" style={{
    borderRadius: "4px",
    ...(statusPillStyle[status] || { background: "rgba(30,29,34,0.08)", color: "rgba(30,29,34,0.60)" }),
  }}>
    {status}
  </span>
);

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ════════════════════════════════════════════════════════════════════════════
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SPARKLINE = [420,380,510,470,620,580,710,680,820,760,910,880];

const STAT_GRADIENTS = [
  "linear-gradient(135deg,#76CDD6,#5bb8c2)",
  "linear-gradient(135deg,#1E1D22,#3a3945)",
  "linear-gradient(135deg,#5bb8c2,#3ea8b4)",
  "linear-gradient(135deg,#2d8fa0,#76CDD6)",
];

function DashboardView({ onNavigate }) {
  const [dash, setDash]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => setDash(res.data))
      .catch(err => setError(err.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return (
    <div className="text-sm p-4" style={{ border: "1px solid #e05555", color: "#e05555", background: "rgba(224,85,85,0.05)", borderRadius: "4px" }}>
      {error}
    </div>
  );

  const stats = [
    { label: "Total Users",    value: dash.users.total.toLocaleString(),   icon: "👥", gradient: STAT_GRADIENTS[0] },
    { label: "Total Orders",   value: dash.orders.total.toLocaleString(),  icon: "🛍️", gradient: STAT_GRADIENTS[1] },
    { label: "Total Products", value: dash.products.total.toLocaleString(),icon: "📦", gradient: STAT_GRADIENTS[2] },
    { label: "Total Revenue",  value: `$${Number(dash.revenue.total).toLocaleString()}`, icon: "💰", gradient: STAT_GRADIENTS[3] },
  ];

  return (
    <div className="space-y-6">
      <PageHeader section="Overview" title="Dashboard" subtitle="Welcome back — here's what's happening." />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden p-4 sm:p-5"
            style={{ background: stat.gradient, borderRadius: "4px" }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8"
              style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-6 -translate-x-4"
              style={{ background: "rgba(0,0,0,0.08)" }} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">{stat.icon}</span>
                {i === 1 && dash.orders.pending > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded"
                    style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
                    {dash.orders.pending} pending
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest mb-1"
                style={{ color: "rgba(255,255,255,0.70)" }}>{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              <div className="mt-2 sm:mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <MiniChart values={SPARKLINE.slice(i * 2, i * 2 + 8)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard className="xl:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1" style={{ color: "#76CDD6" }}>Annual Revenue</p>
              <p className="text-2xl sm:text-3xl font-light" style={{ color: "#1E1D22" }}>
                ${Number(dash.revenue.total).toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(30,29,34,0.50)" }}>↑ From completed payments</p>
            </div>
            <div className="flex gap-2">
              {["W","M","Y"].map((t) => (
                <button key={t}
                  className="text-xs px-2.5 py-1 transition-colors"
                  style={{
                    borderRadius: "4px",
                    background: t === "M" ? "#76CDD6" : "transparent",
                    color: t === "M" ? "#fff" : "rgba(30,29,34,0.45)",
                    border: `1px solid ${t === "M" ? "#76CDD6" : "rgba(118,205,214,0.30)"}`,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
          <RevenueBar values={SPARKLINE} months={MONTHS} />
        </SectionCard>

        <SectionCard className="space-y-4">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "#76CDD6" }}>Quick Overview</p>
          {[
            { label: "Active Users",    value: dash.users.active,   bar: Math.round((dash.users.active / (dash.users.total || 1)) * 100) },
            { label: "Pending Orders",  value: dash.orders.pending, bar: Math.round((dash.orders.pending / (dash.orders.total || 1)) * 100) },
            { label: "Active Products", value: dash.products.total, bar: 80 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "rgba(30,29,34,0.55)" }}>{item.label}</span>
                <span className="text-xs font-semibold" style={{ color: "#1E1D22" }}>{item.value}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(118,205,214,0.15)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(item.bar, 100)}%`, background: "#76CDD6" }} />
              </div>
            </div>
          ))}
          <div className="pt-2 grid grid-cols-2 gap-3" style={{ borderTop: "1px solid rgba(118,205,214,0.22)" }}>
            <div className="p-3 text-center" style={{ background: "#EFF8FE", borderRadius: "4px" }}>
              <p className="text-lg font-light" style={{ color: "#1E1D22" }}>{dash.users.active}</p>
              <p className="text-[11px]" style={{ color: "rgba(30,29,34,0.50)" }}>Active Users</p>
            </div>
            <div className="p-3 text-center" style={{ background: "#EFF8FE", borderRadius: "4px" }}>
              <p className="text-lg font-light" style={{ color: "#1E1D22" }}>{dash.orders.pending}</p>
              <p className="text-[11px]" style={{ color: "rgba(30,29,34,0.50)" }}>Pending Orders</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent Orders */}
      <SectionCard>
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold" style={{ color: "#1E1D22" }}>Recent Orders</p>
          <button onClick={() => onNavigate("Orders")}
            className="text-xs transition-colors"
            style={{ color: "#76CDD6" }}
            onMouseEnter={e => e.currentTarget.style.color = "#5bb8c2"}
            onMouseLeave={e => e.currentTarget.style.color = "#76CDD6"}
          >View all →</button>
        </div>
        <div className="space-y-1">
          {dash.recent_orders.map((o, i) => (
            <div key={i} className="flex items-center gap-3 p-3 transition-colors cursor-pointer group"
              style={{ borderRadius: "4px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EFF8FE"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "rgba(118,205,214,0.18)", color: "#76CDD6" }}>
                {(o.user || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#1E1D22" }}>{o.user}</p>
                <p className="text-[11px]" style={{ color: "rgba(30,29,34,0.45)" }}>
                  #{o.order_id} · {new Date(o.date).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={o.status} />
              <p className="text-sm font-semibold flex-shrink-0" style={{ color: "#1E1D22" }}>
                ${Number(o.amount || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// USERS VIEW
// ════════════════════════════════════════════════════════════════════════════
function UsersView() {
  const [data, setData]         = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page: p, limit: 15, search: s });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1, ""); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      const res = await adminService.toggleUserStatus(id);
      setData(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActionId(id);
    try {
      await adminService.deleteUser(id);
      setData(prev => prev.filter(u => u.id !== id));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-6">
      <PageHeader section="Management" title="Users" subtitle="Manage customer accounts and access." />
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm font-semibold" style={{ color: "#1E1D22" }}>
            Users {pagination && <span className="font-light" style={{ color: "rgba(30,29,34,0.45)" }}>({pagination.total})</span>}
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="px-3 py-2 text-xs w-52 outline-none transition-colors"
              style={{
                border: "1px solid rgba(118,205,214,0.30)",
                borderRadius: "4px",
                background: "#ffffff",
                color: "#1E1D22",
              }}
              onFocus={e => e.target.style.borderColor = "#76CDD6"}
              onBlur={e => e.target.style.borderColor = "rgba(118,205,214,0.30)"}
            />
            <button type="submit"
              className="px-3 py-2 text-xs text-white transition-colors"
              style={{ background: "#76CDD6", border: "1px solid #76CDD6", borderRadius: "4px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#5bb8c2"}
              onMouseLeave={e => e.currentTarget.style.background = "#76CDD6"}
            >Search</button>
          </form>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(118,205,214,0.22)" }}>
                    {["Name","Email","Role","Orders","Points","Status","Actions"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 font-semibold text-[10px] uppercase tracking-wider"
                        style={{ color: "rgba(30,29,34,0.40)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(u => (
                    <tr key={u.id} className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(118,205,214,0.10)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EFF8FE"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{ background: "rgba(118,205,214,0.18)", color: "#76CDD6" }}>
                            {(u.name || u.email)[0].toUpperCase()}
                          </div>
                          <span className="font-medium truncate max-w-[100px]" style={{ color: "#1E1D22" }}>{u.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 truncate max-w-[140px]" style={{ color: "rgba(30,29,34,0.55)" }}>{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 text-[10px]"
                          style={{ background: "rgba(118,205,214,0.12)", color: "#1E1D22", border: "1px solid rgba(118,205,214,0.25)", borderRadius: "4px" }}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{u.orders_count}</td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{u.loyalty_points}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            borderRadius: "4px",
                            background: u.is_active
                              ? "linear-gradient(135deg,#22a55b,#1a8a4a)"
                              : "linear-gradient(135deg,#e05555,#c0392b)",
                            color: "#fff",
                          }}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionId === u.id}
                            onClick={() => handleToggle(u.id)}
                            className="px-2 py-1 text-[10px] transition-colors disabled:opacity-40"
                            style={{ borderRadius: "4px", border: "1px solid rgba(118,205,214,0.30)", color: "#76CDD6", background: "transparent" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#76CDD6"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#76CDD6"; }}
                          >
                            {u.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            disabled={actionId === u.id}
                            onClick={() => handleDelete(u.id)}
                            className="px-2 py-1 text-[10px] transition-colors disabled:opacity-40"
                            style={{ borderRadius: "4px", border: "1px solid rgba(224,85,85,0.35)", color: "#e05555", background: "rgba(224,85,85,0.05)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#e05555"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,85,85,0.05)"; e.currentTarget.style.color = "#e05555"; }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={(p) => { setPage(p); load(p, search); }} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRODUCTS VIEW
// ════════════════════════════════════════════════════════════════════════════
function ProductsView() {
  const [data, setData]         = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({ page: p, limit: 15, search: s });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(1, ""); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(1, search); };

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      const res = await adminService.toggleProductStatus(id);
      setData(prev => prev.map(p => p.id === id ? { ...p, is_active: res.data.is_active } : p));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setActionId(id);
    try {
      await adminService.deleteProduct(id);
      setData(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-6">
      <PageHeader section="Catalog" title="Products" subtitle="Manage your product inventory and listings." />
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm font-semibold" style={{ color: "#1E1D22" }}>
            Products {pagination && <span className="font-light" style={{ color: "rgba(30,29,34,0.45)" }}>({pagination.total})</span>}
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="px-3 py-2 text-xs w-52 outline-none"
              style={{
                border: "1px solid rgba(118,205,214,0.30)",
                borderRadius: "4px",
                background: "#ffffff",
                color: "#1E1D22",
              }}
              onFocus={e => e.target.style.borderColor = "#76CDD6"}
              onBlur={e => e.target.style.borderColor = "rgba(118,205,214,0.30)"}
            />
            <button type="submit"
              className="px-3 py-2 text-xs text-white transition-colors"
              style={{ background: "#76CDD6", border: "1px solid #76CDD6", borderRadius: "4px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#5bb8c2"}
              onMouseLeave={e => e.currentTarget.style.background = "#76CDD6"}
            >Search</button>
          </form>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(118,205,214,0.22)" }}>
                    {["Name","Brand","Category","Price","Variants","Status","Actions"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 font-semibold text-[10px] uppercase tracking-wider"
                        style={{ color: "rgba(30,29,34,0.40)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(p => (
                    <tr key={p.id} className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(118,205,214,0.10)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EFF8FE"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="py-3 pr-4 font-medium truncate max-w-[140px]" style={{ color: "#1E1D22" }}>{p.name}</td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{p.brand || "—"}</td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{p.category || "—"}</td>
                      <td className="py-3 pr-4 font-medium" style={{ color: "#1E1D22" }}>${Number(p.price).toFixed(2)}</td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{p.variants_count}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            borderRadius: "4px",
                            background: p.is_active
                              ? "linear-gradient(135deg,#22a55b,#1a8a4a)"
                              : "linear-gradient(135deg,#e05555,#c0392b)",
                            color: "#fff",
                          }}>
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionId === p.id}
                            onClick={() => handleToggle(p.id)}
                            className="px-2 py-1 text-[10px] transition-colors disabled:opacity-40"
                            style={{ borderRadius: "4px", border: "1px solid rgba(118,205,214,0.30)", color: "#76CDD6", background: "transparent" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#76CDD6"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#76CDD6"; }}
                          >
                            {p.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            disabled={actionId === p.id}
                            onClick={() => handleDelete(p.id)}
                            className="px-2 py-1 text-[10px] transition-colors disabled:opacity-40"
                            style={{ borderRadius: "4px", border: "1px solid rgba(224,85,85,0.35)", color: "#e05555", background: "rgba(224,85,85,0.05)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#e05555"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,85,85,0.05)"; e.currentTarget.style.color = "#e05555"; }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={(p) => load(p, search)} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORDERS VIEW
// ════════════════════════════════════════════════════════════════════════════
const ORDER_STATUSES = ["pending","processing","shipped","delivered","cancelled"];

function OrdersView() {
  const [data, setData]           = useState([]);
  const [pagination, setPag]      = useState(null);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setFilter] = useState("");
  const [updatingId, setUpdating] = useState(null);

  const load = useCallback(async (p = 1, s = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({ page: p, limit: 15, status: s || undefined });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1, ""); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      const res = await adminService.updateOrderStatus(id, newStatus);
      setData(prev => prev.map(o => o.id === id ? { ...o, status: res.data.status } : o));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6">
      <PageHeader section="Operations" title="Orders" subtitle="Track and manage customer orders." />
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm font-semibold" style={{ color: "#1E1D22" }}>
            Orders {pagination && <span className="font-light" style={{ color: "rgba(30,29,34,0.45)" }}>({pagination.total})</span>}
          </p>
          <select
            value={statusFilter}
            onChange={e => { setFilter(e.target.value); load(1, e.target.value); }}
            className="px-3 py-2 text-xs outline-none"
            style={{
              border: "1px solid rgba(118,205,214,0.30)",
              borderRadius: "4px",
              background: "#ffffff",
              color: "#1E1D22",
            }}
            onFocus={e => e.target.style.borderColor = "#76CDD6"}
            onBlur={e => e.target.style.borderColor = "rgba(118,205,214,0.30)"}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(118,205,214,0.22)" }}>
                    {["Order ID","Customer","Items","Amount","Payment","Date","Status"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 font-semibold text-[10px] uppercase tracking-wider"
                        style={{ color: "rgba(30,29,34,0.40)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(o => (
                    <tr key={o.id} className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(118,205,214,0.10)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EFF8FE"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="py-3 pr-4 font-mono" style={{ color: "#76CDD6" }}>#{o.id}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium" style={{ color: "#1E1D22" }}>{o.user?.name || "—"}</p>
                        <p className="text-[10px]" style={{ color: "rgba(30,29,34,0.45)" }}>{o.user?.email}</p>
                      </td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{o.items_count}</td>
                      <td className="py-3 pr-4 font-medium" style={{ color: "#1E1D22" }}>${Number(o.payment?.amount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{o.payment?.payment_meth || "—"}</td>
                      <td className="py-3 pr-4" style={{ color: "rgba(30,29,34,0.55)" }}>{new Date(o.date).toLocaleDateString()}</td>
                      <td className="py-3">
                        <select
                          disabled={updatingId === o.id}
                          value={o.status}
                          onChange={e => handleStatusUpdate(o.id, e.target.value)}
                          className="text-[10px] px-2 py-1 cursor-pointer outline-none disabled:opacity-40"
                          style={{
                            borderRadius: "4px",
                            border: "1px solid rgba(118,205,214,0.30)",
                            background: "#EFF8FE",
                            color: "#1E1D22",
                          }}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={(p) => load(p, statusFilter)} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS VIEW
// ════════════════════════════════════════════════════════════════════════════
function AuditLogsView() {
  const [data, setData]       = useState([]);
  const [pagination, setPag]  = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ page: p, limit: 50 });
      setData(res.data);
      setPag(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader section="Security" title="Audit Logs" subtitle="A full record of admin activity." />
      <SectionCard>
        <p className="text-sm font-semibold mb-6" style={{ color: "#1E1D22" }}>
          Logs {pagination && <span className="font-light" style={{ color: "rgba(30,29,34,0.45)" }}>({pagination.total})</span>}
        </p>

        {loading ? <Spinner /> : (
          <>
            <div className="space-y-1">
              {data.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 transition-colors"
                  style={{ borderRadius: "4px" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#EFF8FE"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div className="w-7 h-7 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(118,205,214,0.12)", borderRadius: "4px", border: "1px solid rgba(118,205,214,0.25)", color: "#76CDD6" }}>
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: "#1E1D22" }}>{log.action}</span>
                      <span className="text-[10px]" style={{ color: "#76CDD6" }}>{log.admin || "System"}</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(30,29,34,0.50)" }}>{log.details}</p>
                  </div>
                  <p className="text-[10px] flex-shrink-0" style={{ color: "rgba(30,29,34,0.35)" }}>{new Date(log.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <Pagination pagination={pagination} onPage={load} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SHELL (sidebar + header + view switcher)
// ════════════════════════════════════════════════════════════════════════════
function AdminShell() {
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav]     = useState("Dashboard");

  const navigate = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
  };

  const initials = admin?.name
    ? admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : (admin?.email?.[0] || "A").toUpperCase();

  const renderView = () => {
    switch (activeNav) {
      case "Dashboard":  return <DashboardView onNavigate={navigate} />;
      case "Users":      return <UsersView />;
      case "Products":   return <ProductsView />;
      case "Orders":     return <OrdersView />;
      case "Audit Logs": return <AuditLogsView />;
      default:           return <DashboardView onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#EFF8FE", color: "#1E1D22", fontFamily: "system-ui, sans-serif" }}>

      {/* Injected sidebar nav styles */}
      <style>{`
        .crm-nav-item {
          color: rgba(30,29,34,0.50);
          transition: background 0.16s ease, color 0.16s ease, transform 0.15s ease;
          position: relative;
        }
        .crm-nav-item:hover {
          background: #EFF8FE;
          color: #1E1D22;
          transform: translateX(2px);
        }
        .crm-nav-item-active {
          background: #EFF8FE;
          color: #1E1D22;
        }
        .crm-nav-item-active::before {
          content: '';
          position: absolute; left: 0; top: 20%; height: 60%; width: 3px;
          background: #76CDD6;
          border-radius: 0 3px 3px 0;
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{ background: "rgba(30,29,34,0.40)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
        style={{ background: "#ffffff", borderRight: "1px solid rgba(118,205,214,0.22)" }}>

        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(118,205,214,0.22)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "#76CDD6", borderRadius: "4px" }}>V</div>
            <div>
              <p className="font-semibold text-sm tracking-wide" style={{ color: "#1E1D22" }}>Velore</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(30,29,34,0.40)" }}>Eyewear Admin</p>
            </div>
          </div>
        </div>

        {/* Admin user */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(118,205,214,0.22)" }}>
          <div className="flex items-center gap-3 p-2 cursor-pointer transition-colors"
            style={{ borderRadius: "4px" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EFF8FE"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "#76CDD6" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#1E1D22" }}>{admin?.name || admin?.email}</p>
              <p className="text-[11px] capitalize" style={{ color: "rgba(30,29,34,0.45)" }}>{admin?.role || "Admin"}</p>
            </div>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#22a55b" }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold px-3 pb-2" style={{ color: "rgba(30,29,34,0.35)" }}>
            Main Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left crm-nav-item ${activeNav === item.label ? "crm-nav-item-active" : ""}`}
              style={{ borderRadius: "4px", border: "none", background: "transparent", cursor: "pointer" }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {activeNav === item.label && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#76CDD6" }} />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(118,205,214,0.22)" }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200"
            style={{ borderRadius: "4px", border: "none", background: "transparent", color: "rgba(30,29,34,0.50)", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,85,85,0.06)"; e.currentTarget.style.color = "#e05555"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(30,29,34,0.50)"; }}
          >
            <span className="text-base w-5 text-center">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-10 px-4 sm:px-6 py-4 flex items-center justify-between gap-4"
          style={{
            background: "rgba(239,248,254,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(118,205,214,0.22)",
          }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center transition-colors"
              style={{ borderRadius: "4px", border: "1px solid rgba(118,205,214,0.25)", color: "rgba(30,29,34,0.50)", background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >☰</button>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: "#1E1D22" }}>{activeNav}</h1>
              <p className="text-[11px]" style={{ color: "rgba(30,29,34,0.45)" }}>Velore Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(118,205,214,0.25)",
                borderRadius: "4px",
                color: "rgba(30,29,34,0.55)",
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22a55b" }} />
              {admin?.email}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {renderView()}
          <div className="pb-2 text-center text-xs" style={{ color: "rgba(30,29,34,0.30)" }}>
            Velore Admin Panel · 2026 · Built with ♥
          </div>
        </div>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT — wraps everything in auth context, shows login or shell
// ════════════════════════════════════════════════════════════════════════════
export default function VeloreAdmin() {
  return (
    <AdminAuthProvider>
      <AuthGate />
    </AdminAuthProvider>
  );
}

function AuthGate() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#EFF8FE" }}>
        <div className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "2px solid rgba(118,205,214,0.25)", borderTopColor: "#76CDD6" }} />
      </div>
    );
  }

  return isAuthenticated ? <AdminShell /> : <AdminLogin />;
}