import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Animated,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { Linking } from 'react-native';
import { db } from '../firebase';
import { formatPriceDisplay, isStandardProduct } from '../utils/productHelpers';

// ---------- Static fallback hero slides ----------
const staticHeroSlides = [
  {
    eyebrow: 'Wedding Card Printing',
    title: 'Elegant wedding cards and event stationery for memorable celebrations.',
    text: 'From invitation cards to thank-you inserts and coordinated wedding print sets, we help you create polished pieces that feel premium and personal.',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',
    accent: '#1d4c84',
    topLabel: 'Wedding Favorite',
    topText: 'Invites, inserts, and premium card finishes',
    bottomLabel: 'Custom Orders',
    bottomText: 'Matching sets for events and celebrations',
  },
  {
    eyebrow: 'Printable Mugs & Gifts',
    title: 'Custom mugs and gift printing that turn simple items into branded keepsakes.',
    text: 'Perfect for giveaways, office gifting, and personalized orders with vibrant printing that stands out on mugs, accessories, and event merchandise.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=80',
    accent: '#335f93',
    topLabel: 'Gift Printing',
    topText: 'Personalized mugs and branded merchandise',
    bottomLabel: 'Bulk Friendly',
    bottomText: 'Great for events, teams, and corporate gifting',
  },
  {
    eyebrow: 'Shirt & Apparel Printing',
    title: 'Printed shirts and apparel designed for brands, teams, and promotions.',
    text: 'Build eye-catching apparel with custom shirt printing for uniforms, startup branding, merch drops, and promotional campaigns.',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80',
    accent: '#0b2343',
    topLabel: 'Apparel Print',
    topText: 'Custom shirts for teams, shops, and campaigns',
    bottomLabel: 'Brand Ready',
    bottomText: 'Reliable quality for repeat apparel orders',
  },
];

// ---------- Helpers ----------
function getDisplayText(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
}

