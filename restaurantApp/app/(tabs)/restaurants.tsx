import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Alert, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Restaurant {
  restaurant_id: number;
  name: string;
  location: string;
  description: string;
}

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /* state for adding */
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newDesc, setNewDesc] = useState('');

  /* --- load token / role --- */
  useEffect(() => {
    (async () => {
      setToken(await AsyncStorage.getItem('token'));
      setRole(await AsyncStorage.getItem('role'));
    })();
  }, []);

  /* --- fetch list --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://192.168.1.37:5000/restaurants');
        setRestaurants(await res.json());
      } catch {
        Alert.alert('Error loading restaurants');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* --- delete (admin) --- */
  const deleteRestaurant = (id: number) => {
    Alert.alert('Delete?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await fetch(
              `http://192.168.1.37:5000/restaurants/${id}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (r.ok) {
              setRestaurants(prev => prev.filter(x => x.restaurant_id !== id));
            } else {
              const e = await r.json();
              Alert.alert(e.error || 'Delete failed');
            }
          } catch {
            Alert.alert('Server error');
          }
        },
      },
    ]);
  };

  /* --- add (admin) --- */
  const addRestaurant = async () => {
    if (!newName || !newLoc || !newDesc) {
      Alert.alert('Fill all fields');
      return;
    }
    try {
      const r = await fetch('http://192.168.1.37:5000/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          location: newLoc,
          description: newDesc,
        }),
      });
      const data = await r.json();
      if (r.ok) {
        setRestaurants(prev => [
          ...prev,
          { restaurant_id: data.id || Date.now(), name: newName, location: newLoc, description: newDesc },
        ]);
        setShowAdd(false);
        setNewName('');
        setNewLoc('');
        setNewDesc('');
      } else {
        Alert.alert(data.error || 'Add failed');
      }
    } catch {
      Alert.alert('Server error');
    }
  };

  /* --- list --- */
  const list = restaurants.filter(r =>
    (r.name + r.location).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Restaurants</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name or location"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* --- Add button --- */}
      {role === 'admin' && !showAdd && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addTxt}>+ Add Restaurant</Text>
        </TouchableOpacity>
      )}

      {/* --- Add form --- */}
      {showAdd && (
        <View style={styles.card}>
          <Text style={[styles.name, { marginBottom: 10 }]}>New Restaurant</Text>
          <TextInput
            placeholder="Name"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            value={newLoc}
            onChangeText={setNewLoc}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={newDesc}
            onChangeText={setNewDesc}
            style={styles.input}
            multiline
          />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={[styles.formBtn, { backgroundColor: '#777' }]} onPress={() => setShowAdd(false)}>
              <Text style={styles.formTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formBtn, { marginLeft: 10 }]} onPress={addRestaurant}>
              <Text style={styles.formTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={i => i.restaurant_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.desc}>{item.description}</Text>

            {role === 'admin' && (
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => deleteRestaurant(item.restaurant_id)}
              >
                <Text style={styles.delTxt}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

/* --- Styles --- */
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
  search: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 18,
    color: '#333',
  },
  addBtn: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addTxt: { color: '#fff', fontWeight: '700' },

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
  location: { fontSize: 14, color: '#666', marginBottom: 4 },
  desc: { color: '#444' },

  delBtn: {
    backgroundColor: '#cc0000',
    alignSelf: 'flex-end',
    marginTop: 14,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  delTxt: { color: '#fff', fontWeight: '700' },

  /* add form */
  input: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
  formBtn: {
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  formTxt: { color: '#fff', fontWeight: '700' },
});
