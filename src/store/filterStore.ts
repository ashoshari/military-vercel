'use client';

import { create } from 'zustand';

export interface FilterState {
    // ── فلاتر لحظية (فروع متعددة + فترة) ── [] = كل الفروع
    activeBranches: string[];
    activePeriod: string;

    // ── فلاتر متقدمة ──
    year: string;
    quarter: string;
    month: string;
    day: string;
    branch: string[];
    market: string[];
    region: string[];
    productCategory: string[];
    subcategory: string[];
    product: string[];
    salesType: string;
    paymentType: string;
    discountRange: [number, number];
    employee: string[];
    /** /employees only */
    workShift: "all" | "morning" | "evening";
    /** /employees only (percent) */
    returnRateRange: [number, number];
    agreement: string[];
    season: string;
    holiday: string;
    isApplied: boolean;
    isLoading: boolean;
}

interface FilterActions {
    setActiveBranches: (branches: string[]) => void;
    setActivePeriod: (period: string) => void;
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    applyFilters: () => void;
    resetFilters: () => void;
    setLoading: (loading: boolean) => void;
}

const defaultFilters: FilterState = {
    activeBranches: [],
    activePeriod: 'month',
    year: new Date().getFullYear().toString(),
    quarter: '',
    month: '',
    day: '',
    branch: [],
    market: [],
    region: [],
    productCategory: [],
    subcategory: [],
    product: [],
    salesType: '',
    paymentType: '',
    discountRange: [0, 100],
    employee: [],
    workShift: "all",
    returnRateRange: [0, 100],
    agreement: [],
    season: '',
    holiday: '',
    isApplied: false,
    isLoading: false,
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
    ...defaultFilters,
    setActiveBranches: (branches) => set({ activeBranches: branches }),
    setActivePeriod: (period) => set({ activePeriod: period }),
    setFilter: (key, value) => set({ [key]: value, isApplied: false }),
    applyFilters: () => set({ isApplied: true, isLoading: true }),
    resetFilters: () => set({ ...defaultFilters }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
