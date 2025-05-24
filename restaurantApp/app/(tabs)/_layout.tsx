import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator, Screen } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function Layout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#6933ff',
        tabBarInactiveTintColor: '#6b6b6b',
        tabBarIndicatorStyle: {
          backgroundColor: '#6933ff',
        },
      }}
    >
      <TopTabs.Screen name="index" options={{ title: 'Home' }} />
      <TopTabs.Screen name="restaurants" options={{ title: 'Restaurants' }} />
      <TopTabs.Screen name="reservation" options={{ title: 'Reservations' }} />
      <TopTabs.Screen name="profile" options={{ title: 'Profile' }} />
      <TopTabs.Screen name="login" options={{ title: 'Login' }} />
      <TopTabs.Screen name="signup" options={{ title: 'Signup' }} />
    </TopTabs>
  );
}
