import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SearchResultsScreen } from '../screens/SearchResults/SearchResultsScreen';
import { FiltersScreen } from '../screens/Filters/FiltersScreen';
import { Colors, Spacing } from '../theme';
import { RootStackParamList } from './types';
import { AccountScreen } from '../screens/Account/AccountScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// ─── Placeholder screens for tabs ────────────────────────────────────────────
const ChatsScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderEmoji}>💬</Text>
    <Text style={styles.placeholderText}>Chats</Text>
    <Text style={styles.placeholderSub}>Your conversations will appear here</Text>
  </View>
);

const SellScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderEmoji}>📸</Text>
    <Text style={styles.placeholderText}>Post an Ad</Text>
    <Text style={styles.placeholderSub}>Take photos and post your item for sale</Text>
  </View>
);

const MyAdsScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderEmoji}>📋</Text>
    <Text style={styles.placeholderText}>My Ads</Text>
    <Text style={styles.placeholderSub}>Your posted ads will appear here</Text>
  </View>
);

<Tab.Screen
  name="AccountTab"
  component={AccountScreen}
  options={{
    tabBarIcon: ({ focused }) => (
      <TabIcon emoji="👤" label="ACCOUNT" focused={focused} />
    ),
  }}
/>

// ─── Tab Icon ─────────────────────────────────────────────────────────────────
const TabIcon = ({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) => (
  <View style={styles.tabIcon}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text
      style={[
        styles.tabLabel,
        { color: focused ? Colors.primary : Colors.textTertiary },
      ]}>
      {label}
    </Text>
  </View>
);

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="HOME" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" label="CHATS" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SellTab"
        component={SellScreen}
        options={{
          tabBarIcon: () => (
            <View style={styles.sellButton}>
              <Text style={styles.sellButtonText}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyAdsTab"
        component={MyAdsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="MY ADS" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="ACCOUNT" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ─── Main Navigator ───────────────────────────────────────────────────────────
export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Filters"
        component={FiltersScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
  sellButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sellButtonText: {
    fontSize: 30,
    color: Colors.white,
    lineHeight: 34,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholderSub: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});