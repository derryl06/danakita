'use client';

import { useAppContext } from '../context/AppContext';
import { OnboardingModal } from './Gamification';

export default function OnboardingWrapper() {
    const { hasSeenOnboarding, completeOnboarding, isLoading } = useAppContext();

    if (isLoading || hasSeenOnboarding) return null;

    return <OnboardingModal onDismiss={completeOnboarding} />;
}
