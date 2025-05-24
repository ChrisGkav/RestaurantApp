import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, } from 'react-native';
import { useRouter } from 'expo-router';

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';
const { width } = Dimensions.get('window');
const CARD_W = width * 0.9;

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const res = await fetch('http://192.168.1.37:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Register Successful!', data.message);
        router.replace('/login');
      } else {
        Alert.alert('Register Failed', data.error || 'Something went wrong.');
      }
    } catch (err) {
      Alert.alert('Connection error', 'Cannot connect with the server.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>📝 Sign Up</Text>

        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#888"
        />

        <Text style={styles.roleLabel}>Select Role</Text>
        <View style={styles.roleRow}>
          {(['user', 'admin'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleBtn,
                role === r && styles.roleSelected,
              ]}
              onPress={() => setRole(r)}
            >
              <Text
                style={[
                  styles.roleText,
                  role === r && styles.roleTextSelected,
                ]}
              >
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSignup}>
          <Text style={styles.submitText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ece9ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: PURPLE,
    alignSelf: 'center',
    marginBottom: 22,
  },
  input: {
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
    alignSelf: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
  },
  roleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PURPLE,
    marginHorizontal: 8,
  },
  roleSelected: {
    backgroundColor: PURPLE,
  },
  roleText: {
    color: PURPLE,
    fontWeight: '600',
  },
  roleTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
