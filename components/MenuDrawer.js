import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import LottieView from 'lottie-react-native';

const { height: screenHeight } = Dimensions.get('window');

const menuItems = [
  { id: 'about', name: 'About', type: 'page', icon: 'information-circle-outline', screen: 'About' },
  { id: 'how-to-order', name: 'How to Order', type: 'page', icon: 'help-circle-outline', screen: 'HowToOrder' },
  { id: 'support', name: 'Support', type: 'page', icon: 'headset-outline', screen: 'Support' },
  { id: 'wedding-special', name: 'Wedding Special', type: 'category', icon: 'heart-outline', screen: 'WeddingSpecial' },
  { id: 'cloth-packaging', name: 'Cloth Packaging', type: 'category', icon: 'shirt-outline', screen: 'ClothPackaging' },
  { id: 'sticker', name: 'Sticker', type: 'category', icon: 'pricetag-outline', screen: 'Sticker' },
  { id: 'corporate-giveaways', name: 'Corporate Giveaways', type: 'category', icon: 'business-outline', screen: 'CorporateGiveaways' },
  { id: 'labels-tags', name: 'Labels & Tags', type: 'category', icon: 'pricetags-outline', screen: 'LabelsTags' },
  { id: 'packaging', name: 'Packaging', type: 'category', icon: 'cube-outline', screen: 'Packaging' },
];

const MenuDrawer = ({ visible, onClose, onSelect }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      // Play animation when drawer opens
      animationRef.current.play();
    } else if (animationRef.current) {
      // Reset animation when drawer closes
      animationRef.current.reset();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.drawer}>
          <LinearGradient 
            colors={['#14213d', '#20345f']} 
            style={styles.drawerHeader}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <LottieView
                  ref={animationRef}
                  source={require('../assets/lottie/hel.json')}
                  style={styles.lottieAnimation}
                  autoPlay={true}
                  loop={true}
                  speed={1}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>Printing Press</Text>
              <Text style={styles.tagline}>Premium Quality Prints</Text>
            </View>
          </LinearGradient>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerContent}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={20} color="#00bfff" />
                  </View>
                  <Text style={styles.menuItemText}>{item.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#4a5568" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  drawer: {
    height: screenHeight * 0.7,
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeBtn: {
    padding: 8,
  },
  userInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  drawerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: '#1a1a2e',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,191,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e2e8f0',
  },
});

export default MenuDrawer;