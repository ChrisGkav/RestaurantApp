import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';

export default function ReservationScreen() {
  const [date, setDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [people, setPeople] = useState('');
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');

  // Fetch restaurants 
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://192.168.1.37:5000/restaurants');
        const data = await res.json();
        setRestaurants(data);
        if (data.length) setRestaurantId(data[0].restaurant_id.toString());
      } catch {
        Alert.alert('Error loading restaurants');
      }
    })();
  }, []);

  // Load logged-in userId
  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => {
      if (id) setUserId(id);
    });
  }, []);

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);
  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hidePicker();
  };

  const handleReservation = async () => {
    if (!people || !restaurantId) {
      Alert.alert('Please complete all fields.');
      return;
    }
    try {
      const res = await fetch('http://192.168.1.37:5000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          restaurant_id: parseInt(restaurantId, 10),
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0].slice(0, 5),
          people_count: parseInt(people, 10),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Reservation Successful!');
        setPeople('');
      } else {
        Alert.alert('Error', data.error || 'Something went wrong.');
      }
    } catch {
      Alert.alert('Error sending reservation');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>🍷 Make a Reservation</Text>

        <Text style={styles.label}>Restaurant</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={restaurantId}
            onValueChange={value => setRestaurantId(value)}
            style={styles.picker}
            dropdownIconColor={PURPLE}
          >
            {restaurants.map(r => (
              <Picker.Item
                key={r.restaurant_id}
                label={`${r.name} (${r.location})`}
                value={r.restaurant_id.toString()}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={showPicker}>
          <Text style={styles.dateTxt}>{date.toLocaleString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="datetime"
          date={date}
          onConfirm={handleConfirm}
          onCancel={hidePicker}
        />

        <Text style={styles.label}>People</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={people}
          onChangeText={setPeople}
          placeholder="π.χ. 2"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.btn} onPress={handleReservation}>
          <Text style={styles.btnTxt}>RESERVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LIGHT_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PURPLE,
    textAlign: 'center',
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginTop: 14,
    marginBottom: 6,
  },
  pickerWrap: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  dateBtn: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 6,
  },
  dateTxt: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  btn: {
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 2,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
