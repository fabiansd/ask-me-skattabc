'use client'
import { useEffect, useState } from "react";


export default function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedState = localStorage.getItem(key);
            return savedState ? JSON.parse(savedState) : defaultValue;
        }
        return defaultValue;
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state]);

    return [state, setState];
};
