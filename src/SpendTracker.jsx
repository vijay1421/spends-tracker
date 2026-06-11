import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#0A0A0F",
  surface: "#13131A",
  raised: "#1C1C27",
  border: "#2A2A3A",
  accent: "#7C6EF8",
  accentDim: "#7C6EF820",
  mint: "#22D3A5",
  warning: "#F59E0B",
  danger: "#EF4444",
  text: "#F0F0FF",
  muted: "#6B6B8A",
  white: "#FFFFFF",
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const INITIAL_CATEGORIES = [
  { id: "c1", name: "Food", color: "#F59E0B", icon: "🍜", budget: 8000 },
  { id: "c2", name: "Travel", color: "#7C6EF8", icon: "🚗", budget: 5000 },
  { id: "c3", name: "Shopping", color: "#22D3A5", icon: "🛍️", budget: 6000 },
  { id: "c4", name: "Bills", color: "#EF4444", icon: "⚡", budget: 4000 },
  { id: "c5", name: "Health", color: "#10B981", icon: "💊", budget: 3000 },
  { id: "c6", name: "Entertainment", color: "#EC4899", icon: "🎬", budget: 2000 },
  { id: "c7", name: "Groceries", color: "#F97316", icon: "🛒", budget: 5000 },
];

const INITIAL_CARDS = [
  { id: "card1", name: "HDFC Regalia", last4: "4521", limit: 200000, billingDate: 15, color: "#7C6EF8" },
  { id: "card2", name: "Axis Ace", last4: "8834", limit: 150000, billingDate: 10, color: "#22D3A5" },
  { id: "card3", name: "ICICI Coral", last4: "2291", limit: 100000, billingDate: 5, color: "#F59E0B" },
];

