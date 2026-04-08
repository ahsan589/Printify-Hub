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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';

const { width, height } = Dimensions.get('window');

const LOGGER = {
  info: (message, data = {}) => console.log(`[LOGIN INFO] ${message}`, data),
  error: (message, error = {}) => console.error(`[LOGIN ERROR] ${message}`, error),
  success: (message, data = {}) => console.log(`[LOGIN SUCCESS] ${message}`, data),
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Animations
  const emailLabelAnim = useRef(new Animated.Value(email ? 1 : 0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(password ? 1 : 0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Floating label animations - FIXED
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

  // Logo floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill email and password');
      return;
    }

    setLoading(true);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      LOGGER.success('User logged in', { email });
    } catch (error) {
      Alert.alert('Login Error', getErrorMessage(error.code));
      LOGGER.error('Login failed', { code: error.code, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/user-disabled': return 'Account disabled.';
      case 'auth/user-not-found': return 'No account found.';
      case 'auth/wrong-password': return 'Incorrect password.';
      default: return 'Login failed. Please try again.';
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
              <Text style={styles.logoSubtitle}>Printing Press Dashboard</Text>
            </Animated.View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.formContainer}>
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

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
{loading ? (
                    <ActivityIndicator size="large" color="#3b6797" />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}

                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                style={styles.link} 
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>
                  New to PressMaster? <Text style={styles.linkHighlight}>Create Account</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.demoHint}>
                <Text style={styles.demoText}>Demo: demo@press.com / password123</Text>
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
    marginBottom: 15 
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
    marginBottom: 22,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 8,
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
    marginTop: 8,
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
  demoHint: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.3)',
  },
  demoText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 12, 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
  },
});

export default LoginScreen;