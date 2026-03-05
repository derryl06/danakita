'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [targets, setTargets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [partner, setPartner] = useState(null);
    const [categories, setCategories] = useState(['General', 'Menikah', 'Pendidikan', 'Rumah', 'Darurat']);
    const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dk_privacy_mode') === 'true';
        }
        return false;
    });

    // Monitor Auth Status
    useEffect(() => {
        if (!auth) return;

        let unsubscribeTargets = null;
        let unsubscribeTx = null;
        let unsubscribeHousehold = null;

        const cleanupListeners = () => {
            if (unsubscribeTargets) unsubscribeTargets();
            if (unsubscribeTx) unsubscribeTx();
            if (unsubscribeHousehold) unsubscribeHousehold();
            unsubscribeTargets = null;
            unsubscribeTx = null;
            unsubscribeHousehold = null;
        };

        const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
            setUser(fbUser);
            cleanupListeners();

            if (fbUser && db) {
                // Check/Create Profile
                const profileRef = doc(db, 'profiles', fbUser.uid);
                const profileSnap = await getDoc(profileRef);

                let currentProfile;
                if (!profileSnap.exists()) {
                    // Create new profile with a random household_id
                    const newHouseholdId = doc(collection(db, 'households')).id;
                    currentProfile = {
                        id: fbUser.uid,
                        username: fbUser.email,
                        household_id: newHouseholdId,
                        partner_name: null,
                        updated_at: serverTimestamp()
                    };
                    await setDoc(profileRef, currentProfile);
                } else {
                    currentProfile = profileSnap.data();
                }

                setProfile(currentProfile);
                setPartner(currentProfile.partner_name ? { name: currentProfile.partner_name } : null);

                // Setup Real-time Listeners
                const qTargets = query(collection(db, 'targets'), where('household_id', '==', currentProfile.household_id));
                unsubscribeTargets = onSnapshot(qTargets, (snapshot) => {
                    const targetsArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTargets(targetsArr);
                });

                const qTx = query(
                    collection(db, 'transactions'),
                    where('household_id', '==', currentProfile.household_id)
                );
                unsubscribeTx = onSnapshot(qTx, (snapshot) => {
                    const txArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    txArr.sort((a, b) => {
                        const aDate = a?.created_at?.toDate?.() ?? new Date(a?.date || a?.created_at || 0);
                        const bDate = b?.created_at?.toDate?.() ?? new Date(b?.date || b?.created_at || 0);
                        return bDate - aDate;
                    });
                    setTransactions(txArr);
                });

                // Listen to Household for shared categories
                const householdRef = doc(db, 'households', currentProfile.household_id);
                unsubscribeHousehold = onSnapshot(householdRef, (docSnap) => {
                    if (docSnap.exists() && docSnap.data().categories) {
                        setCategories(docSnap.data().categories);
                    }
                });
            } else {
                // Load from LocalStorage for Guest Mode
                const savedTargets = localStorage.getItem('dk_targets');
                const savedTx = localStorage.getItem('dk_transactions');
                const savedPartner = localStorage.getItem('dk_partner');
                const savedCategories = localStorage.getItem('dk_categories');

                if (savedTargets) setTargets(JSON.parse(savedTargets));
                else setTargets([]);

                if (savedTx) setTransactions(JSON.parse(savedTx));
                else setTransactions([]);

                if (savedPartner) setPartner(JSON.parse(savedPartner));
                else setPartner(null);

                if (savedCategories) setCategories(JSON.parse(savedCategories));
                else setCategories(['General', 'Menikah', 'Pendidikan', 'Rumah', 'Darurat']);

                setProfile(null);
            }
        });

        return () => {
            unsubscribeAuth();
            cleanupListeners();
        };
    }, []);

    // Sync Guest Data to LocalStorage
    useEffect(() => {
        if (!user && !isDemoMode) {
            localStorage.setItem('dk_targets', JSON.stringify(targets));
            localStorage.setItem('dk_transactions', JSON.stringify(transactions));
            localStorage.setItem('dk_partner', JSON.stringify(partner));
            localStorage.setItem('dk_categories', JSON.stringify(categories));
        }
    }, [targets, transactions, partner, categories, user, isDemoMode]);

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

    const addTransaction = async (transaction) => {
        if (user && profile) {
            const txData = {
                ...transaction,
                household_id: profile.household_id,
                created_by: user.uid,
                user_name: profile.username || user.email.split('@')[0], // For sharing context
                date: new Date().toISOString() // Or serverTimestamp but ISO is easier for existing UI
            };
            await addDoc(collection(db, 'transactions'), txData);

            // Update current_amount in target doc
            const targetRef = doc(db, 'targets', transaction.targetId);
            const targetSnap = await getDoc(targetRef);
            if (targetSnap.exists()) {
                const currentAmt = targetSnap.data().current_amount || 0;
                const newAmount = currentAmt + (transaction.type === 'in' ? transaction.amount : -transaction.amount);
                await updateDoc(targetRef, { current_amount: newAmount });
            }
        } else {
            const txWithUser = { ...transaction, user_name: 'Saya' };
            setTransactions(prev => [txWithUser, ...prev]);
            setTargets(prev => prev.map(t => {
                if (t.id === transaction.targetId) {
                    return {
                        ...t,
                        current_amount: t.current_amount + (transaction.type === 'in' ? transaction.amount : -transaction.amount)
                    };
                }
                return t;
            }));
        }
    };

    const addTarget = async (target) => {
        if (user && profile) {
            const targetData = {
                name: target.name,
                category: target.category,
                target_amount: target.target_amount,
                current_amount: target.current_amount || 0,
                deadline: target.deadline || null,
                is_inflation_adjusted: target.is_inflation_adjusted || false,
                inflation_rate: target.inflation_rate || 5,
                original_target_amount: target.original_target_amount || target.target_amount,
                storage_location: target.storage_location || 'Bank',
                household_id: profile.household_id,
                created_by: user.uid,
                created_at: serverTimestamp()
            };
            await addDoc(collection(db, 'targets'), targetData);
        } else {
            const newTarget = { ...target, id: Date.now().toString() };
            setTargets(prev => [...prev, newTarget]);
        }
    };

    const deleteTarget = async (id) => {
        if (user) {
            await deleteDoc(doc(db, 'targets', id));
        } else {
            setTargets(prev => prev.filter(t => t.id !== id));
        }
    };

    const updateTarget = async (id, updatedData) => {
        if (user) {
            await updateDoc(doc(db, 'targets', id), {
                ...updatedData,
                updated_at: serverTimestamp()
            });
        } else {
            setTargets(prev => prev.map(t =>
                t.id === id ? { ...t, ...updatedData } : t
            ));
        }
    };

    const reactToTransaction = async (transactionId, reaction) => {
        if (!user) return;
        try {
            const tx = transactions.find(t => t.id === transactionId);
            if (!tx) return;

            const currentReactions = tx.reactions || {};
            // Toggle reaction: if same reaction exists, remove it. Else set it.
            if (currentReactions[user.uid] === reaction) {
                delete currentReactions[user.uid];
            } else {
                currentReactions[user.uid] = reaction;
            }

            await updateDoc(doc(db, 'transactions', transactionId), {
                reactions: currentReactions
            });
        } catch (error) {
            console.error("React to transaction error:", error);
        }
    };

    const connectPartner = async (name) => {
        if (user) {
            await updateDoc(doc(db, 'profiles', user.uid), { partner_name: name });
            setPartner({ name });
        } else {
            setPartner({ name, connectedAt: new Date().toISOString() });
        }
    };

    const togglePrivacyMode = () => {
        const newVal = !isPrivacyMode;
        setIsPrivacyMode(newVal);
        localStorage.setItem('dk_privacy_mode', newVal.toString());
    };

    const joinHousehold = async (targetHouseholdId) => {
        if (!user || !profile) return { success: false, message: 'Harus login dulu' };
        if (!targetHouseholdId || targetHouseholdId.length < 5) return { success: false, message: 'ID tidak valid' };

        try {
            // Update user profile to use new household_id
            await updateDoc(doc(db, 'profiles', user.uid), {
                household_id: targetHouseholdId
            });
            // Profile state will be updated by onSnapshot if we have one, 
            // but for now let's just refresh current profile state manually or let them reload
            setProfile(prev => ({ ...prev, household_id: targetHouseholdId }));
            return { success: true };
        } catch (error) {
            console.error("Join household error:", error);
            return { success: false, message: error.message };
        }
    };

    const addCategory = async (newCat) => {
        if (categories.includes(newCat)) return;
        const updatedCats = [...categories, newCat];
        setCategories(updatedCats);

        if (user && profile) {
            await setDoc(doc(db, 'households', profile.household_id), { categories: updatedCats }, { merge: true });
        }
    };

    const removeCategory = async (cat) => {
        const updatedCats = categories.filter(c => c !== cat);
        setCategories(updatedCats);

        if (user && profile) {
            await setDoc(doc(db, 'households', profile.household_id), { categories: updatedCats }, { merge: true });
        }
    };

    return (
        <AppContext.Provider value={{
            user,
            profile,
            targets,
            transactions,
            categories,
            isDemoMode,
            partner,
            loadDemoData,
            clearData,
            addTransaction,
            addTarget,
            deleteTarget,
            updateTarget,
            connectPartner,
            reactToTransaction,
            addCategory,
            removeCategory,
            isPrivacyMode,
            togglePrivacyMode,
            joinHousehold
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
