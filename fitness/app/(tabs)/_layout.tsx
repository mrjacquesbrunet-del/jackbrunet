import { Tabs } from 'expo-router';
import { CalendarCheck, Dumbbell, TrendingUp, User, UtensilsCrossed } from 'lucide-react-native';

import { useTheme } from '@/src/lib/theme';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Aujourd'hui",
          tabBarIcon: ({ color }) => <CalendarCheck size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="sport"
        options={{
          title: 'Sport',
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color }) => <UtensilsCrossed size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="progression"
        options={{
          title: 'Progression',
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
