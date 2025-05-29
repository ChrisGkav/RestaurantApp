import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PURPLE = '#6933ff';

/* Logout as a user or admin. */
export default function LogoutScreen() {
    const router = useRouter();

    const handleLogout = async () => {

        await AsyncStorage.multiRemove(['userId', 'role', 'token']);

        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece9ff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        backgroundColor: PURPLE,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 10,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
});
