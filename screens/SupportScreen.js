import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

const supportCards = [
  {
    icon: 'whatsapp',
    title: 'WhatsApp Support',
    text: 'Fastest way to ask about pricing, quantities, turnaround, or custom print options.',
    actionLabel: 'Chat on WhatsApp',
    phoneNumber: '+923101788571',
    featured: true,
  },
  {
    icon: 'map-pin',
    title: 'Visit The Shop',
    text: 'We finalize orders offline at the shop after discussing material, size, finish, and quantity.',
    actionLabel: 'How To Order',
    screen: 'HowToOrder',
  },
  {
    icon: 'package',
    title: 'Browse Products',
    text: 'Use the app to shortlist packaging, cards, stickers, labels, and bundle ideas before visiting.',
    actionLabel: 'Explore Categories',
    screen: 'CategoriesScreen',
  },
];

const faqs = [
  {
    question: 'Can I place my order directly in the app?',
    answer: 'No. The app is for browsing products and collecting ideas. Orders are confirmed offline after visiting the shop and discussing requirements.',
  },
  {
    question: 'What should I bring when visiting for an order?',
    answer: 'Bring your artwork, logo files, measurements, quantity estimate, references, and any sample ideas that help explain the job.',
  },
  {
    question: 'How do I ask for a quote?',
    answer: 'You can start on WhatsApp for initial guidance, then visit the shop so the team can finalize specifications and prepare the quotation.',
  },
  {
    question: 'Do you handle custom sizes and branding?',
    answer: 'Yes. Custom sizes, logos, colors, text, and packaging details are discussed with the team before production starts.',
  },
  {
    question: 'When does production begin?',
    answer: 'Production begins after the order details are confirmed and the quote is approved.',
  },
  {
    question: 'What kind of products can I ask support about?',
    answer: 'Support can guide you on packaging, stickers, labels, tags, office stationery, bundles, wedding print, and other custom print work.',
  },
];

const quickSteps = [
  'Browse the app and shortlist the products you like.',
  'Message support if you need guidance before visiting.',
  'Visit the shop with artwork, logo files, sizes, or sample references.',
  'Confirm your quote, timeline, and customization details.',
];

