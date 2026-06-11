// App.jsx — drop-in replacement for the root component
// Wraps the full app with Firebase Auth + Firestore real-time subscriptions

import { useState, useEffect } from "react";
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  subscribeTransactions,
  subscribeCategories,
  subscribeCards,
  subscribeSalary,
  saveTransaction,
  deleteTransaction,
  saveCategory,
  deleteCategory,
  saveCard,
  deleteCard,
  saveSalary,
  seedDefaultData,
} from "./firebase";

// ─── design tokens & shared components are imported from SpendTracker.jsx ────
// In your Vite project, split SpendTracker.jsx into:
//   src/firebase.js          ← the firebase.js file
//   src/App.jsx              ← this file
//   src/components/...       ← pages & shared UI from SpendTracker.jsx
//
// For now this file shows the auth wrapper and data layer integration.

const T = {
  bg: "#0A0A0F", surface: "#13131A", raised: "#1C1C27",
  border: "#2A2A3A", accent: "#7C6EF8", mint: "#22D3A5",
  danger: "#EF4444", text: "#F0F0FF", muted: "#6B6B8A", white: "#FFFFFF",
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading }) {
  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: T.bg, padding: 32, gap: 24, maxWidth: 430, margin: "0 auto",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>₹</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 8 }}>Spends Tracker</h1>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
          Your personal finance dashboard.<br />All data synced across devices.
        </p>
      </div>
      <button
        onClick={onLogin}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: "14px 24px", cursor: loading ? "not-allowed" : "pointer",
          color: T.text, fontSize: 15, fontWeight: 600, opacity: loading ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
      <p style={{ fontSize: 11, color: T.muted, textAlign: "center", lineHeight: 1.6, maxWidth: 280 }}>
        Your data is stored privately in Firebase under your Google account. Nothing is shared.
      </p>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      background: T.bg, flexDirection: "column", gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>₹</div>
      <div style={{ fontSize: 13, color: T.muted }}>Loading your data…</div>
    </div>
  );
}

// ─── FIREBASE DATA HOOK ───────────────────────────────────────────────────────
function useFirebaseData(uid) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const [salary, setSalaryState] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) return;
    let loaded = { txn: false, cat: false, cards: false, salary: false };
    const checkReady = () => {
      if (Object.values(loaded).every(Boolean)) setReady(true);
    };

    const unsubTxn = subscribeTransactions(uid, (data) => {
      setTransactions(data);
      loaded.txn = true;
      checkReady();
    });
    const unsubCat = subscribeCategories(uid, (data) => {
      setCategories(data);
      loaded.cat = true;
      checkReady();
    });
    const unsubCards = subscribeCards(uid, (data) => {
      setCards(data);
      loaded.cards = true;
      checkReady();
    });
    const unsubSalary = subscribeSalary(uid, (data) => {
      setSalaryState(data);
      loaded.salary = true;
      checkReady();
    });

    return () => { unsubTxn(); unsubCat(); unsubCards(); unsubSalary(); };
  }, [uid]);

  // Wrapped setters that write to Firestore
  const handleSaveTransaction = async (txn, isDelete = false) => {
    if (isDelete) {
      await deleteTransaction(uid, txn.id);
    } else {
      await saveTransaction(uid, txn);
    }
    // No need to update local state — onSnapshot handles it
  };

  const handleSetCategories = async (updater) => {
    const updated = typeof updater === "function" ? updater(categories) : updater;
    // Diff and save changed/new categories
    for (const cat of updated) {
      await saveCategory(uid, cat);
    }
    // Delete removed ones
    const updatedIds = updated.map((c) => c.id);
    for (const cat of categories) {
      if (!updatedIds.includes(cat.id)) await deleteCategory(uid, cat.id);
    }
  };

  const handleSetCards = async (updater) => {
    const updated = typeof updater === "function" ? updater(cards) : updater;
    for (const card of updated) {
      await saveCard(uid, card);
    }
    const updatedIds = updated.map((c) => c.id);
    for (const card of cards) {
      if (!updatedIds.includes(card.id)) await deleteCard(uid, card.id);
    }
  };

  const handleSetSalary = async (updater) => {
    const updated = typeof updater === "function" ? updater(salary) : updater;
    for (const [monthKey, amount] of Object.entries(updated)) {
      if (salary[monthKey] !== amount) {
        await saveSalary(uid, monthKey, amount);
      }
    }
  };

  return {
    transactions, categories, cards, salary, ready,
    handleSaveTransaction,
    handleSetCategories,
    handleSetCards,
    handleSetSalary,
  };
}

// ─── ROOT APP WITH AUTH ───────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not signed in
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        await seedDefaultData(u.uid); // seed categories on first login
      }
      setUser(u);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    try { await signInWithGoogle(); }
    catch (e) { console.error(e); }
    finally { setAuthLoading(false); }
  };

  // Auth loading
  if (user === undefined) return <LoadingScreen />;
  // Not signed in
  if (!user) return <LoginScreen onLogin={handleLogin} loading={authLoading} />;
  // Signed in — load main app
  return <MainApp user={user} />;
}

// ─── MAIN APP (after auth) ────────────────────────────────────────────────────
function MainApp({ user }) {
  const {
    transactions, categories, cards, salary, ready,
    handleSaveTransaction, handleSetCategories, handleSetCards, handleSetSalary,
  } = useFirebaseData(user.uid);

  if (!ready) return <LoadingScreen />;

  // Pass all these into your existing page components from SpendTracker.jsx
  // Replace the localStorage-based state with these Firebase-backed handlers
  // Example:
  //   <HomePage transactions={transactions} categories={categories} salary={salary} />
  //   <SalaryPage ... setSalary={handleSetSalary} />
  //   <CardsPage ... />
  //   <SetupPage categories={categories} setCategories={handleSetCategories} cards={cards} setCards={handleSetCards} />

  return (
    <div style={{ padding: 20, color: T.text, background: T.bg, height: "100dvh" }}>
      <p style={{ color: T.mint, fontSize: 14 }}>
        ✅ Signed in as {user.email} — Firebase connected!
      </p>
      <p style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>
        {transactions.length} transactions · {categories.length} categories · {cards.length} cards
      </p>
      <button
        onClick={signOutUser}
        style={{ marginTop: 16, background: T.raised, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}
      >
        Sign out
      </button>
      {/* 
        In your full Vite build, replace the content above with the full layout from SpendTracker.jsx,
        passing the Firebase-backed handlers as props.
      */}
    </div>
  );
}
