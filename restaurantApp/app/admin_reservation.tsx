// app/(protected)/admin-reservations.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reservation {
    reservation_id: number;
    restaurant_name: string;
    date: string;
    time: string;
    people_count: number;
    user_id: number;
}

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';

export default function AllReservationsScreen() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editPeople, setEditPeople] = useState('');

    /* --- Load token & role --- */
    useEffect(() => {
        (async () => {
            setToken(await AsyncStorage.getItem('token'));
            setRole(await AsyncStorage.getItem('role'));
        })();
    }, []);

    /* --- Fetch all reservations --- */
    useEffect(() => {
        if (role !== 'admin') return; // safeguard
        (async () => {
            try {
                const res = await fetch('http://192.168.1.37:5000/reservations', {
                    headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
                });
                const data = await res.json();
                setReservations(data);
            } catch {
                Alert.alert('Error loading reservations');
            } finally {
                setLoading(false);
            }
        })();
    }, [role]);

    /* --- Delete --- */
    const handleDelete = (id: number) => {
        Alert.alert('Delete reservation?', '', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const res = await fetch(
                            `http://192.168.1.37:5000/reservations/${id}`,
                            {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );
                        if (res.ok) {
                            setReservations(prev =>
                                prev.filter(r => r.reservation_id !== id)
                            );
                        } else {
                            const err = await res.json();
                            Alert.alert(err.error || 'Delete failed');
                        }
                    } catch {
                        Alert.alert('Server error');
                    }
                },
            },
        ]);
    };

    /* --- Start edit -- */
    const startEdit = (r: Reservation) => {
        setEditId(r.reservation_id);
        setEditDate(r.date);
        setEditTime(r.time);
        setEditPeople(r.people_count.toString());
    };

    /* --- Save edit --- */
    const saveEdit = async () => {
        if (!editId) return;
        try {
            const res = await fetch(
                `http://192.168.1.37:5000/reservations/${editId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        date: editDate,
                        time: editTime,
                        people_count: parseInt(editPeople),
                    }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setReservations(prev =>
                    prev.map(r =>
                        r.reservation_id === editId
                            ? { ...r, date: editDate, time: editTime, people_count: +editPeople }
                            : r
                    )
                );
                cancelEdit();
            } else Alert.alert(data.error || 'Update failed');
        } catch {
            Alert.alert('Server error');
        }
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditDate('');
        setEditTime('');
        setEditPeople('');
    };

    /* --- Render --- */
    if (role !== 'admin')
        return (
            <View style={styles.screen}>
                <Text style={styles.noAdmin}>Access denied (admin only)</Text>
            </View>
        );

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

    return (
        <View style={styles.screen}>
            <Text style={styles.title}>All Reservations</Text>

            <FlatList
                data={reservations}
                keyExtractor={i => i.reservation_id.toString()}
                renderItem={({ item }) =>
                    editId === item.reservation_id ? (

                        <View style={styles.card}>
                            <Text style={styles.name}>{item.restaurant_name}</Text>

                            <TextInput
                                value={editDate}
                                onChangeText={setEditDate}
                                placeholder="YYYY-MM-DD"
                                style={styles.input}
                            />
                            <TextInput
                                value={editTime}
                                onChangeText={setEditTime}
                                placeholder="HH:MM"
                                style={styles.input}
                            />
                            <TextInput
                                value={editPeople}
                                onChangeText={setEditPeople}
                                keyboardType="number-pad"
                                style={styles.input}
                            />

                            <View style={styles.row}>
                                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                                    <Text style={styles.btnTxt}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                                    <Text style={styles.btnTxt}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        /* --- NORMAL CARD --- */
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.restaurant_name}</Text>
                            <Text style={styles.rowText}>
                                📅 {item.date}    🕒 {item.time}
                            </Text>
                            <Text style={styles.rowText}>
                                👥 {item.people_count} — User #{item.user_id}
                            </Text>

                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={styles.editBtn}
                                    onPress={() => startEdit(item)}
                                >
                                    <Text style={styles.btnTxt}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.delBtn}
                                    onPress={() => handleDelete(item.reservation_id)}
                                >
                                    <Text style={styles.btnTxt}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            />
        </View>
    );
}

/* --- Styles --- */
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f2f2f7', padding: 18 },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: PURPLE,
        textAlign: 'center',
        marginBottom: 18,
    },
    noAdmin: {
        marginTop: 80,
        textAlign: 'center',
        fontSize: 18,
        color: '#777',
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
    name: { fontSize: 18, fontWeight: '700', color: PURPLE },
    rowText: { marginTop: 4, color: '#444' },
    row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 },
    editBtn: {
        backgroundColor: LIGHT_PURPLE,
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        marginRight: 10,
    },
    delBtn: {
        backgroundColor: '#cc0000',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    saveBtn: {
        backgroundColor: PURPLE,
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        marginRight: 10,
    },
    cancelBtn: {
        backgroundColor: '#777',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    btnTxt: { color: '#fff', fontWeight: '700' },
    input: {
        backgroundColor: LIGHT_PURPLE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginTop: 8,
        color: '#333',
    },
});
