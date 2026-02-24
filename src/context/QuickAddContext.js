'use client';

import { createContext, useContext, useState } from 'react';

export const QuickAddContext = createContext();

export function QuickAddProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <QuickAddContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </QuickAddContext.Provider>
    );
}

export function useQuickAdd() {
    return useContext(QuickAddContext);
}
