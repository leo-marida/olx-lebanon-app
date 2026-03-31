import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity } from 'react-native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SearchResultsScreen } from '../screens/SearchResults/SearchResultsScreen';
import { FiltersScreen } from '../screens/Filters/FiltersScreen';
import { Colors, Spacing } from '../theme';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabIcon = ({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 22 }}>{emoji}</Text>
    <Text
      style={{
        fontSize: 9,
        marginTop: 2,
        color: focused ? Colors.primary : Colors.textTertiary,
        fontWeight: focused ? '600' : '400',
      }}>
      {label}
    </Text>
  </View>
);

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          backgroundColor: Colors.surface,
        },
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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" label="CHATS" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SellTab"
        component={HomeScreen}
        options={{
          tabBarIcon: () => (
            <View
              style={{
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
              }}>
              <Text style={{ fontSize: 28, color: Colors.white, lineHeight: 32 }}>
                +
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyAdsTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="MY ADS" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="ACCOUNT" focused={focused} />
          ),
        }}
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