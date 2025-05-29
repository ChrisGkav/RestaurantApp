import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const PURPLE = '#6933ff';
const LIGHT_PURPLE = '#ece9ff';
const { width, height } = Dimensions.get('window');

// Responsive helpers
const wp = (perc: number) => (width * perc) / 100;
const hp = (perc: number) => (height * perc) / 100;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Ensuring status bar is transparent so gradient shows behind */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Allowing status bar gestures by not intercepting touches on gradient */}
      <LinearGradient
        colors={[LIGHT_PURPLE, '#d6d0ff']}
        style={styles.gradient}
        pointerEvents="box-none"
      >
        <View style={styles.card}>
          <Text style={styles.title}>🍽️ Restaurant App</Text>
          <Text style={styles.subtitle}>Reserve · Dine · Enjoy</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.btnTxt}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { marginTop: hp(2) }]}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.btnTxt}>Signup</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_PURPLE,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: wp(90),
    backgroundColor: '#fff',
    borderRadius: wp(5),
    paddingVertical: hp(5),
    paddingHorizontal: wp(6),
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.8) },
    shadowOpacity: 0.14,
    shadowRadius: wp(2),
    // Android elevation
    elevation: 6,
    marginBottom: hp(3),
  },
  title: {
    fontSize: wp(7),
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: PURPLE,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: wp(4.5),
    color: '#6b6b6b',
    marginBottom: hp(4),
    textAlign: 'center',
    lineHeight: hp(3),
  },
  button: {
    backgroundColor: PURPLE,
    borderRadius: wp(4),
    width: wp(80),
    paddingVertical: hp(2),
    alignItems: 'center',
    elevation: 2,
  },
  btnTxt: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: '700',
  },
});
