import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SimpleSplashScreen from './SimpleSplashScreen';
import AuthStack from './screens/AuthStack';
import TabNavigator from './screens/TabNavigator';
import { AuthProvider, useAuth } from './AuthContext';

// Import all your screens
import AboutScreen from './screens/AboutScreen';
import SupportScreen from './screens/SupportScreen';
import WeddingSpecialScreen from './screens/WeddingSpecialScreen';
import ClothPackagingScreen from './screens/ClothPackagingScreen';
import StickerScreen from './screens/StickerScreen';
import CorporateGiveawaysScreen from './screens/CorporateGiveawaysScreen';
import LabelsTagsScreen from './screens/LabelsTagsScreen';
import PackagingScreen from './screens/PackagingScreen';
import HowToOrderScreen from './screens/HowToOrderScreen';
import DashboardScreen from './screens/DashboardScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import BundleScreen from './screens/BundleScreen';
const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SimpleSplashScreen />;
  }

  if (!user) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About Us' }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ title: 'Support' }}
      />
      <Stack.Screen 
        name="WeddingSpecial" 
        component={WeddingSpecialScreen} 
        options={{ title: 'Wedding Special' }}
      />
      <Stack.Screen 
        name="ClothPackaging" 
        component={ClothPackagingScreen} 
        options={{ title: 'Cloth Packaging' }}
      />
      <Stack.Screen 
        name="Sticker" 
        component={StickerScreen} 
        options={{ title: 'Sticker' }}
      />
      <Stack.Screen 
        name="CorporateGiveaways" 
        component={CorporateGiveawaysScreen} 
        options={{ title: 'Corporate Giveaways' }}
      />
      <Stack.Screen 
        name="LabelsTags" 
        component={LabelsTagsScreen} 
        options={{ title: 'Labels & Tags' }}
      />
      <Stack.Screen 
        name="HowToOrder" 
        component={HowToOrderScreen} 
        options={{ title: 'How to Order' }}
      />
      <Stack.Screen 
        name="Packaging" 
        component={PackagingScreen} 
        options={{ title: 'Packaging' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="Bundle"
        component={BundleScreen}
        options={{ title: 'Bundles' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" backgroundColor="#1a1a1a" translucent />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}