const SupportScreen = () => {
  const navigation = useNavigation();

  const handleWhatsApp = (phoneNumber, message = '') => {
    const url = `whatsapp://send?phone=${phoneNumber.replace(/[^0-9+]/g, '')}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp not installed', 'Please install WhatsApp to continue.');
    });
  };

  const renderSupportCard = ({ item }) => (
    <TouchableOpacity style={[styles.supportCard, item.featured && styles.featuredCard]}>
      <View style={styles.cardIcon}>
        {item.icon === 'whatsapp' ? (
          <FontAwesome5 name="whatsapp" size={28} color="#25D366" />
        ) : (
          <Feather name={item.icon} size={28} color="#3b6797" />
        )}
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardText}>{item.text}</Text>
        <TouchableOpacity 
          style={styles.supportLink}
          onPress={() => {
            if (item.phoneNumber) {
              handleWhatsApp(item.phoneNumber, 'Hello, I need help with printing.');
            } else if (item.screen === 'CategoriesScreen') {
              navigation.navigate('Categories');
            } else {
              navigation.navigate(item.screen);
            }
          }}
        >
        <Text style={styles.actionLabel}>{item.actionLabel}</Text>
        <Feather name="arrow-right" size={18} color="#3b6797" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFAQ = ({ item }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient colors={['#0b2343', '#17385f']} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <Text style={styles.heroKicker}>Help Center</Text>
              <Text style={styles.heroTitle}>Proper support for quotes, artwork, and print order guidance.</Text>
              <Text style={styles.heroText}>
                Ask about products, bundle options, customization, materials, turnaround, and order preparation.
              </Text>
              <View style={styles.heroActions}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => handleWhatsApp('+923101788571', 'Hello, I need help with printing or packaging.')}
                >
                  <FontAwesome5 name="whatsapp" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>WhatsApp Support</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate('HowToOrderScreen')}
                >
                  <Text style={styles.secondaryButtonText}>How To Order</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.heroPoints}>
                <View style={styles.heroPoint}>
                  <Feather name="clock" size={20} color="#b7d0ea" />
                  <Text style={styles.heroPointText}>Quick pre-order guidance</Text>
                </View>
                <View style={styles.heroPoint}>
                  <Feather name="file-text" size={20} color="#b7d0ea" />
                  <Text style={styles.heroPointText}>Quote after discussion</Text>
                </View>
                <View style={styles.heroPoint}>
                  <Feather name="map-pin" size={20} color="#b7d0ea" />
                  <Text style={styles.heroPointText}>Offline order confirmation</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Support Cards */}
        <View style={styles.section}>
          <FlatList
            data={supportCards}
            renderItem={renderSupportCard}
            keyExtractor={(item) => item.title}
            numColumns={1}
            scrollEnabled={false}
            contentContainerStyle={styles.cardList}
          />
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, styles.faqSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>Frequently Asked Questions</Text>
            <Text style={styles.sectionTitle}>Answers to the questions most customers ask before ordering.</Text>
          </View>
          <FlatList
            data={faqs}
            renderItem={renderFAQ}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.faqList}
          />
        </View>

        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Quick Contact */}
          <View style={[styles.infoCard, styles.quickContact]}>
            <Text style={styles.cardKicker}>Quick Contact</Text>
            <Text style={styles.sidebarTitle}>Need help right now?</Text>
            <Text style={styles.sidebarText}>
              Send your requirement on WhatsApp with product name, quantity, size, and any logo or artwork notes you already have.
            </Text>
            <TouchableOpacity 
              style={[styles.primaryButton, styles.fullButton]}
              onPress={() => handleWhatsApp('+923101788571', 'Hello, I need help with a custom printing job.')}
            >
              <FontAwesome5 name="whatsapp" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Start WhatsApp Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Before Visit */}
          <View style={styles.infoCard}>
            <Text style={styles.cardKicker}>Before You Visit</Text>
            <View style={styles.stepsList}>
              {quickSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Next Step */}
          <View style={[styles.infoCard, styles.darkCard]}>
            <Text style={styles.cardKickerWhite}>Next Step</Text>
            <Text style={styles.sidebarTitleWhite}>Ready to explore the catalog first?</Text>
            <Text style={styles.sidebarTextWhite}>
              Check categories and bundles, shortlist what you like, then come back here if you want help deciding.
            </Text>
            <View style={styles.sidebarActions}>
              <TouchableOpacity 
                style={styles.secondaryButtonLight}
                onPress={() => navigation.navigate('Categories')}
              >
                <Text style={styles.secondaryButtonTextLight}>Browse Categories</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  scrollContainer: {
    flex: 1,
  },
  hero: {
    marginBottom: 24,
  },
  heroGradient: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 32,
  },
  heroKicker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b7d0ea',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    marginBottom: 24,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#0b2343',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  heroPoints: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  heroPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flex: 1,
    minWidth: 140,
  },
  heroPointText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  cardList: {
    gap: 16,
  },
  supportCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredCard: {
    backgroundColor: '#f7fbff',
    borderWidth: 1,
    borderColor: 'rgba(59,103,151,0.1)',
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ebf2fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#60728d',
    lineHeight: 22,
    marginBottom: 16,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b6797',
  },
  faqSection: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    padding: 28,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionKicker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b6797',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b2343',
    lineHeight: 30,
  },
  faqList: {
    gap: 20,
  },
  faqItem: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d8e2ef',
  },
  faqQuestion: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0b2343',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#60728d',
    lineHeight: 22,
  },
  sidebar: {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  quickContact: {
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  cardKicker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b6797',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 12,
  },
  sidebarText: {
    fontSize: 15,
    color: '#60728d',
    lineHeight: 22,
    marginBottom: 20,
  },
  fullButton: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stepsList: {
    gap: 12,
    marginTop: 12,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    backgroundColor: '#ebf2fb',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b2343',
  },
  stepText: {
    fontSize: 15,
    color: '#60728d',
    flex: 1,
    lineHeight: 22,
  },
  darkCard: {
    backgroundColor: '#0b2343',
  },
  cardKickerWhite: {
    color: '#b7d0ea',
  },
  sidebarTitleWhite: {
    color: 'white',
    fontWeight: '700',
  },
  sidebarTextWhite: {
    color: 'rgba(255,255,255,0.85)',
  },
  sidebarActions: {
    gap: 12,
    marginTop: 16,
  },
  secondaryButtonLight: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonTextLight: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SupportScreen;