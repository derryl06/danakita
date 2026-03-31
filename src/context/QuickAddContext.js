'use client';

import { createContext, useContext, useState } from 'react';

export const QuickAddContext = createContext();

export function QuickAddProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [prefillData, setPrefillData] = useState(null); // { amount, type, category }

    const openWithData = (data) => {
        setPrefillData(data);
        setIsOpen(true);
    };

    const toggleOpen = (val) => {
        if (typeof val === 'boolean') {
            if (!val) setPrefillData(null);
            setIsOpen(val);
        } else {
            setIsOpen(prev => !prev);
        }
    };

    return (
        <QuickAddContext.Provider value={{ isOpen, setIsOpen: toggleOpen, openWithData, prefillData }}>
            {children}
        </QuickAddContext.Provider>
    );
}

export function useQuickAdd() {
    return useContext(QuickAddContext);
}
