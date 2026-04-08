import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuDrawer from './MenuDrawer';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const HeaderMenu = ({ scene }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Typing animation states
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Printing Press";
  const typingSpeed = 150; // milliseconds per character
  const pauseDuration = 2000; // pause before restarting
  const cursorBlinkSpeed = 500;

  useEffect(() => {
    let typingTimeout;
    let cursorInterval;

    const typeText = (index = 0) => {
      if (index < fullText.length) {
        setDisplayText(fullText.substring(0, index + 1));
        typingTimeout = setTimeout(() => typeText(index + 1), typingSpeed);
      } else {
        // Typing complete, pause then restart
        setIsTyping(false);
        typingTimeout = setTimeout(() => {
          setDisplayText('');
          setIsTyping(true);
          typeText(0);
        }, pauseDuration);
      }
    };

    if (isTyping) {
      typeText();
    }

    // Blinking cursor effect
    cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);

    return () => {
      clearTimeout(typingTimeout);
      clearInterval(cursorInterval);
    };
  }, [isTyping]);

  const handleMenuItemSelect = (item) => {
    // Navigate to the respective screen based on the item
    navigation.navigate(item.screen);
  };

  return (
    <>
      <LinearGradient 
        colors={['#14213d', '#20345f']} 
        style={[
          styles.header,
          { paddingTop: insets.top }
        ]}
      >
        <View style={styles.headerContent}>
          {/* Menu Button */}
          <TouchableOpacity 
            style={styles.menuBtn} 
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={26} color="white" />
          </TouchableOpacity>

          {/* Animated App Name */}
          <View style={styles.appNameContainer}>
            <View style={styles.typingContainer}>
              <Text style={styles.appName}>
                {displayText}
                <Text style={styles.cursor}>
                  {showCursor ? '|' : ' '}
                </Text>
              </Text>
            </View>
            <Text style={styles.tagline}>Premium Quality Prints</Text>
          </View>

          {/* Cart Icon */}
         <View style={styles.avatar}>
                <Ionicons name="print-outline" size={40} color="#00bfff" />
              </View>
        </View>
      </LinearGradient>
      <MenuDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onSelect={handleMenuItemSelect}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 70,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  appNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  cursor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00bfff',
  },
  tagline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  cartBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default HeaderMenu;