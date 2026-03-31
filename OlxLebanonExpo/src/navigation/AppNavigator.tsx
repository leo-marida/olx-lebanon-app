import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SearchResultsScreen } from '../screens/SearchResults/SearchResultsScreen';
import { FiltersScreen } from '../screens/Filters/FiltersScreen';
import { Colors } from '../theme';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, emoji }: { label: string; emoji: string }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={{ fontSize: 10, color: Colors.textTertiary }}>{label}</Text>
  </View>
);

const HomeTabs = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          backgroundColor: Colors.surface,
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarIcon: () => <TabIcon label="HOME" emoji="🏠" /> }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={HomeScreen}
        options={{ tabBarIcon: () => <TabIcon label="CHATS" emoji="💬" /> }}
      />
      <Tab.Screen
        name="SellTab"
        component={HomeScreen}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 28,
                width: 56,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
              <Text style={{ fontSize: 28, color: Colors.white }}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyAdsTab"
        component={HomeScreen}
        options={{ tabBarIcon: () => <TabIcon label="MY ADS" emoji="📋" /> }}
      />
      <Tab.Screen
        name="AccountTab"
        component={HomeScreen}
        options={{ tabBarIcon: () => <TabIcon label="ACCOUNT" emoji="👤" /> }}
      />
    </Tab.Navigator>
  );
};

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