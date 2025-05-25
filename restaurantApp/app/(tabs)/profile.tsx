import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, RefreshControl, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reservation {
    reservation_id: number;
    restaurant_name: string;
    date: string;
    time: string;
    people_count: number;
}

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';

export default function ProfileScreen() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    /* --- Fetch only this‑user reservations --- */
    const fetchReservations = useCallback(async () => {
        const id = await AsyncStorage.getItem('userId');
        if (!id) return;

        try {
            const res = await fetch(
                `http://192.168.1.37:5000/reservations/user/${id}`
            );
            const data = await res.json();
            setReservations(data);
        } catch {
            Alert.alert('Error', 'Could not load reservations');
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, []);

    /* --- Delete --- */
    const handleDelete = (id: number) =>
        Alert.alert('Delete reservation?', '', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await fetch(`http://192.168.1.37:5000/reservations/${id}`, {
                            method: 'DELETE',
                        });
                        setReservations(prev =>
                            prev.filter(r => r.reservation_id !== id)
                        );
                    } catch {
                        Alert.alert('Error', 'Delete failed');
                    }
                },
            },
        ]);

    const renderItem = ({ item }: { item: Reservation }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.restaurant_name}</Text>
            <Text style={styles.row}>
                📅 {item.date}    🕒 {item.time}
            </Text>
            <Text style={styles.row}>👥 {item.people_count} people</Text>

            <View style={styles.btnRow}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                        Alert.alert('TODO', 'Implement edit modal if needed.')
                    }
                >
                    <Text style={styles.editTxt}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => handleDelete(item.reservation_id)}
                >
                    <Text style={styles.btnTxt}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.screen}>
            <Text style={styles.title}>My Reservations</Text>

            <FlatList
                data={reservations}
                keyExtractor={i => i.reservation_id.toString()}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true);
                            await fetchReservations();
                            setRefreshing(false);
                        }}
                        colors={[PURPLE]}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.empty}>No reservations yet</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#ece9ff',
        padding: 18,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: PURPLE,
        textAlign: 'center',
        marginBottom: 18,
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: PURPLE,
        marginBottom: 4,
    },
    row: { color: '#444', marginTop: 2 },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 14,
    },
    editBtn: {
        backgroundColor: LIGHT_PURPLE,
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        marginRight: 10,
    },
    editTxt: { color: PURPLE, fontWeight: '700' },
    delBtn: {
        backgroundColor: '#cc0000',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    btnTxt: { color: '#fff', fontWeight: '700' },
});
