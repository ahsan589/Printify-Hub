import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const aboutSections = [
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    title: 'Premium Printing Services',
    text: 'High-quality printing for packaging, stickers, labels, cards, and custom stationery with expert finishing.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618047-eb7d84d9590f?auto=format&fit=crop&w=800&q=80',
    title: 'Fast Turnaround',
    text: 'Quick production timelines for urgent orders while maintaining premium quality standards.',
  },
  {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    title: 'Customer Focused',
    text: 'We guide you from product selection through artwork preparation to final delivery.',
  },
];

const AboutScreen = () => {
  const navigation = useNavigation();

  const renderSection = ({ item }) => (
    <View style={styles.sectionCard}>
      <Image source={{ uri: item.image }} style={styles.sectionImage} resizeMode="cover" />
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        <Text style={styles.sectionText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient colors={['#0b2343', '#17385f']} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <Text style={styles.heroKicker}>About Printing Press</Text>
              <Text style={styles.heroTitle}>Premium printing partner for businesses and events.</Text>
              <Text style={styles.heroText}>
                We specialize in high-quality packaging, custom labels, stickers, wedding stationery, and corporate print with fast turnaround and expert guidance from concept to delivery.
              </Text>
              <View style={styles.heroPoints}>
                <View style={styles.heroPoint}>
                  <Feather name="star" size={20} color="#b7d0ea" />
                  <Text style={styles.heroPointText}>Premium quality guaranteed</Text>
                </View>
                <View style={styles.heroPoint}>
                  <Feather name="truck" size={20} color="#b7d0ea" />
                  <Text style={styles.heroPointText}>Fast delivery timelines</Text>
                </View>
                <View style={styles.heroPoint}>
                  <Feather name="users" size={20} color="#b7d0ea" />
                  <Text style={styles.heroPointText}>Expert team support</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Feature Sections */}
        <View style={styles.section}>
          <FlatList
            data={aboutSections}
            renderItem={renderSection}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.sectionList}
          />
        </View>

        {/* Our Story */}
        <View style={[styles.section, styles.storySection]}>
          <Text style={styles.sectionKicker}>Our Story</Text>
          <Text style={styles.sectionTitle}>From small orders to large production runs.</Text>
          <Text style={styles.storyText}>
            Started as a local print shop serving businesses with custom packaging and stationery, we've grown to handle everything from startup branding to corporate bulk orders and wedding print packages.
          </Text>
          <Text style={styles.storyText}>
            What hasn't changed is our commitment to quality materials, precise finishing, and helping customers get exactly what they need for their products and events.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Projects completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>20+</Text>
            <Text style={styles.statLabel}>Print categories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000s</Text>
            <Text style={styles.statLabel}>Happy customers</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.ctaSection, styles.darkSection]}>
          <Text style={styles.ctaTitle}>Ready to start your project?</Text>
          <Text style={styles.ctaText}>Browse our catalog or contact support for custom requirements.</Text>
          <View style={styles.ctaActions}>
            <TouchableOpacity style={styles.ctaButtonPrimary} onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.ctaButtonTextPrimary}>Browse Catalog</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaButtonSecondary} onPress={() => navigation.navigate('Support')}>
              <Text style={styles.ctaButtonTextSecondary}>Get Help</Text>
            </TouchableOpacity>
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
  sectionList: {
    gap: 20,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionImage: {
    width: '100%',
    height: 200,
  },
  sectionContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#60728d',
    lineHeight: 22,
  },
  storySection: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    padding: 28,
  },
  sectionKicker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b6797',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionTitleBig: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 16,
    lineHeight: 30,
  },
  storyText: {
    fontSize: 16,
    color: '#60728d',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0b2343',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 15,
    color: '#60728d',
    textAlign: 'center',
  },
  ctaSection: {
    padding: 32,
    marginHorizontal: 16,
    marginBottom: 40,
  },
  darkSection: {
    backgroundColor: '#0b2343',
    borderRadius: 28,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 30,
  },
  ctaText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButtonPrimary: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
  },
  ctaButtonTextPrimary: {
    color: '#0b2343',
    fontWeight: '800',
    fontSize: 16,
  },
  ctaButtonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaButtonTextSecondary: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AboutScreen;
