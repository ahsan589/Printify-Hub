import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
  Platform, 
  TouchableOpacity, 
  Animated, 
  View, 
  Dimensions, 
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CategoriesStack from './CategoriesStack';
import DashboardScreen from './DashboardScreen';
import BundleScreen from './BundleScreen';
import ProfileScreen from './ProfileScreen';
import GalleryScreen from './GalleryScreen';
import HeaderMenu from '../components/HeaderMenu';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const TabBarButton = ({ children, onPress, accessibilityState }) => {
  const isFocused = accessibilityState?.selected;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1.1, friction: 4, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.6, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 0, friction: 4, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, friction: 5, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={onPress}
      style={styles.tabButton}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.glowCircle,
            {
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {children}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;

  const animateSlider = (index) => {
    Animated.spring(scrollX, {
      toValue: index * TAB_WIDTH,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Categories') iconName = focused ? 'layers' : 'layers-outline';
            else if (route.name === 'Bundle') iconName = focused ? 'git-branch' : 'git-branch-outline';
            else if (route.name === 'Gallery') iconName = focused ? 'images' : 'images-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#0f172a',
            borderTopWidth: 0,
            height: 50 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 10,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 1,
          },
          tabBarButton: (props) => {
            const index = ['Dashboard', 'Categories', 'Bundle', 'Gallery', 'Profile'].indexOf(route.name);
            return (
              <TabBarButton
                {...props}
                onPress={() => {
                  animateSlider(index);
                  props.onPress();
                }}
              />
            );
          },
          headerShown: ['Dashboard', 'Categories', 'Bundle', 'Gallery'].includes(route.name),
          header: (props) => <HeaderMenu {...props} />,
          
          // ✅ WORKING FADE ANIMATION (default ~300ms)
          animation: 'fade',
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Categories" component={CategoriesStack} />
        <Tab.Screen name="Bundle" component={BundleScreen} />
        <Tab.Screen name="Gallery" component={GalleryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <View style={[styles.indicatorContainer, { bottom: 50 + insets.bottom - 3 }]}>
        <Animated.View
          style={[
            styles.indicator,
            { transform: [{ translateX: scrollX }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 0 },
  glowCircle: {
    position: 'absolute',
    width: 46,
    height: 50,
    borderRadius: 23,
    backgroundColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 3.9,
    shadowRadius: 12,
    elevation: 12,
  },
  indicatorContainer: {
    position: 'absolute',
    width: width,
    height: 3,
    zIndex: 100,
  },
  indicator: {
    width: TAB_WIDTH,
    height: 5,
    backgroundColor: '#38bdf8',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default TabNavigator;