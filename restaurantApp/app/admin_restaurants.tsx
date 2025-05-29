import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';

interface Restaurant {
    restaurant_id: number;
    name: string;
    location: string;
    description: string;
}

export default function AdminRestaurantsScreen() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    // Form state for add/edit
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Load token on mount
    useEffect(() => {
        (async () => {
            const t = await AsyncStorage.getItem('token');
            setToken(t);
        })();
    }, []);

    // Fetch list
    const fetchList = async () => {
        try {
            const res = await fetch('http://192.168.1.37:5000/restaurants');
            const data = await res.json();
            setRestaurants(data);
        } catch (err) {
            Alert.alert('Error', 'Could not load restaurants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    // Add or Save Edit
    const saveRestaurant = async () => {
        if (!name || !location || !description) {
            Alert.alert('All fields are required');
            return;
        }
        const url = editingId
            ? `http://192.168.1.37:5000/restaurants/${editingId}`
            : 'http://192.168.1.37:5000/restaurants';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, location, description }),
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert('Success', data.message);
                setName('');
                setLocation('');
                setDescription('');
                setEditingId(null);
                fetchList();
            } else {
                Alert.alert('Error', data.error || 'Operation failed');
            }
        } catch {
            Alert.alert('Error', 'Server error');
        }
    };

    // Delete
    const deleteRestaurant = (id: number) => {
        Alert.alert('Confirm Delete', 'Delete this restaurant?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const res = await fetch(`http://192.168.1.37:5000/restaurants/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await res.json();
                        if (res.ok) {
                            Alert.alert('Deleted', data.message);
                            setRestaurants(prev => prev.filter(r => r.restaurant_id !== id));
                        } else {
                            Alert.alert('Error', data.error || 'Delete failed');
                        }
                    } catch {
                        Alert.alert('Error', 'Server error');
                    }
                },
            },
        ]);
    };

    // Start editing
    const startEdit = (r: Restaurant) => {
        setEditingId(r.restaurant_id);
        setName(r.name);
        setLocation(r.location);
        setDescription(r.description);
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 50 }} />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.screen}
        >
            <Text style={styles.header}>
                {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor="#666"
                value={location}
                onChangeText={setLocation}
            />
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveRestaurant}>
                <Text style={styles.btnTxt}>
                    {editingId ? 'Save Changes' : 'Add Restaurant'}
                </Text>
            </TouchableOpacity>

            <FlatList
                data={restaurants}
                keyExtractor={item => item.restaurant_id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                        <Text style={styles.desc}>{item.description}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => startEdit(item)}
                            >
                                <Text style={styles.actionTxt}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.delBtn}
                                onPress={() => deleteRestaurant(item.restaurant_id)}
                            >
                                <Text style={styles.actionTxt}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: LIGHT_PURPLE, padding: 16 },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: PURPLE,
        textAlign: 'center',
        marginVertical: 12,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: PURPLE,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
        color: '#333',
    },
    saveBtn: {
        backgroundColor: PURPLE,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
    },
    btnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 3,
    },
    name: { fontSize: 18, fontWeight: '700', color: PURPLE },
    location: { fontSize: 14, color: '#555', marginVertical: 4 },
    desc: { fontSize: 13, color: '#444' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    editBtn: {
        backgroundColor: LIGHT_PURPLE,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    delBtn: {
        backgroundColor: '#cc0000',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionTxt: { color: '#fff', fontWeight: '600' },
});
