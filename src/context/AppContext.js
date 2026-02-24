'use client';

import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [targets, setTargets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const loadDemoData = () => {
        setTargets([
            { id: '1', name: 'Dana Utama', category: 'General', target_amount: 120000000, current_amount: 18500000, deadline: '2029-01-01' },
            { id: '2', name: 'Isi Rumah', category: 'General', target_amount: 30000000, current_amount: 3000000, deadline: null },
            { id: '3', name: 'Dana Darurat', category: 'General', target_amount: 15000000, current_amount: 2000000, deadline: null },
        ]);
        setIsDemoMode(true);
    };

    const clearData = () => {
        setTargets([]);
        setTransactions([]);
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

    return (
        <AppContext.Provider value={{ targets, transactions, isDemoMode, loadDemoData, clearData, addTransaction, addTarget }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
