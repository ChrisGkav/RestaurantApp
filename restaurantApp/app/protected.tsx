import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                router.replace('/login');
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;

