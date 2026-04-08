// src/components/CategoryShowcasePage.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatPriceDisplay, getDisplayText } from '../utils/productHelpers';

const defaultHero =
  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80';

export default function CategoryShowcasePage({
  title,
  subtitle,
  heroImage,
  products = [],
  emptyTitle = 'No Products Found',
  emptyText = 'Check back soon for products in this section.',
  heroDescription,
  highlights = ['Custom designs', 'Fast turnaround', 'Premium quality'],
  showActions = true,
  primaryLinkText = 'Browse Categories',
  primaryLinkTo = 'Categories',
  secondaryLinkText = 'Contact Support',
  secondaryLinkTo = 'Categories',
  fromCategory = false,
}) {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const getNumColumns = () => {
    if (screenWidth >= 800) return 3;
    if (screenWidth >= 480) return 2;
    return 1;
  };

  const numColumns = getNumColumns();
  const description =
    heroDescription || subtitle || 'Explore our collection of premium printed products. Perfect for any occasion, with fast turnaround and exceptional quality.';

  // Responsive font sizes
  const titleFontSize = screenWidth > 600 ? 34 : 28;
  const heroTextFontSize = screenWidth > 600 ? 16 : 14;
  const sectionTitleFontSize = screenWidth > 600 ? 26 : 22;

  // Force column layout on medium screens to avoid text clipping
  const isHeroStacked = screenWidth < 800;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        {/* Hero Section */}
        <View style={[styles.hero, isHeroStacked && styles.heroStacked]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Category Showcase</Text>
            {/* Hero title - unlimited lines, no clipping */}
            <Text style={[styles.heroTitle, { fontSize: titleFontSize }]}>{title}</Text>
            <Text style={[styles.heroText, { fontSize: heroTextFontSize }]}>{description}</Text>

            <View style={styles.highlights}>
              {highlights.map((item) => (
                <View key={item} style={styles.highlightChip}>
                  <Ionicons name="heart" size={14} color="#335f93" />
                  <Text style={styles.highlightChipText}>{item}</Text>
                </View>
              ))}
            </View>

            {showActions && (
              <View style={styles.heroActions}>
                <TouchableOpacity
                  style={styles.primaryLink}
                  onPress={() => navigation.navigate(primaryLinkTo.replace('/', ''))}
                >
                  <Text style={styles.primaryLinkText}>{primaryLinkText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryLink}
                  onPress={() => navigation.navigate(secondaryLinkTo.replace('/', ''))}
                >
                  <Text style={styles.secondaryLinkText}>{secondaryLinkText}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.heroMedia}>
            <View style={styles.heroImageCard}>
              <Image source={{ uri: heroImage || defaultHero }} style={styles.heroImage} />
              <View style={styles.heroBadge}>
                <Ionicons name="star" size={16} color="#335f93" />
                <Text style={styles.heroBadgeText}>{products.length} products</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionHeadLeft}>
              <Text style={styles.sectionKicker}>Collection</Text>
              <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
                Featured items
              </Text>
            </View>
            <Text style={styles.sectionDesc}>Open any product to view details and pricing.</Text>
          </View>

          {products.length ? (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={`products-grid-${numColumns}`}
              columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.productCard,
                    { width: numColumns === 1 ? '100%' : `${100 / numColumns - 2}%` },
                  ]}
                  onPress={() =>
                    navigation.navigate('Categories', {
                      screen: 'ProductDetails',
                      params: { productId: item.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.productImageWrap}>
                    <Image
                      source={{
                        uri:
                          item.images?.[0] ||
                          item.image ||
                          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
                      }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.productBody}>
                    <Text style={styles.productName}>{item.name}</Text>
                    {/* Product description - ensure it wraps and is not hidden */}
                    <Text style={styles.productDesc} numberOfLines={3}>
                      {getDisplayText(item.description, 'Premium custom printing and packaging item.')}
                    </Text>
                    <View style={styles.productFooter}>
                      <Text style={styles.productPrice}>{formatPriceDisplay(item.price)}</Text>
                      <View style={styles.inlineLink}>
                        <Text style={styles.inlineLinkText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={14} color="#335f93" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptyText}>{emptyText}</Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Categories')}
              >
                <Text style={styles.browseBtnText}>Browse All Categories</Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 28,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    gap: 20,
    overflow: 'visible', // Ensure no clipping
  },
  heroStacked: {
    flexDirection: 'column',
  },
  heroCopy: {
    flex: 1,
    overflow: 'visible',
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#335f93',
    marginBottom: 8,
    letterSpacing: 1,
  },
  heroTitle: {
    fontWeight: '800',
    color: '#0b2343',
    marginBottom: 16, // Increased margin for breathing room
    marginTop: 4,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  heroText: {
    lineHeight: 22,
    color: '#60728d',
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f7fafe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  highlightChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b2343',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  primaryLink: {
    backgroundColor: '#0b2343',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  primaryLinkText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryLink: {
    borderWidth: 1,
    borderColor: '#d8e2ef',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  secondaryLinkText: {
    color: '#0b2343',
    fontWeight: '800',
    fontSize: 14,
  },
  heroMedia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220, // Ensures image doesn't shrink too much
  },
  heroImageCard: {
    width: '100%',
    aspectRatio: 0.95,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d8e2ef',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  heroBadgeText: {
    fontWeight: '800',
    color: '#0b2343',
    fontSize: 12,
  },
  productsSection: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    marginTop: 8, // Extra separation from hero
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24, // Increased to avoid overlap with product cards
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeadLeft: {
    flex: 1,
  },
  sectionKicker: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#335f93',
    marginBottom: 4,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#0b2343',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#60728d',
    maxWidth: '50%',
    textAlign: 'right',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImageWrap: {
    aspectRatio: 1 / 0.86,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBody: {
    padding: 12,
    flex: 1, // Ensure it takes available space
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0b2343',
  },
  productDesc: {
    fontSize: 12,
    color: '#60728d',
    marginBottom: 12,
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#d8e2ef',
    paddingTop: 10,
  },
  productPrice: {
    fontWeight: '700',
    color: '#0b2343',
    fontSize: 15,
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#335f93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#60728d',
    marginBottom: 20,
    textAlign: 'center',
  },
  browseBtn: {
    backgroundColor: '#0b2343',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  browseBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});