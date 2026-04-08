import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import CategoriesScreen from './CategoriesScreen';
import CategoriesDetailScreen from './CategoriesDetailScreen';
import ProductDetailsScreen from './ProductDetailsScreen';

const Stack = createNativeStackNavigator();

const CustomHeaderLeft = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity 
      style={{ marginLeft: 10 }} 
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Ionicons name="arrow-back" size={24} color="#0b2343" />
    </TouchableOpacity>
  );
};

const CategoriesStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <Stack.Screen name="CategoriesDetail" component={CategoriesDetailScreen}/>
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
};

export default CategoriesStack;