import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { StyleSheet } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = 'dg5fojcpg';
const CLOUDINARY_UPLOAD_PRESET = 'app_uploads';

const uploadToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('file', blob, `profile_${Date.now()}.jpg`);
    } else {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('file', {
        uri: imageUri,
        name: `profile_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });
    }
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'profiles');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
    
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Premium Toast Component
const PremiumToast = ({ visible, message, type, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-20));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }),
      ]).start();
      
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getColors = () => {
    switch (type) {
      case 'success': return ['#10b981', '#059669'];
      case 'error': return ['#ef4444', '#dc2626'];
      case 'warning': return ['#f59e0b', '#d97706'];
      default: return ['#3b82f6', '#2563eb'];
    }
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.toastContainer,
        { opacity: fadeAnim, transform: [{ translateY }] }
      ]}
    >
      <LinearGradient colors={getColors()} style={styles.toastGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Ionicons 
          name={type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle'} 
          size={22} 
          color="white" 
        />
        <Text style={styles.toastMessage}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Premium Dialog Component
const PremiumDialog = ({ visible, title, message, onClose, onConfirm, type = 'info' }) => {
  const getIconColor = (type) => ({
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  }[type] || '#3b82f6');

  const getIconName = (type) => ({
    success: 'checkmark-circle',
    error: 'alert-circle',
    warning: 'warning',
    info: 'information-circle',
  }[type] || 'information-circle');

  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.dialogOverlay}>
        <Animated.View style={[styles.dialog, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={[getIconColor(type) + '15', getIconColor(type) + '05']} style={styles.dialogGradient}>
            <View style={[styles.dialogIcon, { backgroundColor: getIconColor(type) + '20' }]}>
              <Ionicons name={getIconName(type)} size={52} color={getIconColor(type)} />
            </View>
            <Text style={styles.dialogTitle}>{title}</Text>
            <Text style={styles.dialogMessage}>{message}</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity style={styles.dialogButtonSecondary} onPress={onClose}>
                <Text style={styles.dialogButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              {onConfirm && (
                <TouchableOpacity style={[styles.dialogButtonPrimary, { backgroundColor: getIconColor(type) }]} onPress={onConfirm}>
                  <Text style={styles.dialogButtonTextPrimary}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Premium Input Field
const PremiumInput = ({ label, value, onChangeText, onBlur, placeholder, icon, editable = true, keyboardType = 'default' }) => (
  <View style={styles.premiumInputContainer}>
    <View style={styles.inputHeader}>
      <Ionicons name={icon} size={18} color="#6b7280" />
      <Text style={styles.inputLabel}>{label}</Text>
    </View>
    {editable ? (
      <TextInput
        style={styles.premiumInput}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
      />
    ) : (
      <View style={styles.readonlyValue}>
        <Text style={styles.readonlyText}>{value || 'Not provided'}</Text>
      </View>
    )}
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    photoURL: null,
    bio: '',
    location: '',
  });
  const [tempPhotoURL, setTempPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [dialog, setDialog] = useState({ visible: false, type: 'info', title: '', message: '' });
  const scrollY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || '',
          phone: data.phone || '',
          photoURL: data.photoURL || null,
          bio: data.bio || '',
          location: data.location || '',
        });
      }
    } catch (error) {
      console.error('Profile load error:', error);
      showToast('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ visible: true, message, type });
  };

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ visible: true, type, title, message, onConfirm });
  };

  const hideDialog = () => setDialog({ ...dialog, visible: false });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showDialog('warning', 'Permission Needed', 'Please enable photo library access to change your profile picture');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.[0]) {
      await handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(uri);
      setTempPhotoURL(url);
      // Auto-save image immediately
      await saveSingleField('photoURL', url);
      showToast('success', 'Profile picture updated!');
    } catch (error) {
      showToast('error', error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveSingleField = async (field, value) => {
    setSavingField(field);
    try {
      const updates = {
        [field]: value,
        updatedAt: new Date(),
      };
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      
      if (field === 'photoURL') {
        setProfile(prev => ({ ...prev, photoURL: value }));
        setTempPhotoURL(null);
      } else {
        setProfile(prev => ({ ...prev, [field]: value }));
      }
      
      return true;
    } catch (error) {
      showToast('error', `Failed to save ${field}`);
      return false;
    } finally {
      setSavingField(null);
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!value.trim() && field !== 'bio' && field !== 'location') {
      showToast('warning', `${field} cannot be empty`);
      return;
    }
    await saveSingleField(field, value);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to leave?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              showToast('error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.loadingGradient}>
          <LottieView 
                  source={require('../assets/lottie/progress.json')} 
                  style={{width: 220, height: 220}} 
                  autoPlay 
                  loop 
                  colorFilters={[{
                    keypath: '**',
                    color: '#3b6797'
                  }]}
                />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.headerGradient}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* Hero Section */}
        <Animated.View style={{ transform: [{ scale: headerScale }] }}>
          <LinearGradient colors={['#0f172a', '#1e3a5f', '#3b82f6']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
              <Image 
                source={{ uri: tempPhotoURL || profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=3b82f6&color=fff&size=140&rounded=true&bold=true&length=2` }}
                style={styles.avatar}
              />
              <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} style={styles.avatarOverlay} />
              <View style={styles.cameraIcon}>
{uploading ? (
                 <LottieView 
                         source={require('../assets/lottie/progress.json')} 
                         style={{width: 220, height: 220}} 
                         autoPlay 
                         loop 
                         colorFilters={[{
                           keypath: '**',
                           color: '#3b6797'
                         }]}
                       />
                ) : (
                  <Ionicons name="camera" size={24} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
            
            <Text style={styles.heroTitle}>{profile.name || 'Add Your Name'}</Text>
            <View style={styles.emailBadge}>
              <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroSubtitle}>{user?.email}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={22} color="#3b82f6" />
            <Text style={styles.statValue}>Member</Text>
            <Text style={styles.statLabel}>Since 2024</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-outline" size={22} color="#10b981" />
            <Text style={styles.statValue}>Verified</Text>
            <Text style={styles.statLabel}>Account</Text>
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.cardHeaderIcon}>
              <Ionicons name="person-outline" size={20} color="white" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <PremiumInput
            label="Full Name"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            onBlur={() => handleFieldUpdate('name', profile.name)}
            placeholder="Enter your full name"
            icon="person-outline"
          />

          <PremiumInput
            label="Email Address"
            value={user?.email}
            icon="mail-outline"
            editable={false}
          />

          <PremiumInput
            label="Phone Number"
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            onBlur={() => handleFieldUpdate('phone', profile.phone)}
            placeholder="Enter your phone number"
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <PremiumInput
            label="Location"
            value={profile.location}
            onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
            onBlur={() => handleFieldUpdate('location', profile.location)}
            placeholder="City, Country"
            icon="location-outline"
          />

          <View style={styles.bioContainer}>
            <View style={styles.inputHeader}>
              <Ionicons name="text-outline" size={18} color="#6b7280" />
              <Text style={styles.inputLabel}>Bio</Text>
            </View>
            <TextInput
              style={styles.bioInput}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              onBlur={() => handleFieldUpdate('bio', profile.bio)}
              placeholder="Tell us a little about yourself..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient colors={['#fef2f2', '#fee2e2']} style={styles.logoutGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Saving Indicator */}
      {savingField && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

      <PremiumToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <PremiumDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onClose={hideDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  hero: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 65,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 28,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 20,
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  premiumInputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  premiumInput: {
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontWeight: '500',
  },
  readonlyValue: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  readonlyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  bioContainer: {
    marginTop: 4,
  },
  bioInput: {
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  bottomSpacer: {
    height: 30,
  },
  savingIndicator: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  savingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastMessage: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 32,
    overflow: 'hidden',
  },
  dialogGradient: {
    alignItems: 'center',
    padding: 28,
  },
  dialogIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dialogButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  dialogButtonSecondary: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  dialogButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  dialogButtonTextSecondary: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});