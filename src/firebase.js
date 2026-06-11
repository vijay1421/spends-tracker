// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
// Replace with your config if needed — this is already set to spendstracker-5e107
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANOmHgoqJkqau6QUTIh-cvsjGknryuxfU",
  authDomain: "spendstracker-5e107.firebaseapp.com",
  projectId: "spendstracker-5e107",
  storageBucket: "spendstracker-5e107.firebasestorage.app",
  messagingSenderId: "448975275599",
  appId: "1:448975275299:web:21d647734fcae497768c3a",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// All data is scoped under /users/{uid}/... so each user has isolated data
const userCol = (uid, col) => collection(db, "users", uid, col);
const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const subscribeTransactions = (uid, cb) => {
  const q = query(userCol(uid, "transactions"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const saveTransaction = async (uid, txn) => {
  const ref = userDoc(uid, "transactions", txn.id);
  await setDoc(ref, {
    ...txn,
    updatedAt: serverTimestamp(),
    createdAt: txn.createdAt || serverTimestamp(),
  });
};

export const deleteTransaction = async (uid, txnId) => {
  await deleteDoc(userDoc(uid, "transactions", txnId));
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const subscribeCategories = (uid, cb) => {
  return onSnapshot(userCol(uid, "categories"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const saveCategory = async (uid, cat) => {
  await setDoc(userDoc(uid, "categories", cat.id), cat);
};

export const deleteCategory = async (uid, catId) => {
  await deleteDoc(userDoc(uid, "categories", catId));
};

// ─── CARDS ────────────────────────────────────────────────────────────────────
export const subscribeCards = (uid, cb) => {
  return onSnapshot(userCol(uid, "cards"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const saveCard = async (uid, card) => {
  await setDoc(userDoc(uid, "cards", card.id), card);
};

export const deleteCard = async (uid, cardId) => {
  await deleteDoc(userDoc(uid, "cards", cardId));
};

// ─── SALARY ───────────────────────────────────────────────────────────────────
export const subscribeSalary = (uid, cb) => {
  return onSnapshot(userCol(uid, "salary"), (snap) => {
    const data = {};
    snap.docs.forEach((d) => { data[d.id] = d.data().amount; });
    cb(data);
  });
};

export const saveSalary = async (uid, monthKey, amount) => {
  await setDoc(userDoc(uid, "salary", monthKey), { amount, updatedAt: serverTimestamp() });
};

// ─── SEED DEFAULT DATA (first login) ─────────────────────────────────────────
export const seedDefaultData = async (uid) => {
  const defaultCategories = [
    { id: "c1", name: "Food", color: "#F59E0B", icon: "🍜", budget: 8000 },
    { id: "c2", name: "Travel", color: "#7C6EF8", icon: "🚗", budget: 5000 },
    { id: "c3", name: "Shopping", color: "#22D3A5", icon: "🛍️", budget: 6000 },
    { id: "c4", name: "Bills", color: "#EF4444", icon: "⚡", budget: 4000 },
    { id: "c5", name: "Health", color: "#10B981", icon: "💊", budget: 3000 },
    { id: "c6", name: "Entertainment", color: "#EC4899", icon: "🎬", budget: 2000 },
    { id: "c7", name: "Groceries", color: "#F97316", icon: "🛒", budget: 5000 },
  ];
  // Only seed if no categories exist yet
  const snap = await getDocs(userCol(uid, "categories"));
  if (snap.empty) {
    for (const cat of defaultCategories) {
      await saveCategory(uid, cat);
    }
  }
};
