"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BagItem } from "../types";

const STORAGE_KEY = "harmattan-bag";
type BagContextValue = { items: BagItem[]; itemCount: number; add: (slug: string, size?: BagItem["size"]) => void; remove: (slug: string, size: BagItem["size"]) => void; notice: string | null };
const BagContext = createContext<BagContextValue | null>(null);
function isBag(value: unknown): value is BagItem[] { return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && typeof (item as BagItem).slug === "string" && ((item as BagItem).size === "250g" || (item as BagItem).size === "1kg") && typeof (item as BagItem).quantity === "number"); }
function readBag(): BagItem[] { if (typeof window === "undefined") return []; try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown; return isBag(parsed) ? parsed : []; } catch { return []; } }
export function BagProvider({ children }: { children: React.ReactNode }) { const [items, setItems] = useState<BagItem[]>(readBag); const [notice, setNotice] = useState<string | null>(null); useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]); useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 2600); return () => window.clearTimeout(timer); }, [notice]); const add = useCallback((slug: string, size: BagItem["size"] = "250g") => { setItems((old) => { const current = old.find((item) => item.slug === slug && item.size === size); return current ? old.map((item) => item === current ? { ...item, quantity: item.quantity + 1 } : item) : [...old, { slug, size, quantity: 1 }]; }); setNotice("Coffee added to your bag"); }, []); const remove = useCallback((slug: string, size: BagItem["size"]) => { setItems((old) => old.filter((item) => item.slug !== slug || item.size !== size)); setNotice("Removed from your bag"); }, []); const value = useMemo(() => ({ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), add, remove, notice }), [items, add, remove, notice]); return <BagContext.Provider value={value}>{children}</BagContext.Provider>; }
export function useBag() { const context = useContext(BagContext); if (!context) throw new Error("useBag must be used inside BagProvider"); return context; }