function generateMockTransactions() {
  const txns = [];
  const merchants = {
    c1: ["Swiggy", "Zomato", "McDonald's", "Starbucks", "Domino's"],
    c2: ["Uber", "Ola", "Rapido", "IndiGo", "IRCTC"],
    c3: ["Amazon", "Flipkart", "Myntra", "IKEA", "Nykaa"],
    c4: ["Jio Fiber", "Electricity Board", "BWSSB Water", "Airtel"],
    c5: ["Apollo Pharmacy", "Practo", "NetMeds", "Dr. Lal Path"],
    c6: ["Netflix", "Spotify", "BookMyShow", "Steam"],
    c7: ["BigBasket", "Blinkit", "DMart", "Reliance Fresh"],
  };
  const cards = ["card1", "card2", "card3", "salary"];
  let id = 1;

  for (let month = 0; month < 4; month++) {
    const d = new Date();
    d.setMonth(d.getMonth() - month);
    const year = d.getFullYear();
    const mon = d.getMonth();
    const daysInMonth = new Date(year, mon + 1, 0).getDate();

    for (let i = 0; i < 25; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const catId = INITIAL_CATEGORIES[Math.floor(Math.random() * INITIAL_CATEGORIES.length)].id;
      const merchantList = merchants[catId] || ["General"];
      const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
      const cardId = cards[Math.floor(Math.random() * cards.length)];
      const amount = Math.floor(Math.random() * 3000) + 100;
      txns.push({
        id: `t${id++}`,
        date: `${year}-${String(mon + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        amount,
        categoryId: catId,
        cardId,
        note: merchant,
        source: cardId === "salary" ? "salary" : "card",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return txns;
}

const INITIAL_SALARY = {
  "2026-06": 120000,
  "2026-05": 120000,
  "2026-04": 115000,
  "2026-03": 115000,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtK = (n) => n >= 1000 ? "₹" + (n / 1000).toFixed(1) + "k" : "₹" + n;

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  return new Date(+y, +m - 1, 1).toLocaleString("en-IN", { month: "short", year: "numeric" });
}

function getLast6Months() {
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(getMonthKey(d));
  }
  return months;
}

function getDaysInMonth(monthKey) {
  const [y, m] = monthKey.split("-");
  return new Date(+y, +m, 0).getDate();
}

function isWeekend(date) {
  const d = new Date(date);
  return d.getDay() === 0 || d.getDay() === 6;
}

function getLastWorkingDay(year, month) {
  let day = new Date(year, month + 1, 0);
  while (isWeekend(day)) day.setDate(day.getDate() - 1);
  return day.getDate();
}

function getSecondLastWorkingDay(year, month) {
  let count = 0;
  let day = new Date(year, month + 1, 0);
  while (true) {
    if (!isWeekend(day)) { count++; if (count === 2) return day.getDate(); }
    day.setDate(day.getDate() - 1);
  }
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: ${T.bg}; color: ${T.text}; font-family: 'Inter', sans-serif; }
  body { overflow: hidden; }
  ::-webkit-scrollbar { width: 0; height: 0; }
  * { -webkit-tap-highlight-color: transparent; }
  input, textarea, select { font-family: inherit; }
  .tabular { font-variant-numeric: tabular-nums; }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .slide-up { animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
  .fade-in { animation: fadeIn 0.2s ease; }
  .scroll-x { overflow-x: auto; overflow-y: hidden; display: flex; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .snap-start { scroll-snap-align: start; flex-shrink: 0; }
  .card-border { border: 1px solid ${T.border}; border-top: 1px solid #3A3A5A; }
`;

// ─── CARD COMPONENT ───────────────────────────────────────────────────────────
function Card({ children, style, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`card-border ${className}`}
      style={{
        background: T.surface,
        borderRadius: 16,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── MONTH SCROLL WRAPPER ─────────────────────────────────────────────────────
function MonthScroller({ months, renderMonth, currentMonth, onMonthChange }) {
  const scrollRef = useRef(null);
  const monthWidth = 340;

  useEffect(() => {
    if (scrollRef.current) {
      const idx = months.indexOf(currentMonth);
      const targetIdx = idx === -1 ? 0 : idx;
      scrollRef.current.scrollLeft = targetIdx * monthWidth;
    }
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const idx = Math.round(scrollRef.current.scrollLeft / monthWidth);
      if (months[idx] && months[idx] !== currentMonth) onMonthChange && onMonthChange(months[idx]);
    }
  };

  return (
    <div ref={scrollRef} className="scroll-x" onScroll={handleScroll} style={{ gap: 12, paddingBottom: 4 }}>
      {months.map((m) => (
        <div key={m} className="snap-start" style={{ width: monthWidth, minWidth: monthWidth }}>
          {renderMonth(m)}
        </div>
      ))}
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ data, total, size = 160, label }) {
  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const seg = { ...d, pct, offset, dash: pct * circumference, gap: (1 - pct) * circumference };
    offset += pct * circumference;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={12} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={12}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{fmtK(total)}</div>
          <div style={{ fontSize: 10, color: T.muted }}>{label || "total"}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
            <div className="tabular" style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{Math.round(s.pct * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
function DailyBarChart({ transactions, monthKey, categories }) {
  const days = getDaysInMonth(monthKey);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const dailyData = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
    const dayTxns = transactions.filter((t) => t.date === dateStr);
    const total = dayTxns.reduce((s, t) => s + t.amount, 0);
    const topCat = dayTxns.length > 0
      ? dayTxns.reduce((acc, t) => { acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount; return acc; }, {})
      : {};
    const domCat = Object.entries(topCat).sort((a, b) => b[1] - a[1])[0]?.[0];
    const color = categories.find((c) => c.id === domCat)?.color || T.accent;
    return { day, total, color, isToday: dateStr === todayStr };
  });

  const maxVal = Math.max(...dailyData.map((d) => d.total), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, padding: "0 4px" }}>
      {dailyData.map((d) => {
        const h = Math.max((d.total / maxVal) * 80, d.total > 0 ? 8 : 2);
        return (
          <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
            <div
              style={{
                width: "100%", height: h,
                background: d.total > 0 ? d.color : T.border,
                borderRadius: "4px 4px 0 0",
                opacity: d.isToday ? 1 : 0.75,
                boxShadow: d.isToday ? `0 0 8px ${d.color}88` : "none",
                transition: "height 0.3s ease",
                minHeight: 2,
              }}
            />
            <div style={{ fontSize: 8, color: d.isToday ? T.text : T.muted, fontWeight: d.isToday ? 700 : 400 }}>
              {d.day}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = pct > 90 ? T.danger : pct > 70 ? T.warning : color || T.mint;
  return (
    <div style={{ background: T.border, borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ─── ADD TRANSACTION SHEET ────────────────────────────────────────────────────
function AddTransactionSheet({ onClose, categories, cards, onSave, editTxn }) {
  const today = new Date().toISOString().split("T")[0];
  const [amount, setAmount] = useState(editTxn?.amount?.toString() || "");
  const [date, setDate] = useState(editTxn?.date || today);
  const [categoryId, setCategoryId] = useState(editTxn?.categoryId || "");
  const [cardId, setCardId] = useState(editTxn?.cardId || "salary");
  const [note, setNote] = useState(editTxn?.note || "");

  const sources = [{ id: "salary", name: "Salary", color: T.mint, icon: "💰" }, ...cards.map((c) => ({ ...c, icon: "💳" }))];

  const handleSave = () => {
    if (!amount || !categoryId) return;
    onSave({
      id: editTxn?.id || `t${Date.now()}`,
      amount: parseFloat(amount),
      date,
      categoryId,
      cardId,
      note,
      source: cardId === "salary" ? "salary" : "card",
      createdAt: editTxn?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "#00000088" }} className="fade-in" />
      <div className="slide-up" style={{ position: "relative", background: T.surface, borderRadius: "24px 24px 0 0", padding: 24, paddingBottom: 40, border: `1px solid ${T.border}`, borderBottom: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editTxn ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={onClose} style={{ background: T.raised, border: "none", color: T.muted, borderRadius: 99, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>AMOUNT</div>
          <div style={{ display: "flex", alignItems: "center", background: T.raised, borderRadius: 12, padding: "12px 16px", border: `1px solid ${T.border}` }}>
            <span style={{ color: T.muted, marginRight: 8, fontSize: 20 }}>₹</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              type="number"
              style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 24, fontWeight: 700, flex: 1, width: "100%" }}
            />
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>DATE</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%", background: T.raised, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none",
              colorScheme: "dark",
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 12px", borderRadius: 10, border: `1px solid ${categoryId === c.id ? c.color : T.border}`,
                  background: categoryId === c.id ? `${c.color}22` : T.raised,
                  color: categoryId === c.id ? c.color : T.muted,
                  cursor: "pointer", fontSize: 13, fontWeight: 500,
                }}
              >
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Source */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>PAID VIA</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setCardId(s.id)}
                style={{
                  flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "10px 14px", borderRadius: 12, border: `1px solid ${cardId === s.id ? (s.color || T.accent) : T.border}`,
                  background: cardId === s.id ? `${s.color || T.accent}22` : T.raised,
                  color: cardId === s.id ? (s.color || T.accent) : T.muted,
                  cursor: "pointer", fontSize: 11, fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ whiteSpace: "nowrap" }}>{s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>NOTE (optional)</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Merchant or description"
            style={{
              width: "100%", background: T.raised, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none",
            }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!amount || !categoryId}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: amount && categoryId ? T.accent : T.border,
            color: T.white, fontSize: 16, fontWeight: 700, cursor: amount && categoryId ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          {editTxn ? "Save Changes" : "Save Transaction"}
        </button>

        {editTxn && (
          <button
            onClick={() => { onSave(null, true); onClose(); }}
            style={{ width: "100%", marginTop: 12, padding: "14px", borderRadius: 14, border: `1px solid ${T.danger}22`, background: `${T.danger}11`, color: T.danger, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Delete Transaction
          </button>
        )}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ transactions, categories, salary }) {
  const months = getLast6Months().reverse();
  const currentMonth = getMonthKey(new Date());
  const [barMonth, setBarMonth] = useState(currentMonth);
  const [donutMonth, setDonutMonth] = useState(currentMonth);

  const getMonthTxns = (mk) => transactions.filter((t) => t.date.startsWith(mk));

  const currentTxns = getMonthTxns(currentMonth);
  const totalSpent = currentTxns.reduce((s, t) => s + t.amount, 0);
  const salaryAmt = salary[currentMonth] || 0;
  const savingsRate = salaryAmt > 0 ? Math.round(((salaryAmt - totalSpent) / salaryAmt) * 100) : 0;

  // Budget burn
  const totalBudget = categories.reduce((s, c) => s + (c.budget || 0), 0);
  const budgetBurn = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const getDonutData = (mk) => {
    const txns = getMonthTxns(mk);
    return categories.map((c) => ({
      name: c.name, color: c.color,
      value: txns.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
    })).filter((d) => d.value > 0);
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 16px 100px" }}>
      {/* Summary Strip */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Overview</h1>
        <div style={{ fontSize: 13, color: T.muted }}>{getMonthLabel(currentMonth)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Spent", value: fmtK(totalSpent), color: T.danger },
          { label: "Savings", value: `${savingsRate}%`, color: T.mint },
          { label: "Budget", value: `${budgetBurn}%`, color: budgetBurn > 90 ? T.danger : budgetBurn > 70 ? T.warning : T.accent },
        ].map((s) => (
          <Card key={s.label} style={{ padding: 14 }}>
            <div className="tabular" style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Bar Chart Section */}
      <Card style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Daily Spends</div>
            <div style={{ fontSize: 11, color: T.muted }}>{getMonthLabel(barMonth)}</div>
          </div>
          <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>
            {fmt(getMonthTxns(barMonth).reduce((s, t) => s + t.amount, 0))}
          </div>
        </div>
        <MonthScroller
          months={months}
          currentMonth={barMonth}
          onMonthChange={setBarMonth}
          renderMonth={(mk) => (
            <DailyBarChart transactions={getMonthTxns(mk)} monthKey={mk} categories={categories} />
          )}
        />
      </Card>

      {/* Donut Section */}
      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>By Category</div>
            <div style={{ fontSize: 11, color: T.muted }}>{getMonthLabel(donutMonth)}</div>
          </div>
        </div>
        <MonthScroller
          months={months}
          currentMonth={donutMonth}
          onMonthChange={setDonutMonth}
          renderMonth={(mk) => {
            const data = getDonutData(mk);
            const total = data.reduce((s, d) => s + d.value, 0);
            return data.length > 0
              ? <DonutChart data={data} total={total} label="spent" />
              : <div style={{ textAlign: "center", color: T.muted, padding: 32, fontSize: 13 }}>No spends in {getMonthLabel(mk)}</div>;
          }}
        />
      </Card>
    </div>
  );
}

// ─── SALARY PAGE ──────────────────────────────────────────────────────────────
function SalaryPage({ transactions, categories, salary, setSalary }) {
  const months = getLast6Months().reverse();
  const currentMonth = getMonthKey(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingMonth, setEditingMonth] = useState(null);
  const [salaryInput, setSalaryInput] = useState("");

  const getSalaryPeriod = (monthKey) => {
    const [y, m] = monthKey.split("-").map(Number);
    const prevLastWD = getLastWorkingDay(y, m - 2);
    const start = new Date(y, m - 2, prevLastWD);
    const secondLastWD = getSecondLastWorkingDay(y, m - 1);
    const end = new Date(y, m - 1, secondLastWD);
    return { start, end };
  };

  const getMonthTxns = (mk) => {
    const { start, end } = getSalaryPeriod(mk);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return t.source === "salary" && d >= start && d <= end;
    });
  };

  const getDonutData = (mk) => {
    const txns = getMonthTxns(mk);
    const spent = txns.reduce((s, t) => s + t.amount, 0);
    const sal = salary[mk] || 0;
    const savings = Math.max(0, sal - spent);
    const catData = categories.map((c) => ({
      name: c.name, color: c.color,
      value: txns.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
    })).filter((d) => d.value > 0);
    if (savings > 0) catData.push({ name: "Savings", color: T.mint, value: savings });
    return catData;
  };

  const renderCalendar = (mk) => {
    const [y, m] = mk.split("-").map(Number);
    const { start, end } = getSalaryPeriod(mk);
    const days = [];
    let d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    const firstDow = start.getDay();
    const txnsByDate = {};
    transactions.filter((t) => t.source === "salary").forEach((t) => {
      if (!txnsByDate[t.date]) txnsByDate[t.date] = [];
      txnsByDate[t.date].push(t);
    });

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10, color: T.muted, padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const ds = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const hasTxn = txnsByDate[ds]?.length > 0;
            const domCat = hasTxn
              ? Object.entries(txnsByDate[ds].reduce((acc, t) => { acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
              : null;
            const dotColor = categories.find((c) => c.id === domCat)?.color;
            const isToday = ds === new Date().toISOString().split("T")[0];
            return (
              <div
                key={ds}
                onClick={() => hasTxn && setSelectedDate({ date: ds, txns: txnsByDate[ds] })}
                style={{
                  aspect: "1/1", borderRadius: 8, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 2,
                  background: isToday ? T.accentDim : hasTxn ? `${dotColor}15` : "transparent",
                  border: isToday ? `1px solid ${T.accent}44` : "1px solid transparent",
                  cursor: hasTxn ? "pointer" : "default",
                }}
              >
                <div style={{ fontSize: 11, color: isToday ? T.accent : T.text, fontWeight: isToday ? 700 : 400 }}>
                  {day.getDate()}
                </div>
                {hasTxn && <div style={{ width: 4, height: 4, borderRadius: 99, background: dotColor }} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 16px 100px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Salary</h1>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Salary period tracking</div>

      <MonthScroller
        months={months}
        currentMonth={currentMonth}
        renderMonth={(mk) => {
          const txns = getMonthTxns(mk);
          const spent = txns.reduce((s, t) => s + t.amount, 0);
          const sal = salary[mk] || 0;
          const { start, end } = getSalaryPeriod(mk);
          const periodLabel = `${start.getDate()} ${start.toLocaleString("en-IN", { month: "short" })} – ${end.getDate()} ${end.toLocaleString("en-IN", { month: "short" })}`;

          return (
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{getMonthLabel(mk)}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{periodLabel}</div>
                </div>
                {editingMonth === mk ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                      placeholder="Enter salary"
                      type="number"
                      style={{ width: 120, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.text, fontSize: 13, outline: "none" }}
                    />
                    <button onClick={() => { setSalary((p) => ({ ...p, [mk]: parseFloat(salaryInput) || 0 })); setEditingMonth(null); }}
                      style={{ background: T.accent, border: "none", color: T.white, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>Save</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "right" }}>
                    <div className="tabular" style={{ fontSize: 18, fontWeight: 800, color: T.mint }}>{fmt(sal)}</div>
                    <button onClick={() => { setEditingMonth(mk); setSalaryInput(sal.toString()); }}
                      style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 11, padding: 0 }}>Edit</button>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ background: T.raised, borderRadius: 10, padding: 12 }}>
                  <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: T.danger }}>{fmt(spent)}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Spent</div>
                </div>
                <div style={{ background: T.raised, borderRadius: 10, padding: 12 }}>
                  <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: T.mint }}>{fmt(Math.max(0, sal - spent))}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Remaining</div>
                </div>
              </div>

              {sal > 0 && <ProgressBar value={spent} max={sal} color={T.accent} />}
              <div style={{ marginTop: 16 }}>{renderCalendar(mk)}</div>
            </Card>
          );
        }}
      />

      {/* Donut */}
      <Card style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Salary Breakdown</div>
        {(() => {
          const data = getDonutData(currentMonth);
          const total = (salary[currentMonth] || 0);
          return data.length > 0
            ? <DonutChart data={data} total={total} label="salary" />
            : <div style={{ textAlign: "center", color: T.muted, padding: 24, fontSize: 13 }}>No salary spends logged</div>;
        })()}
      </Card>

      {/* Date popup */}
      {selectedDate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setSelectedDate(null)} style={{ position: "absolute", inset: 0, background: "#00000088" }} />
          <div className="slide-up" style={{ position: "relative", background: T.surface, borderRadius: "24px 24px 0 0", padding: 24, paddingBottom: 40, maxHeight: "60vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              {new Date(selectedDate.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {selectedDate.txns.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat?.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{t.note || cat?.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{cat?.name}</div>
                    </div>
                  </div>
                  <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: T.danger }}>-{fmt(t.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CARDS PAGE ───────────────────────────────────────────────────────────────
function CardsPage({ transactions, categories, cards }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);
  const [selectedCard, setSelectedCard] = useState("all");
  const months = getLast6Months().reverse();
  const currentMonth = getMonthKey(new Date());

  const getBillingPeriod = (card, monthKey) => {
    const [y, m] = monthKey.split("-").map(Number);
    const bd = card.billingDate;
    const start = new Date(y, m - 2, bd + 1);
    const end = new Date(y, m - 1, bd);
    return { start, end };
  };

  const getCardTxns = (card, monthKey) => {
    const { start, end } = getBillingPeriod(card, monthKey);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return t.cardId === card.id && d >= start && d <= end;
    });
  };

  const getCurrentCardTxns = (card) => getCardTxns(card, currentMonth);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 16px 100px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Cards</h1>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Utilization & spends</div>

      {/* Card Utilization */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>UTILIZATION</div>
        {cards.map((card) => {
          const txns = getCurrentCardTxns(card);
          const spent = txns.reduce((s, t) => s + t.amount, 0);
          const pct = Math.round((spent / card.limit) * 100);
          const isExpanded = expandedCard === card.id;

          return (
            <Card key={card.id} style={{ marginBottom: 10 }}>
              <div onClick={() => setExpandedCard(isExpanded ? null : card.id)} style={{ padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{card.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>•••• {card.last4}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: pct > 90 ? T.danger : pct > 70 ? T.warning : T.text }}>{fmt(spent)}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>of {fmt(card.limit)} · {pct}%</div>
                  </div>
                </div>
                <ProgressBar value={spent} max={card.limit} color={card.color} />
              </div>

              {isExpanded && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "0 16px 16px" }}>
                  <div style={{ paddingTop: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>RECENT TRANSACTIONS</div>
                    <div className="scroll-x" style={{ gap: 8, paddingBottom: 4 }}>
                      {months.map((mk) => {
                        const mTxns = getCardTxns(card, mk);
                        return (
                          <div key={mk} className="snap-start" style={{ minWidth: 280 }}>
                            <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{getMonthLabel(mk)}</div>
                            {mTxns.length === 0
                              ? <div style={{ fontSize: 12, color: T.muted, padding: "8px 0" }}>No transactions</div>
                              : mTxns.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => {
                                  const cat = categories.find((c) => c.id === t.categoryId);
                                  return (
                                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 16 }}>{cat?.icon}</span>
                                        <div>
                                          <div style={{ fontSize: 13 }}>{t.note || cat?.name}</div>
                                          <div style={{ fontSize: 11, color: T.muted }}>{t.date}</div>
                                        </div>
                                      </div>
                                      <div className="tabular" style={{ fontSize: 14, fontWeight: 600, color: T.danger }}>-{fmt(t.amount)}</div>
                                    </div>
                                  );
                                })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Category Budgets */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>CATEGORY BUDGETS</div>
        {categories.filter((c) => c.budget > 0).map((cat) => {
          const txns = transactions.filter((t) => t.categoryId === cat.id && t.date.startsWith(currentMonth));
          const spent = txns.reduce((s, t) => s + t.amount, 0);
          const isExpanded = expandedCat === cat.id;

          return (
            <Card key={cat.id} style={{ marginBottom: 10 }}>
              <div onClick={() => setExpandedCat(isExpanded ? null : cat.id)} style={{ padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{cat.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.name}</div>
                  </div>
                  <div className="tabular" style={{ fontSize: 13, color: T.muted }}>
                    {fmt(spent)} <span style={{ color: T.border }}>/ {fmt(cat.budget)}</span>
                  </div>
                </div>
                <ProgressBar value={spent} max={cat.budget} color={cat.color} />
              </div>

              {isExpanded && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 16px 16px" }}>
                  {txns.length === 0
                    ? <div style={{ fontSize: 12, color: T.muted }}>No transactions this month</div>
                    : txns.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => {
                        const c = cards.find((cd) => cd.id === t.cardId);
                        return (
                          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                            <div>
                              <div style={{ fontSize: 13 }}>{t.note || cat.name}</div>
                              <div style={{ fontSize: 11, color: T.muted }}>{t.date} · {c ? c.name : "Salary"}</div>
                            </div>
                            <div className="tabular" style={{ fontSize: 14, fontWeight: 600, color: T.danger }}>-{fmt(t.amount)}</div>
                          </div>
                        );
                      })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Card-wise Category Split */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>CARD-WISE BREAKDOWN</div>
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          style={{ width: "100%", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", marginBottom: 16, colorScheme: "dark" }}
        >
          <option value="all">All Cards</option>
          {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <MonthScroller
          months={months}
          currentMonth={currentMonth}
          renderMonth={(mk) => {
            const filtered = selectedCard === "all"
              ? transactions.filter((t) => t.date.startsWith(mk) && t.source === "card")
              : (() => {
                  const card = cards.find((c) => c.id === selectedCard);
                  return card ? getCardTxns(card, mk) : [];
                })();

            return (
              <Card style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>{getMonthLabel(mk)}</div>
                {categories.map((cat) => {
                  const spent = filtered.filter((t) => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
                  if (spent === 0) return null;
                  const total = filtered.reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={cat.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                          <span>{cat.icon}</span> {cat.name}
                        </div>
                        <div className="tabular" style={{ fontSize: 13, color: T.muted }}>{fmt(spent)}</div>
                      </div>
                      <ProgressBar value={spent} max={total} color={cat.color} />
                    </div>
                  );
                })}
              </Card>
            );
          }}
        />
      </div>
    </div>
  );
}

// ─── SETUP PAGE ───────────────────────────────────────────────────────────────
function SetupPage({ categories, setCategories, cards, setCards }) {
  const [editCat, setEditCat] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [newCat, setNewCat] = useState({ name: "", color: "#7C6EF8", icon: "🏷️", budget: "" });
  const [newCard, setNewCard] = useState({ name: "", last4: "", limit: "", billingDate: "", color: "#7C6EF8" });
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const COLORS = ["#7C6EF8", "#22D3A5", "#F59E0B", "#EF4444", "#10B981", "#EC4899", "#F97316", "#3B82F6"];
  const ICONS = ["🍜", "🚗", "🛍️", "⚡", "💊", "🎬", "🛒", "✈️", "🏠", "💰", "🎮", "📱", "💄", "🐕", "📚", "🏋️"];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 16px 100px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Setup</h1>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>Manage categories & cards</div>

      {/* Categories */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>CATEGORIES</div>
          <button onClick={() => setShowAddCat(true)} style={{ background: T.accentDim, border: `1px solid ${T.accent}44`, color: T.accent, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add</button>
        </div>

        {categories.map((cat) => (
          <Card key={cat.id} style={{ marginBottom: 8, padding: 14 }}>
            {editCat?.id === cat.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={editCat.icon} onChange={(e) => setEditCat((p) => ({ ...p, icon: e.target.value }))} style={{ width: 48, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px", color: T.text, fontSize: 18, textAlign: "center", outline: "none" }} />
                  <input value={editCat.name} onChange={(e) => setEditCat((p) => ({ ...p, name: e.target.value }))} placeholder="Name" style={{ flex: 1, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
                  <input value={editCat.budget} onChange={(e) => setEditCat((p) => ({ ...p, budget: e.target.value }))} placeholder="Budget" type="number" style={{ width: 90, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COLORS.map((c) => <div key={c} onClick={() => setEditCat((p) => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: editCat.color === c ? `2px solid white` : "2px solid transparent", cursor: "pointer" }} />)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setCategories((p) => p.map((c) => c.id === editCat.id ? { ...editCat, budget: parseFloat(editCat.budget) || 0 } : c)); setEditCat(null); }} style={{ flex: 1, background: T.accent, border: "none", color: T.white, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Save</button>
                  <button onClick={() => setEditCat(null)} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.name}</div>
                  <div className="tabular" style={{ fontSize: 11, color: T.muted }}>Budget: {fmt(cat.budget || 0)}/mo</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditCat({ ...cat, budget: cat.budget?.toString() || "" })} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>Edit</button>
                  <button onClick={() => setCategories((p) => p.filter((c) => c.id !== cat.id))} style={{ background: `${T.danger}11`, border: `1px solid ${T.danger}22`, color: T.danger, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>Del</button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {showAddCat && (
          <Card style={{ padding: 14, border: `1px solid ${T.accent}44` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>New Category</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newCat.icon} onChange={(e) => setNewCat((p) => ({ ...p, icon: e.target.value }))} style={{ width: 48, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px", color: T.text, fontSize: 18, textAlign: "center", outline: "none" }} />
                <input value={newCat.name} onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))} placeholder="Category name" style={{ flex: 1, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
                <input value={newCat.budget} onChange={(e) => setNewCat((p) => ({ ...p, budget: e.target.value }))} placeholder="₹ Budget" type="number" style={{ width: 90, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {COLORS.map((c) => <div key={c} onClick={() => setNewCat((p) => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: newCat.color === c ? `2px solid white` : "2px solid transparent", cursor: "pointer" }} />)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!newCat.name) return;
                  setCategories((p) => [...p, { ...newCat, id: `c${Date.now()}`, budget: parseFloat(newCat.budget) || 0 }]);
                  setNewCat({ name: "", color: "#7C6EF8", icon: "🏷️", budget: "" });
                  setShowAddCat(false);
                }} style={{ flex: 1, background: T.accent, border: "none", color: T.white, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add Category</button>
                <button onClick={() => setShowAddCat(false)} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Cards */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>CREDIT CARDS</div>
          <button onClick={() => setShowAddCard(true)} style={{ background: T.accentDim, border: `1px solid ${T.accent}44`, color: T.accent, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add</button>
        </div>

        {cards.map((card) => (
          <Card key={card.id} style={{ marginBottom: 8, padding: 14 }}>
            {editCard?.id === card.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input value={editCard.name} onChange={(e) => setEditCard((p) => ({ ...p, name: e.target.value }))} placeholder="Card name" style={{ gridColumn: "1/-1", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
                  <input value={editCard.last4} onChange={(e) => setEditCard((p) => ({ ...p, last4: e.target.value }))} placeholder="Last 4 digits" maxLength={4} style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
                  <input value={editCard.limit} onChange={(e) => setEditCard((p) => ({ ...p, limit: e.target.value }))} placeholder="Card limit" type="number" style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
                  <input value={editCard.billingDate} onChange={(e) => setEditCard((p) => ({ ...p, billingDate: e.target.value }))} placeholder="Billing date (1-31)" type="number" min={1} max={31} style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {COLORS.map((c) => <div key={c} onClick={() => setEditCard((p) => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: editCard.color === c ? `2px solid white` : "2px solid transparent", cursor: "pointer" }} />)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setCards((p) => p.map((c) => c.id === editCard.id ? { ...editCard, limit: parseFloat(editCard.limit) || 0, billingDate: parseInt(editCard.billingDate) || 1 } : c)); setEditCard(null); }} style={{ flex: 1, background: T.accent, border: "none", color: T.white, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Save</button>
                  <button onClick={() => setEditCard(null)} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💳</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{card.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>•••• {card.last4} · Limit: {fmt(card.limit)} · Bills {card.billingDate}th</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditCard({ ...card, limit: card.limit?.toString(), billingDate: card.billingDate?.toString() })} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>Edit</button>
                  <button onClick={() => setCards((p) => p.filter((c) => c.id !== card.id))} style={{ background: `${T.danger}11`, border: `1px solid ${T.danger}22`, color: T.danger, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>Del</button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {showAddCard && (
          <Card style={{ padding: 14, border: `1px solid ${T.accent}44` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>New Card</div>
              <input value={newCard.name} onChange={(e) => setNewCard((p) => ({ ...p, name: e.target.value }))} placeholder="Card name (e.g. HDFC Regalia)" style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 14, outline: "none" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <input value={newCard.last4} onChange={(e) => setNewCard((p) => ({ ...p, last4: e.target.value }))} placeholder="Last 4" maxLength={4} style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 14, outline: "none" }} />
                <input value={newCard.limit} onChange={(e) => setNewCard((p) => ({ ...p, limit: e.target.value }))} placeholder="Limit ₹" type="number" style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 14, outline: "none" }} />
                <input value={newCard.billingDate} onChange={(e) => setNewCard((p) => ({ ...p, billingDate: e.target.value }))} placeholder="Bill date" type="number" min={1} max={31} style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {COLORS.map((c) => <div key={c} onClick={() => setNewCard((p) => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: newCard.color === c ? `2px solid white` : "2px solid transparent", cursor: "pointer" }} />)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!newCard.name) return;
                  setCards((p) => [...p, { ...newCard, id: `card${Date.now()}`, limit: parseFloat(newCard.limit) || 0, billingDate: parseInt(newCard.billingDate) || 1 }]);
                  setNewCard({ name: "", last4: "", limit: "", billingDate: "", color: "#7C6EF8" });
                  setShowAddCard(false);
                }} style={{ flex: 1, background: T.accent, border: "none", color: T.white, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add Card</button>
                <button onClick={() => setShowAddCard(false)} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⬡" },
  { id: "salary", label: "Salary", icon: "💰" },
  { id: "cards", label: "Cards", icon: "💳" },
  { id: "setup", label: "Setup", icon: "⚙️" },
];

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editTxn, setEditTxn] = useState(null);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("st_transactions");
    return saved ? JSON.parse(saved) : generateMockTransactions();
  });
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("st_categories");
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("st_cards");
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });
  const [salary, setSalary] = useState(() => {
    const saved = localStorage.getItem("st_salary");
    return saved ? JSON.parse(saved) : INITIAL_SALARY;
  });

  useEffect(() => { localStorage.setItem("st_transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("st_categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("st_cards", JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem("st_salary", JSON.stringify(salary)); }, [salary]);

  const handleSave = (txn, isDelete = false) => {
    if (isDelete && editTxn) {
      setTransactions((p) => p.filter((t) => t.id !== editTxn.id));
    } else if (editTxn) {
      setTransactions((p) => p.map((t) => t.id === txn.id ? txn : t));
    } else {
      setTransactions((p) => [...p, txn]);
    }
    setEditTxn(null);
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: T.bg, maxWidth: 430, margin: "0 auto", position: "relative" }}>

        {/* Safe area top padding */}
        <div style={{ paddingTop: "env(safe-area-inset-top, 12px)", background: T.bg }} />

        {/* Page Content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {page === "home" && <HomePage transactions={transactions} categories={categories} salary={salary} />}
          {page === "salary" && <SalaryPage transactions={transactions} categories={categories} salary={salary} setSalary={setSalary} />}
          {page === "cards" && <CardsPage transactions={transactions} categories={categories} cards={cards} />}
          {page === "setup" && <SetupPage categories={categories} setCategories={setCategories} cards={cards} setCards={setCards} />}
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "relative", background: T.surface, borderTop: `1px solid ${T.border}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          display: "flex", alignItems: "center", zIndex: 50,
        }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = page === item.id;
            // Insert + button gap in middle
            const insertPlus = i === 2;
            return (
              <div key={item.id} style={{ display: "flex", flex: 1, position: "relative" }}>
                {insertPlus && (
                  <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <button
                      onClick={() => { setEditTxn(null); setShowAddSheet(true); }}
                      style={{
                        width: 52, height: 52, borderRadius: 16, border: "none",
                        background: `linear-gradient(135deg, ${T.accent}, #5A4FD4)`,
                        color: T.white, fontSize: 24, cursor: "pointer",
                        boxShadow: `0 4px 20px ${T.accent}66`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: "translateY(-8px)",
                        fontWeight: 300,
                      }}
                    >+</button>
                  </div>
                )}
                <button
                  onClick={() => setPage(item.id)}
                  style={{
                    flex: 1, background: "none", border: "none", padding: "12px 0 10px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    cursor: "pointer", color: isActive ? T.accent : T.muted,
                    transition: "color 0.2s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                  {isActive && <div style={{ width: 4, height: 4, borderRadius: 99, background: T.accent, position: "absolute", bottom: 6 }} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Sheet */}
      {showAddSheet && (
        <AddTransactionSheet
          onClose={() => { setShowAddSheet(false); setEditTxn(null); }}
          categories={categories}
          cards={cards}
          onSave={handleSave}
          editTxn={editTxn}
        />
      )}
    </>
  );
}
