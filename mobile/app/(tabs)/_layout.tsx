import { Tabs, useRouter } from 'expo-router';
import { Bell, Home, Layers, PlusCircle, User } from 'lucide-react-native';
import { colors } from '@/theme';
import { useUnreadCount } from '@/hooks/useNotifications';

export default function TabsLayout() {
  const router = useRouter();
  const { data: unread = 0 } = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Akış', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Kategoriler', tabBarIcon: ({ color, size }) => <Layers size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Paylaş',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle size={size + 2} color={color} strokeWidth={2.2} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/post/new');
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirim',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.danger,
            color: colors.textOnPrimary,
            fontSize: 10,
            minWidth: 18,
            height: 18,
            lineHeight: 14,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
      />
    </Tabs>
  );
}
