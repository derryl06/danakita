'use client';

import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [targets, setTargets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [checklist, setChecklist] = useState([
        { id: 1, task: 'Set Target Tabungan', category: 'Perencanaan', done: false },
        { id: 2, task: 'Buka Rekening Khusus', category: 'Keuangan', done: false },
        { id: 3, task: 'Tentukan Budget Bulanan', category: 'Keuangan', done: false },
        { id: 4, task: 'Automatisasi Transfer', category: 'Keuangan', done: false },
        { id: 5, task: 'Review Progress Mingguan', category: 'Monitoring', done: false },
        { id: 6, task: 'Kurangi Pengeluaran Non-Esensial', category: 'Gaya Hidup', done: false },
    ]);
    const [partner, setPartner] = useState(null);

    const loadDemoData = () => {
        setTargets([
            { id: '1', name: 'Dana Utama', category: 'General', target_amount: 120000000, current_amount: 18500000, deadline: '2029-01-01' },
            { id: '2', name: 'Isi Rumah', category: 'Rumah', target_amount: 30000000, current_amount: 3000000, deadline: null },
            { id: '3', name: 'Dana Darurat', category: 'Darurat', target_amount: 15000000, current_amount: 2000000, deadline: null },
        ]);
        setIsDemoMode(true);
    };

    const clearData = () => {
        setTargets([]);
        setTransactions([]);
        setPartner(null);
        setIsDemoMode(false);
    };

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev]);
        // update target current amount
        setTargets(prev => prev.map(t => {
            if (t.id === transaction.targetId) {
                return {
                    ...t,
                    current_amount: t.current_amount + (transaction.type === 'in' ? transaction.amount : -transaction.amount)
                };
            }
            return t;
        }));
    };

    const addTarget = (target) => {
        setTargets(prev => [...prev, target]);
    };

    const toggleChecklist = (id) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    const connectPartner = (name) => {
        setPartner({ name, connectedAt: new Date().toISOString() });
    };

    return (
        <AppContext.Provider value={{
            targets,
            transactions,
            isDemoMode,
            checklist,
            partner,
            loadDemoData,
            clearData,
            addTransaction,
            addTarget,
            toggleChecklist,
            connectPartner
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
