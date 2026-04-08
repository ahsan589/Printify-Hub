import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const steps = [
  {
    number: '01',
    title: 'Browse Products',
    text: 'Explore categories on the website and shortlist the products, sizes, quantities, or bundle ideas you like.',
    icon: 'package',
  },
  {
    number: '02',
    title: 'Visit The Shop',
    text: 'Orders are not placed online. Please visit our shop so we can discuss materials, finishes, quantity, and customization in person.',
    icon: 'map-pin',
  },
  {
    number: '03',
    title: 'Share Requirements',
    text: 'Bring your artwork, references, logo files, measurements, or sample ideas. Our team will review everything with you at the shop.',
    icon: 'message-square',
  },
  {
    number: '04',
    title: 'Confirm Quote',
    text: 'After finalizing the details, we prepare your quotation, timeline, and production plan before starting the job.',
    icon: 'users',
  },
];

const notes = [
  'Orders are handled offline at the shop.',
  'Website browsing is for product selection and reference only.',
  'Customization is discussed and finalized in person.',
  'Production starts after order confirmation and quote approval.',
];

export default function HowToOrderScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isSmall = width < 600;
  const isMedium = width >= 600 && width < 900;

  // Responsive font sizes
  const heroTitleSize = Math.min(48, width * 0.1);
  const heroTextSize = Math.min(16, width * 0.04);
  const sectionTitleSize = Math.min(36, width * 0.08);
  const cardTitleSize = Math.min(20, width * 0.05);
  const bodyTextSize = Math.min(14, width * 0.035);
  const kickerSize = Math.min(12, width * 0.03);

  // Grid columns: 2 on medium/large, 1 on small
  const stepsColumns = isSmall ? 1 : 2;

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        {/* Hero Section */}
        <View style={[styles.hero, { padding: isSmall ? 20 : 34 }]}>
          <Text style={[styles.heroKicker, { fontSize: kickerSize }]}>Visit Shop To Order</Text>
          <Text style={[styles.heroTitle, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 1.1 }]}>
            How To Order
          </Text>
          <Text style={[styles.heroText, { fontSize: heroTextSize }]}>
            We do not take orders online. Use the website to browse products, then visit the shop to
            place your order, discuss customization, and confirm your quotation.
          </Text>

          <View style={[styles.heroPoints, isSmall && { flexDirection: 'column' }]}>
            <View style={styles.heroPoint}>
              <Feather name="map-pin" size={18} color="#3b6797" />
              <Text style={[styles.heroPointText, { fontSize: bodyTextSize }]}>Shop visit required</Text>
            </View>
            <View style={styles.heroPoint}>
              <Feather name="clock" size={18} color="#3b6797" />
              <Text style={[styles.heroPointText, { fontSize: bodyTextSize }]}>Quotation after discussion</Text>
            </View>
          </View>
        </View>

        {/* Main Content: Steps + Info Panels */}
        <View style={[styles.contentGrid, isSmall && { flexDirection: 'column' }]}>
          {/* Steps Panel */}
          <View style={[styles.stepsPanel, { padding: isSmall ? 20 : 28 }]}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionKicker, { fontSize: kickerSize }]}>Ordering Process</Text>
              <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, lineHeight: sectionTitleSize * 1.1 }]}>
                Simple offline ordering in four steps.
              </Text>
            </View>

            <View
              style={[
                styles.stepsGrid,
                { flexDirection: isSmall ? 'column' : 'row', flexWrap: 'wrap' },
              ]}
            >
              {steps.map((step) => (
                <View
                  key={step.number}
                  style={[
                    styles.stepCard,
                    {
                      width: stepsColumns === 1 ? '100%' : '48%',
                      padding: isSmall ? 16 : 20,
                      marginBottom: 16,
                    },
                  ]}
                >
                  <View style={styles.stepTop}>
                    <Text style={[styles.stepNumber, { fontSize: kickerSize }]}>{step.number}</Text>
                    <View style={styles.stepIcon}>
                      <Feather name={step.icon} size={22} color="#3b6797" />
                    </View>
                  </View>
                  <Text style={[styles.stepTitle, { fontSize: cardTitleSize, marginVertical: 8 }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepText, { fontSize: bodyTextSize }]}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info Panels Sidebar */}
          <View style={styles.infoPanel}>
            {/* Warning Card */}
            <View style={[styles.infoCard, { padding: isSmall ? 20 : 22 }]}>
              <Text style={[styles.cardKicker, { fontSize: kickerSize }]}>Important</Text>
              <Text style={[styles.cardTitle, { fontSize: cardTitleSize, marginBottom: 8 }]}>
                Orders are not online
              </Text>
              <Text style={[styles.cardText, { fontSize: bodyTextSize }]}>
                The website helps you view products and ideas, but the actual order is placed only
                after visiting the shop.
              </Text>
            </View>

            {/* Notes Card */}
            <View style={[styles.infoCard, { padding: isSmall ? 20 : 22 }]}>
              <Text style={[styles.cardKicker, { fontSize: kickerSize }]}>Before You Visit</Text>
              <View style={styles.notesList}>
                {notes.map((note) => (
                  <View key={note} style={styles.noteItem}>
                    <Feather name="check-circle" size={14} color="#3b6797" style={{ marginRight: 8 }} />
                    <Text style={[styles.cardText, { fontSize: bodyTextSize }]}>{note}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact Card */}
            <LinearGradient
              colors={['#f8fafc', '#ffffff']}
              style={[styles.infoCard, { padding: isSmall ? 20 : 22 }]}
            >
              <Text style={[styles.cardKicker, { fontSize: kickerSize }]}>Need Guidance First?</Text>
              <Text style={[styles.cardText, { fontSize: bodyTextSize, marginBottom: 16 }]}>
                If you are unsure which product or size is right, contact us first and then visit
                the shop with your requirements.
              </Text>
              <View style={[styles.contactActions, isSmall && { flexDirection: 'column' }]}>
                <TouchableOpacity
                  style={[styles.primaryLink, { paddingVertical: isSmall ? 10 : 12 }]}
                  onPress={() => navigateTo('Support')}
                >
                  <Text style={[styles.primaryLinkText, { fontSize: bodyTextSize }]}>Contact Support</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryLink, { paddingVertical: isSmall ? 10 : 12 }]}
                  onPress={() => navigateTo('Categories')}
                >
                  <Text style={[styles.secondaryLinkText, { fontSize: bodyTextSize }]}>Browse Categories</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  shell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  hero: {
    borderWidth: 1,
    borderColor: '#d8e2ef',
    borderRadius: 30,
    backgroundColor: 'white',
    marginBottom: 24,
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  heroKicker: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#3b6797',
    marginBottom: 8,
  },
  heroTitle: {
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 12,
  },
  heroText: {
    color: '#60728d',
    lineHeight: 24,
    marginBottom: 20,
  },
  heroPoints: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  heroPointText: {
    fontWeight: '600',
    color: '#10233f',
  },
  contentGrid: {
    flexDirection: 'row',
    gap: 22,
  },
  stepsPanel: {
    flex: 1.25,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d8e2ef',
    borderRadius: 24,
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 1,
  },
  sectionHead: {
    marginBottom: 22,
  },
  sectionKicker: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#3b6797',
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0b2343',
  },
  stepsGrid: {
    justifyContent: 'space-between',
  },
  stepCard: {
    borderWidth: 1,
    borderColor: '#dfe8f3',
    borderRadius: 22,
    backgroundColor: '#ffffff',
  },
  stepTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    fontWeight: '800',
    color: '#3b6797',
    letterSpacing: 1.2,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ebf2fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontWeight: '700',
    color: '#0b2343',
  },
  stepText: {
    color: '#60728d',
    lineHeight: 22,
  },
  infoPanel: {
    flex: 0.75,
    gap: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d8e2ef',
    borderRadius: 24,
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  cardKicker: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#3b6797',
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0b2343',
  },
  cardText: {
    color: '#60728d',
    lineHeight: 22,
  },
  notesList: {
    marginTop: 8,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryLink: {
    backgroundColor: '#0b2343',
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryLinkText: {
    color: 'white',
    fontWeight: '700',
  },
  secondaryLink: {
    borderWidth: 1,
    borderColor: '#d8e2ef',
    backgroundColor: 'white',
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: '#0b2343',
    fontWeight: '700',
  },
});