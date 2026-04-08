import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';

const { width, height } = Dimensions.get('window');

const LOGGER = {
  info: (message, data) => console.log(`[REGISTER INFO] ${message}`, data),
  error: (message, error) => console.error(`[REGISTER ERROR] ${message}`, error),
  success: (message, data) => console.log(`[REGISTER SUCCESS] ${message}`, data),
};

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Animations
  const fullNameLabelAnim = useRef(new Animated.Value(fullName ? 1 : 0)).current;
  const emailLabelAnim = useRef(new Animated.Value(email ? 1 : 0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(password ? 1 : 0)).current;
  const confirmPasswordLabelAnim = useRef(new Animated.Value(confirmPassword ? 1 : 0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Floating label animations - FIXED
  useEffect(() => {
    Animated.timing(fullNameLabelAnim, {
      toValue: (fullNameFocused || fullName) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [fullNameFocused, fullName]);

  useEffect(() => {
    Animated.timing(emailLabelAnim, {
      toValue: (emailFocused || email) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [emailFocused, email]);

  useEffect(() => {
    Animated.timing(passwordLabelAnim, {
      toValue: (passwordFocused || password) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [passwordFocused, password]);

  useEffect(() => {
    Animated.timing(confirmPasswordLabelAnim, {
      toValue: (confirmPasswordFocused || confirmPassword) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [confirmPasswordFocused, confirmPassword]);

  // Logo floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { 
          toValue: 1, 
          duration: 2000, 
          easing: Easing.inOut(Easing.sin), 
          useNativeDriver: true 
        }),
        Animated.timing(floatAnim, { 
          toValue: 0, 
          duration: 2000, 
          easing: Easing.inOut(Easing.sin), 
          useNativeDriver: true 
        }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [0, -12] 
  });

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      LOGGER.success('User registered', { email, fullName });
    } catch (error) {
      let msg = 'Registration failed.';
      if (error.code === 'auth/email-already-in-use') msg = 'Email already registered. Please login.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') msg = 'Password too weak. Use at least 6 characters.';
      Alert.alert('Registration Error', msg);
      LOGGER.error('Registration failed', { code: error.code, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigation.navigate('Main');
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient 
        colors={['#0f172a', '#1e293b', '#0f172a']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingTop: insets.top || 20, paddingBottom: insets.bottom || 20 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View style={[styles.logoContainer, { transform: [{ translateY: floatY }] }]}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>🖨️</Text>
              </View>
              <Text style={styles.logoTitle}>PressMaster</Text>
              <Text style={styles.logoSubtitle}>Create Your Account</Text>
            </Animated.View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Get Started</Text>
              <Text style={styles.welcomeSubtitle}>Join PressMaster today</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Full Name Field - FIXED */}
              <View style={[styles.inputWrapper, fullNameFocused && styles.inputWrapperFocused]}>
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: fullNameLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, -8],
                      }),
                      fontSize: fullNameLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 12],
                      }),
                      color: fullNameLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255,255,255,0.6)', fullNameFocused ? '#00bfff' : 'rgba(255,255,255,0.6)'],
                      }),
                    },
                  ]}
                >
                  Full Name
                </Animated.Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFullNameFocused(true)}
                  onBlur={() => setFullNameFocused(false)}
                  placeholderTextColor="transparent"
                />
              </View>

              {/* Email Field - FIXED */}
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: emailLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, -8],
                      }),
                      fontSize: emailLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 12],
                      }),
                      color: emailLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255,255,255,0.6)', emailFocused ? '#00bfff' : 'rgba(255,255,255,0.6)'],
                      }),
                    },
                  ]}
                >
                  Email Address
                </Animated.Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="transparent"
                />
              </View>

              {/* Password Field - FIXED */}
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: passwordLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, -8],
                      }),
                      fontSize: passwordLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 12],
                      }),
                      color: passwordLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255,255,255,0.6)', passwordFocused ? '#00bfff' : 'rgba(255,255,255,0.6)'],
                      }),
                    },
                  ]}
                >
                  Password
                </Animated.Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry
                  placeholderTextColor="transparent"
                />
              </View>

              {/* Confirm Password Field - FIXED */}
              <View style={[styles.inputWrapper, confirmPasswordFocused && styles.inputWrapperFocused]}>
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: confirmPasswordLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, -8],
                      }),
                      fontSize: confirmPasswordLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 12],
                      }),
                      color: confirmPasswordLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255,255,255,0.6)', confirmPasswordFocused ? '#00bfff' : 'rgba(255,255,255,0.6)'],
                      }),
                    },
                  ]}
                >
                  Confirm Password
                </Animated.Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  secureTextEntry
                  placeholderTextColor="transparent"
                />
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
{loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}

                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                style={styles.link} 
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.infoNote}>
                <Text style={styles.infoText}>
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#0f172a' 
  },
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: width > 600 ? 80 : 24,
    paddingVertical: 20,
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 10 
  },
  logoCircle: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.09,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(0, 191, 255, 0.3)',
    shadowColor: '#00bfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: { 
    fontSize: width * 0.08 
  },
  logoTitle: { 
    fontSize: width > 600 ? 32 : 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    letterSpacing: 1,
    marginBottom: 4,
  },
  logoSubtitle: { 
    fontSize: width > 600 ? 14 : 12, 
    color: '#00bfff', 
    marginTop: 4, 
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  welcomeContainer: { 
    alignItems: 'center', 
    marginBottom: 10 
  },
  welcomeTitle: { 
    fontSize: width > 600 ? 34 : 28, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: { 
    fontSize: width > 600 ? 16 : 14, 
    color: 'rgba(255,255,255,0.7)',
  },
  formContainer: { 
    width: '100%' 
  },
  inputWrapper: { 
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    paddingTop: 4,
    paddingBottom: 4,
  },
  inputWrapperFocused: {
    borderBottomColor: '#00bfff',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
    color: '#fff',
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#00bfff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#00bfff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { 
    backgroundColor: '#2a6b8a', 
    opacity: 0.7 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
  link: { 
    alignItems: 'center', 
    marginTop: 8 
  },
  linkText: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: width > 600 ? 15 : 14 
  },
  linkHighlight: { 
    color: '#00bfff', 
    fontWeight: 'bold' 
  },
  infoNote: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoText: { 
    color: 'rgba(255,255,255,0.5)', 
    fontSize: 11, 
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RegisterScreen;