function getAvatarUrl(name, email) {
  const identifier = name || email || 'user';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=3b6797&color=fff&rounded=true&size=56&bold=true&length=2&fontsize=0.28`;
}

const renderStars = (rating) => {
  const numericRating = typeof rating === 'number' ? rating : Number(rating) || 0;
  const clampedRating = Math.min(5, Math.max(0, numericRating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) return <Feather key={i} name="star" size={14} color="#f5b042" />;
        if (i === fullStars && hasHalfStar) return <Feather key={i} name="star" size={14} color="#f5b042" />;
        return <Feather key={i} name="star" size={14} color="#dce5ef" />;
      })}
    </View>
  );
};

// ---------- Section Heading Component (responsive) ----------
const SectionHeading = ({ kicker, title, text, action }) => (
  <View style={styles.sectionHeading}>
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionKicker}>{kicker}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {text ? <Text style={styles.sectionText}>{text}</Text> : null}
    </View>
    {action || null}
  </View>
);

// ---------- Animated Card Wrapper with enhanced animations ----------
const AnimatedCard = React.memo(({ children, onPress, style, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = (index || 0) * 100;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [fadeAnim, translateYAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View 
        style={[
          style, 
          { 
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            opacity: fadeAnim
          } 
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
});

// ---------- Hero Component (fully responsive) ----------
const Hero = ({ slide, motionTick, onSearch, searchValue, onSearchChange, onSearchFocus, onSearchBlur, isMobile, onClearSearch }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: motionTick % 2 === 0 ? 0 : 20,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
    ]).start(() => translateX.setValue(0));
  }, [motionTick]);

  return (
    <View style={[styles.heroSection, isMobile && styles.heroSectionStacked]}>
      <Animated.View style={[styles.heroCopy, { transform: [{ translateX }], opacity }]}>
        <Text style={styles.heroKicker}>{slide.eyebrow}</Text>
        <Text style={[styles.heroTitle, isMobile && { fontSize: 26 }]}>{slide.title}</Text>
        <Text style={[styles.heroText, isMobile && { fontSize: 13 }]}>{slide.text}</Text>
        <View style={styles.heroSearch}>
          <Feather name="search" size={20} color="#3b6797" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, categories, bundles..."
            placeholderTextColor="#9aa9bf"
            value={searchValue}
            onChangeText={onSearchChange}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onSubmitEditing={() => onSearch(searchValue)}
          />
          {searchValue.length > 0 && (
            <TouchableOpacity onPress={onClearSearch} style={styles.clearButton}>
              <Feather name="x" size={18} color="#60728d" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchButton} onPress={() => onSearch(searchValue)}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroMetrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>500+</Text>
            <Text style={styles.metricLabel}>Projects delivered</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>20+</Text>
            <Text style={styles.metricLabel}>Print categories</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>Bulk</Text>
            <Text style={styles.metricLabel}>Startup to enterprise</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.heroVisual}>
        <View style={styles.heroVisualStack}>
          <LinearGradient colors={[slide.accent, '#081a31']} style={styles.heroImageWrap}>
            <Image source={{ uri: slide.image }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroCardTop}>
              <Text style={styles.heroCardLabel}>{slide.topLabel || 'Top Pick'}</Text>
              <Text style={styles.heroCardText}>{slide.topText || 'Premium packaging bundles'}</Text>
            </View>
            <View style={styles.heroCardBottom}>
              <Text style={styles.heroCardLabel}>{slide.bottomLabel || 'Inquiry Friendly'}</Text>
              <Text style={styles.heroCardText}>{slide.bottomText || 'Quick WhatsApp quote support'}</Text>
            </View>
          </LinearGradient>
          <View style={styles.heroLandscapeWrap}>
            <Image source={{ uri: slide.secondaryImage }} style={styles.heroLandscapeImage} resizeMode="cover" />
          </View>
        </View>
      </View>
    </View>
  );
};

// ---------- Category Showcase (2 cards per row) ----------
const CategoryShowcase = ({ categories = [], navigation, searchQuery }) => {
  const screenWidth = Dimensions.get('window').width;
  const homeShellPadding = 32; // 16 left + 16 right
  const gridGap = 12;
  const availableWidth = screenWidth - homeShellPadding;
  const cardWidth = (availableWidth - gridGap) / 2;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const queryLower = searchQuery.toLowerCase();
    return categories.filter(cat =>
      cat.name?.toLowerCase().includes(queryLower) ||
      cat.description?.toLowerCase().includes(queryLower)
    );
  }, [categories, searchQuery]);

  if (filteredCategories.length === 0) {
    return (
      <View style={styles.contentSection}>
        <SectionHeading kicker="Shop By Category" title="Start with the section that matches your business." text="Clean entry points for packaging, wedding print, labels, stationery, and more." />
        <View style={styles.emptySearchState}>
          <Feather name="search" size={40} color="#cbd5e1" />
          <Text style={styles.emptySearchText}>No categories match "{searchQuery}"</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contentSection}>
      <SectionHeading
        kicker="Shop By Category"
        title="Start with the section that matches your business."
        text="Clean entry points for packaging, wedding print, labels, stationery, and more."
      />
      <View style={styles.gridContainer}>
        {filteredCategories.slice(0, 8).map((item, index) => (
          <AnimatedCard
            key={item.id}
            index={index}
            onPress={() => navigation.navigate('Categories', { screen: 'CategoriesDetail', params: { categoryId: item.id } })}
            style={[styles.categoryCard, { width: cardWidth }]}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.imageGradient}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {getDisplayText(item.description, 'Browse products in this category.')}
              </Text>
            </View>
          </AnimatedCard>
        ))}
      </View>
    </View>
  );
};

// ---------- Product Spotlight (2 cards per row) ----------
const ProductSpotlight = ({ products = [], navigation, searchQuery }) => {
  const screenWidth = Dimensions.get('window').width;
  const homeShellPadding = 32; // 16 left + 16 right
  const gridGap = 12;
  const availableWidth = screenWidth - homeShellPadding;
  const cardWidth = (availableWidth - gridGap) / 2;

  const regularProducts = useMemo(() => {
    let filtered = products.filter(p => !p.bundleGroup);
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower) ||
        p.category?.toLowerCase().includes(queryLower)
      );
    }
    return filtered;
  }, [products, searchQuery]);

  if (regularProducts.length === 0) {
    return (
      <View style={styles.contentSection}>
        <SectionHeading kicker="Featured Products" title="Popular print and packaging picks." text="A tighter, cleaner product grid with quick paths into detail pages." />
        <View style={styles.emptySearchState}>
          <Feather name="package" size={40} color="#cbd5e1" />
          <Text style={styles.emptySearchText}>No products match "{searchQuery}"</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contentSection}>
      <SectionHeading
        kicker="Featured Products"
        title="Popular print and packaging picks."
        text="A tighter, cleaner product grid with quick paths into detail pages."
      />
      <View style={styles.gridContainer}>
        {regularProducts.slice(0, 8).map((item, index) => (
          <AnimatedCard
            key={item.id}
            index={index}
            onPress={() => navigation.navigate('Categories', { screen: 'ProductDetails', params: { productId: item.id } })}
            style={[styles.productCard, { width: cardWidth }]}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {item.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount}% OFF</Text>
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.imageGradient}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.productTag}>{getDisplayText(item.category, 'Printing')}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>{formatPriceDisplay(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>{formatPriceDisplay(item.originalPrice)}</Text>
                )}
              </View>
            </View>
          </AnimatedCard>
        ))}
      </View>
    </View>
  );
};

// ---------- Bundle Spotlight (horizontal scroll) ----------
const BundleSpotlight = ({ products = [], navigation, searchQuery }) => {
  const bundles = useMemo(() => {
    let filtered = products.filter(p => p.bundleGroup);
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(queryLower) ||
        p.bundleGroup?.toLowerCase().includes(queryLower)
      );
    }
    return filtered;
  }, [products, searchQuery]);

  if (bundles.length === 0) return null;

  return (
    <View style={[styles.contentSection, styles.bundlePanel]}>
      <SectionHeading
        kicker="Ready-Made Bundles"
        title="Bundle offers designed for fast brand setup."
        text="Perfect for startup packaging, gifting brands, and businesses that want coordinated print pieces."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bundleList}
      >
        {bundles.slice(0, 3).map((item, index) => (
          <AnimatedCard
            key={item.id}
            index={index}
            onPress={() => navigation.navigate('Categories', { screen: 'ProductDetails', params: { productId: item.id } })}
            style={styles.bundleCard}
          >
            <View style={styles.bundleImage}>
              <Image
                source={{ uri: item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' }}
                style={styles.bundleImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.bundleContent}>
              <Text style={styles.bundlePill}>{item.bundleGroup || 'Bundle'}</Text>
              <Text style={styles.bundleName}>{item.name}</Text>
              <Text style={styles.bundlePrice}>{formatPriceDisplay(item.price)}</Text>
              <TouchableOpacity style={styles.bundleButton}>
                <Text style={styles.bundleButtonText}>Shop Now</Text>
                <Feather name="arrow-right" size={14} color="#3b6797" />
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        ))}
      </ScrollView>
    </View>
  );
};

// ---------- Modern Review Card Component (horizontal scroll) ----------
const ModernReviewCard = ({ review, index, cardWidth }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarError, setAvatarError] = useState(true);
  const comment = review.comment || 'No comment provided.';
  const shouldTruncate = comment.length > 100;
  const displayComment = isExpanded || !shouldTruncate ? comment : comment.substring(0, 100) + '...';

  const initials = (review.userName || review.name || 'User').match(/\b\w/g)?.slice(0,2).join('') || 'U';
  const reviewerName = review.userName || review.name || 'Anonymous';

  const avatarUrl = getAvatarUrl(reviewerName, review.email);

  return (
    <View style={[styles.modernReviewCard, { width: cardWidth }]}> 
      <View style={styles.quoteIconContainer}>
        <MaterialIcons name="format-quote" size={32} color="#3b6797" />
      </View>

      <View style={styles.reviewRatingSection}>
        <View style={styles.starsContainer}>
          {renderStars(review.rating)}
        </View>
        <Text style={styles.reviewRatingText}>{Number(review.rating || 0).toFixed(1)}</Text>
      </View>

      <Text style={styles.modernReviewText} numberOfLines={isExpanded ? undefined : 3}>
        {displayComment}
      </Text>

      {shouldTruncate && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>{isExpanded ? 'Read Less' : 'Read More'}</Text>
          <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#3b6797" />
        </TouchableOpacity>
      )}

      <View style={styles.modernReviewerInfo}>
        <View style={[styles.modernReviewerAvatar, { backgroundColor: '#3b6797' }]}>
          {avatarError ? (
            <Text style={styles.avatarInitials}>{initials}</Text>
          ) : (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.modernReviewerAvatarContent}
              onError={() => setAvatarError(true)}
              onLoad={() => setAvatarError(false)}
            />
          )}
        </View> 
        <View style={styles.modernReviewerDetails}>
          <Text style={styles.modernReviewerName}>{review.userName || review.name || 'Anonymous'}</Text>
          <View style={styles.reviewMetaRow}>
            <View style={styles.verifiedPurchaseBadge}>
              <Feather name="check-circle" size={12} color="#10b981" />
              <Text style={styles.verifiedPurchaseText}>Verified</Text>
            </View>
            <Text style={styles.reviewDateSmall}>
              {review.timestamp && review.timestamp.seconds 
                ? new Date(review.timestamp.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Recent'}
            </Text> 
          </View>
        </View>
      </View>

      {review.productName && (
        <View style={styles.reviewProductBadge}>
          <Feather name="tag" size={12} color="#3b6797" />
          <Text style={styles.reviewProductBadgeText}>{review.productName}</Text>
        </View>
      )}
    </View>
  );
};

// ---------- Review Section (HORIZONTAL SCROLL with REAL-TIME UPDATES) ----------
const ReviewSection = ({ reviews, averageRating, totalReviews, loading }) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 80; // Wider cards for horizontal scroll

  if (loading) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <LottieView 
          source={require('../assets/lottie/progress.json')} 
          style={{width: 60, height: 60}} 
          autoPlay 
          loop 
          colorFilters={[{
            keypath: '**',
            color: '#3b6797'
          }]}
        />
      </View>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <View style={[styles.contentSection, styles.reviewsHero]}>
        <View style={styles.reviewsHeroLeft}>
          <View style={styles.averageRatingContainer}>
            <Text style={styles.averageRatingNumber}>{averageRating.toFixed(1)}</Text>
            <View>
              <Text style={styles.averageRatingLabel}>Average Rating</Text>
              <View style={styles.starsLarge}>
                {renderStars(averageRating)}
              </View>
            </View>
          </View>
          <Text style={styles.totalReviewsText}>Based on {totalReviews} customer reviews</Text>
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => Math.floor(r.rating) === star).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <View key={star} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarStar}>{star} ★</Text>
                  <View style={styles.ratingBarBackground}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.ratingBarCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
        
        <View style={styles.reviewsHeroRight}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80' }}
            style={styles.reviewsHeroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.reviewsHeroGradient}
          />
          <View style={styles.reviewsHeroBadge}>
            <Text style={styles.reviewsHeroBadgeText}>⭐ {averageRating.toFixed(1)} • {totalReviews}+ Reviews</Text>
          </View>
        </View>
      </View>

      {/* Reviews Horizontal Scroll */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.reviewsHeaderTitle}>What Our Customers Say</Text>
          <Text style={styles.reviewsHeaderSubtitle}>
            Real experiences from real customers
          </Text>
        </View>

        {reviews.length === 0 ? (
          <View style={[styles.noReviewsCard, { width: screenWidth - 32, alignSelf: 'center' }]}>
            <MaterialIcons name="chat-bubble-outline" size={48} color="#cbd5e1" />
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to share your experience!</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalReviewsList}
            decelerationRate="fast"
            snapToInterval={cardWidth + 16}
            snapToAlignment="center"
          >
            {reviews.map((review, index) => (
              <ModernReviewCard key={review.id} review={review} index={index} cardWidth={cardWidth} />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
};

// ---------- Simple Testimonial Band ----------
const TestimonialBand = () => {
  const items = [
    { name: 'Startup Brands', quote: 'The packaging finally made our products feel market-ready.' },
    { name: 'Corporate Clients', quote: 'Clean print quality, easy coordination, and dependable timelines.' },
    { name: 'Event Orders', quote: 'Wedding and gifting print looked polished and premium in hand.' },
  ];
  return (
    <View style={styles.testimonialBand}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.testimonialChip}>
          <Feather name="star" size={20} color="#3b6797" />
          <View style={{ flex: 1 }}>
            <Text style={styles.testimonialName}>{item.name}</Text>
            <Text style={styles.testimonialQuote}>{item.quote}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// ---------- Services Strip (2 cards per row) ----------
const servicePillars = [
  {
    icon: 'package',
    title: 'Custom Packaging',
    text: 'Boxes, sleeves, mailers, inserts, and retail-ready packaging for every product category.',
  },
  {
    icon: 'layers',
    title: 'Brand Print',
    text: 'Business cards, brochures, tags, thank you cards, and marketing collateral with sharp finishing.',
  },
  {
    icon: 'truck',
    title: 'Bulk Production',
    text: 'Dependable large-volume printing with support for repeat orders and growing brands.',
  },
  {
    icon: 'shield',
    title: 'Quality Control',
    text: 'Consistent materials, cleaner output, and better presentation so your products feel polished.',
  },
];

const ServicesStrip = () => {
  const screenWidth = Dimensions.get('window').width;
  const homeShellPadding = 32;
  const gridGap = 12;
  const availableWidth = screenWidth - homeShellPadding;
  const cardWidth = (availableWidth - gridGap) / 2;

  return (
    <View style={styles.contentSection}>
      <SectionHeading
        kicker="Why Brands Choose Us"
        title="A more practical print partner."
        text="Less clutter, more clarity: design-minded production, better packaging presentation, and easier inquiry flow."
      />
      <View style={styles.gridContainer}>
        {servicePillars.map((item, index) => (
          <AnimatedCard key={item.title} index={index} style={[styles.pillarCard, { width: cardWidth }]}>
            <View style={styles.pillarIcon}>
              <Feather name={item.icon} size={24} color="#3b6797" />
            </View>
            <Text style={styles.pillarTitle}>{item.title}</Text>
            <Text style={styles.pillarText}>{item.text}</Text>
          </AnimatedCard>
        ))}
      </View>
    </View>
  );
};

// ---------- Wedding Promo ----------
const WeddingPromo = ({ navigation }) => {
  return (
    <View style={styles.weddingPromo}>
      <Image source={{ uri: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80' }} style={styles.weddingBg} />
      <LinearGradient colors={['rgba(11,35,67,0.85)', 'rgba(51,95,147,0.9)']} style={styles.weddingOverlay}>
        <View style={styles.weddingContent}>
          <Text style={styles.weddingTitle}>Wedding Essentials</Text>
          <Text style={styles.weddingText}>
            Printing Press brings you all the glams of a glamorous Wedding from gift boxes of different types to wedding cards of your desire. You will be redirected to our sales manager who will fully assist you guiding you through to a magnificent wedding.
          </Text>
          <TouchableOpacity style={styles.weddingCta} onPress={() => navigation.navigate('WeddingSpecial')}>
            <Text style={styles.weddingCtaText}>Explore Wedding Specials</Text>
            <Feather name="arrow-right" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

// ---------- Final CTA ----------
const FinalCTA = ({ navigation }) => (
  <LinearGradient colors={['#14213d', '#20345f']} style={styles.finalCta}>
    <View style={styles.finalCtaCopy}>
      <Text style={styles.sectionKickerWhite}>Need A Quote?</Text>
      <Text style={styles.finalCtaTitle}>Tell us what you need and we'll help shape the right print or packaging setup.</Text>
      <Text style={styles.finalCtaText}>Great for bulk packaging, startup bundles, label runs, and custom branded print projects.</Text>
    </View>
    <View style={styles.finalCtaActions}>
      <TouchableOpacity 
        style={styles.whatsappButton} 
        onPress={() => {
          const phoneNumber = '+923101788571';
          const message = 'Hello! I need a quote for printing/packaging services.';
          const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
          Linking.openURL(whatsappUrl).catch(() => {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to continue.');
          });
        }}
      >
        <FontAwesome5 name="whatsapp" size={20} color="white" />
        <Text style={styles.whatsappButtonText}>WhatsApp Inquiry</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('Support')}>
        <Text style={styles.supportButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

// ---------- Main Dashboard Component ----------
export default function DashboardScreen() {
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeroSearchFocused, setIsHeroSearchFocused] = useState(false);
  const [heroMotionTick, setHeroMotionTick] = useState(0);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [categoryProductsMap, setCategoryProductsMap] = useState({});

  const { width: screenWidth } = dimensions;
  const isMobile = screenWidth < 600;

  // Real-time listeners for Firestore data
  useEffect(() => {
    // Real-time listener for categories
    const categoriesQuery = collection(db, 'categories');
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
    }, (error) => {
      console.error('Categories listener error:', error);
    });

    // Real-time listener for products
    const productsQuery = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      
      // Update categoryProductsMap when products change
      const newCategoryProductsMap = {};
      categories.forEach((cat) => {
        newCategoryProductsMap[cat.id] = productsData
          .filter((p) => p.categoryId === cat.id && isStandardProduct(p))
          .slice(0, 3);
      });
      setCategoryProductsMap(newCategoryProductsMap);
    }, (error) => {
      console.error('Products listener error:', error);
    });

    // Real-time listener for reviews with ordering
    const reviewsQuery = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
      
      // Calculate average rating
      const totalRating = reviewsData.reduce((sum, r) => sum + Number(r.rating || 0), 0);
      const newAverageRating = reviewsData.length > 0 ? totalRating / reviewsData.length : 0;
      setAverageRating(newAverageRating);
    }, (error) => {
      console.error('Reviews listener error:', error);
    });

    setLoading(false);

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
      unsubscribeReviews();
    };
  }, []); // Empty dependency array - only run once

  const displaySlides = useMemo(() => {
    if (categories.length === 0) return staticHeroSlides;
    return categories.map((cat, index) => {
      const firstProduct = categoryProductsMap[cat.id]?.[0];
      const productImage = firstProduct ? (firstProduct.images?.[0] || firstProduct.image) : null;
      return {
        eyebrow: cat.name,
        title: cat.name,
        text: cat.description || staticHeroSlides[index % staticHeroSlides.length].text,
        image: cat.image || staticHeroSlides[index % staticHeroSlides.length].image,
        secondaryImage: productImage || cat.image || staticHeroSlides[index % staticHeroSlides.length].secondaryImage,
        accent: ['#1d4c84', '#335f93', '#0b2343', '#2c5282', '#4c7b9a', '#1a365d'][index % 6],
        topLabel: 'Featured',
        topText: cat.description?.slice(0, 50) || 'Premium products',
        bottomLabel: 'Shop Now',
        bottomText: 'Browse collection',
      };
    });
  }, [categories, categoryProductsMap]);

  const slide = displaySlides[activeSlide] || displaySlides[0];

  useEffect(() => {
    if (!displaySlides.length || isHeroSearchFocused) return;
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [displaySlides.length, isHeroSearchFocused]);

  useEffect(() => {
    if (activeSlide < displaySlides.length) return;
    setActiveSlide(0);
  }, [activeSlide, displaySlides.length]);

  useEffect(() => {
    setHeroMotionTick((current) => current + 1);
  }, [activeSlide]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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
        <Text style={{ marginTop: 6, color: '#4db0da' }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.homeShell}>
        <Hero
          slide={slide}
          motionTick={heroMotionTick}
          onSearch={handleSearch}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchFocus={() => setIsHeroSearchFocused(true)}
          onSearchBlur={() => setIsHeroSearchFocused(false)}
          isMobile={isMobile}
          onClearSearch={clearSearch}
        />

        <TestimonialBand />
        <CategoryShowcase categories={categories} navigation={navigation} searchQuery={searchQuery} />
        <ProductSpotlight products={products} navigation={navigation} searchQuery={searchQuery} />
        <BundleSpotlight products={products} navigation={navigation} searchQuery={searchQuery} />
        <WeddingPromo navigation={navigation} />
        <ServicesStrip />
        <ReviewSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={reviews.length}
          loading={false}
        />
        <FinalCTA navigation={navigation} />
      </View>
    </ScrollView>
  );
}

// ---------- Styles (fully responsive) ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  homeShell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  heroSectionStacked: {
    flexDirection: 'column',
  },
  heroCopy: {
    flex: 1,
    minWidth: 200,
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#3b6797',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    color: '#1d2939',
    marginBottom: 12,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#60728d',
    marginBottom: 20,
  },
  heroSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#10233f',
  },
  clearButton: {
    paddingHorizontal: 8,
  },
  searchButton: {
    backgroundColor: '#0b2343',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  primaryLink: {
    backgroundColor: '#0b2343',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryLinkText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryLink: {
    borderWidth: 1,
    borderColor: '#d8e2ef',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  secondaryLinkText: {
    color: '#10233f',
    fontWeight: '700',
    fontSize: 14,
  },
  heroMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: '#d8e2ef',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b2343',
  },
  metricLabel: {
    fontSize: 11,
    color: '#60728d',
    marginTop: 4,
    textAlign: 'center',
  },
  heroVisual: {
    flex: 1,
    minWidth: 220,
  },
  heroVisualStack: {
    gap: 10,
  },
  heroImageWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    padding: 16,
    height: 280,
    justifyContent: 'space-between',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 22,
  },
  heroCardTop: {
    backgroundColor: 'rgba(248,251,255,0.94)',
    borderRadius: 18,
    padding: 12,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  heroCardBottom: {
    backgroundColor: 'rgba(248,251,255,0.94)',
    borderRadius: 18,
    padding: 12,
    alignSelf: 'flex-end',
    maxWidth: '70%',
  },
  heroCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3b6797',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b2343',
  },
  heroLandscapeWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 120,
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  heroLandscapeImage: {
    width: '100%',
    height: '100%',
  },
  slideSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  slideButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideButtonActive: {
    backgroundColor: '#0b2343',
    borderColor: '#0b2343',
  },
  slideButtonText: {
    fontWeight: '800',
    color: '#60728d',
  },
  slideButtonTextActive: {
    color: 'white',
  },
  testimonialBand: {
    marginBottom: 32,
    gap: 12,
  },
  testimonialChip: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  testimonialName: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 14,
  },
  testimonialQuote: {
    color: '#60728d',
    fontSize: 13,
  },
  contentSection: {
    marginBottom: 12,
  },
  altPanel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  bundlePanel: {
    backgroundColor: '#f4f8fd',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionKicker: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#3b6797',
    marginBottom: 6,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#60728d',
    lineHeight: 20,
  },
  emptySearchState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptySearchText: {
    fontSize: 14,
    color: '#60728d',
    textAlign: 'center',
  },
  // Grid System - 2 cards per row
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Common Card Styles
  cardImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 12,
    color: '#60728d',
    lineHeight: 16,
  },
  // Category Card
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    height: 240,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  // Product Card (same size as category card)
  productCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  productTag: {
    backgroundColor: '#ebf2fb',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: '700',
    color: '#335f93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
  },
  modernReviewerAvatarContent: {
    width: 40,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b6797',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9aa9bf',
    textDecorationLine: 'line-through',
  },
  // Bundle Styles
  bundleList: {
    paddingRight: 16,
    gap: 16,
  },
  bundleCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  bundleImage: {
    width: '100%',
    height: 180,
  },
  bundleImg: {
    width: '100%',
    height: '100%',
  },
  bundleContent: {
    padding: 16,
  },
  bundlePill: {
    backgroundColor: '#fef3c7',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 10,
  },
  bundleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 6,
  },
  bundlePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b6797',
    marginBottom: 12,
  },
  bundleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  bundleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b6797',
  },
  // Modern Review Styles for Horizontal Scroll
  horizontalReviewsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  modernReviewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 8,
  },
  quoteIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.2,
  },
  reviewRatingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b6797',
    backgroundColor: '#ebf2fb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  modernReviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4a5568',
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b6797',
  },
  modernReviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  modernReviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modernReviewerDetails: {
    flex: 1,
  },
  modernReviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2c3e',
    marginBottom: 4,
  },
  reviewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  verifiedPurchaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f3eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedPurchaseText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  reviewDateSmall: {
    fontSize: 10,
    color: '#9aa9bf',
  },
  reviewProductBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f4f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  reviewProductBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3b6797',
  },
  // Review Hero Section
  reviewsHero: {
    backgroundColor: 'white',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    padding: 24,
    marginBottom: 24,
  },
  reviewsHeroLeft: {
    flex: 1,
    minWidth: 200,
  },
  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  averageRatingNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0b2343',
  },
  averageRatingLabel: {
    fontSize: 14,
    color: '#60728d',
    marginBottom: 4,
  },
  starsLarge: {
    flexDirection: 'row',
    gap: 4,
  },
  totalReviewsText: {
    fontSize: 13,
    color: '#60728d',
    marginBottom: 20,
  },
  ratingBars: {
    gap: 8,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBarStar: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f5b042',
    width: 40,
  },
  ratingBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#f5b042',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 12,
    color: '#60728d',
    width: 30,
    textAlign: 'right',
  },
  reviewsHeroRight: {
    flex: 1,
    minWidth: 200,
    position: 'relative',
  },
  reviewsHeroImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  reviewsHeroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderRadius: 20,
  },
  reviewsHeroBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8e2ef',
  },
  reviewsHeroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b2343',
    textAlign: 'center',
  },
  reviewsSection: {
    marginBottom: 32,
  },
  reviewsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reviewsHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 8,
    textAlign: 'center',
  },
  reviewsHeaderSubtitle: {
    color: '#60728d',
    fontSize: 14,
    textAlign: 'center',
  },
  noReviewsCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  noReviewsText: {
    color: '#60728d',
    fontSize: 16,
    textAlign: 'center',
  },
  // Service Pillar Styles
  pillarCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  pillarIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ebf2fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0b2343',
  },
  pillarText: {
    fontSize: 13,
    color: '#60728d',
    lineHeight: 18,
  },
  // Wedding Promo Styles
  weddingPromo: {
    height: 400,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 32,
  },
  weddingBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  weddingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  weddingContent: {
    alignItems: 'center',
  },
  weddingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  weddingText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  weddingCta: {
    backgroundColor: '#335f93',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    gap: 8,
  },
  weddingCtaText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  // Final CTA Styles
  finalCta: {
    borderRadius: 28,
    padding: 24,
    marginTop: 16,
  },
  sectionKickerWhite: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#b7d0ea',
    marginBottom: 8,
    letterSpacing: 1,
  },
  finalCtaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  finalCtaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },
  finalCtaCopy: {
    marginBottom: 20,
  },
  finalCtaActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  whatsappButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  supportButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  supportButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});