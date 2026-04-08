import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  findPricingMatrixMatch,
  formatCurrency,
  formatPriceDisplay,
  groupCustomizationOptions,
  isBundleProduct,
  buildWhatsAppMessage,
} from '../utils/productHelpers';

const PHONE_NUMBER = '923101788571';
const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallPhone = width <= 375;

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params || {};

  // Core states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [selectedCustomizationOptions, setSelectedCustomizationOptions] = useState({});
  const [bundlePreview, setBundlePreview] = useState(null);
  const [showPickerFor, setShowPickerFor] = useState(null);

  // Review states
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const bundleMode = product ? isBundleProduct(product) : false;
  const customizationEnabled = product?.customizationEnabled || product?.customizationGroups?.length > 0;

  // Fetch product and ratings
  useEffect(() => {
    if (!productId) return;
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = { id: productSnap.id, ...productSnap.data() };
        setProduct(productData);
        fetchRatings(productData.id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (prodId) => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('productId', '==', prodId));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data());
      const total = reviews.length;
      if (total > 0) {
        const avg = reviews.reduce((sum, rev) => sum + rev.rating, 0) / total;
        setAverageRating(avg);
        setTotalReviews(total);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // Pricing logic (direct port from web)
  const basePrice = useMemo(() => product?.price ?? 0, [product]);
  const numericBasePrice = useMemo(() => {
    if (typeof basePrice === 'number') return basePrice;
    const num = Number(basePrice?.toString().replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  }, [basePrice]);

  const allCustomizationGroups = useMemo(() => {
    if (product?.customizationGroups?.length) {
      return product.customizationGroups.map((group) => ({
        label: group.name,
        options: (group.options || []).map((option) => ({
          label: option,
          price: 0,
          raw: option,
          groupLabel: group.name,
        })),
        useInPricing: group.useInPricing ?? true,
      }));
    }
    return groupCustomizationOptions(
      product?.customizationOptions || [],
      product?.customizationTitle || 'Customization'
    ).map((group) => ({ ...group, useInPricing: true }));
  }, [product]);

  const pricingGroups = useMemo(
    () => allCustomizationGroups.filter((g) => g.useInPricing),
    [allCustomizationGroups]
  );

  const pricingSelections = useMemo(() => {
    const selections = {};
    pricingGroups.forEach((group) => {
      const value = selectedCustomizationOptions[group.label];
      if (value) selections[group.label] = value;
    });
    return selections;
  }, [selectedCustomizationOptions, pricingGroups]);

  const allPricingSelected = useMemo(
    () => pricingGroups.length === 0 || pricingGroups.every((g) => Boolean(selectedCustomizationOptions[g.label])),
    [selectedCustomizationOptions, pricingGroups]
  );

  const hasPricingMatrix = Array.isArray(product?.pricingMatrix) && product.pricingMatrix.length > 0;
  const matchedPricingRow = hasPricingMatrix 
    ? findPricingMatrixMatch(product.pricingMatrix, pricingSelections, pricingGroups)
    : null;
  const matrixPrice = matchedPricingRow ? Number(matchedPricingRow.price) : 0;

  const selectedAddOnItems = allCustomizationGroups
    .filter((g) => !g.useInPricing)
    .flatMap((g) => g.options.filter((opt) => opt.raw === selectedCustomizationOptions[g.label]))
    .filter(Boolean);
  const addOnPrice = selectedAddOnItems.reduce((total, opt) => total + Number(opt.price || 0), 0);

  const finalUnitPrice = hasPricingMatrix && matchedPricingRow 
    ? (Number(matchedPricingRow.price) || 0)
    : numericBasePrice + addOnPrice;
  const totalPrice = finalUnitPrice * quantity;

  const handleQuoteRequest = async () => {
    if (!product) return;

    const customizationMessage = [
      ...allCustomizationGroups
        .flatMap((group) => {
          const selected = group.options.find((opt) => opt.raw === selectedCustomizationOptions[group.label]);
          if (selected) {
            return `${group.label}: ${selected.label}${selected.price ? ` (+${formatCurrency(selected.price)})` : ''}`;
          }
          return [];
        }),
      customizationDetails?.trim(),
    ].filter(Boolean).join(' | ');

    const messageData = {
      ...product,
      price: finalUnitPrice,
      __customizationMessage: customizationMessage,
    };
    const message = buildWhatsAppMessage(messageData);
    const url = `whatsapp://send?phone=${PHONE_NUMBER}&text=${message}`;
    
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('WhatsApp not installed', 'Please install WhatsApp to send inquiry.');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewerName.trim() || !reviewComment.trim() || rating < 1 || rating > 5) {
      Alert.alert('Invalid input', 'Please fill name, comment, and valid rating (1-5).');
      return;
    }

    setReviewSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        productName: product.name,
        userName: reviewerName.trim(),
        rating: Number(rating),
        comment: reviewComment.trim(),
        timestamp: new Date().toISOString(),
      });
      fetchRatings(product.id);
      Alert.alert('Success', 'Review submitted! Thank you.');
      setReviewerName('');
      setReviewComment('');
      setRating(5);
    } catch (error) {
      console.error('Review error:', error);
      Alert.alert('Error', 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (ratingValue) => {
    const fullStars = Math.floor(ratingValue);
    const hasHalf = ratingValue % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    const starSize = isTablet ? 24 : isSmallPhone ? 16 : 20;
    
    return (
      <View style={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={starSize} color="#fbbf24" />
        ))}
        {hasHalf && <Ionicons name="star-half" size={starSize} color="#fbbf24" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={starSize} color="#d1d5db" />
        ))}
      </View>
    );
  };

  const CustomDropdown = ({ group, value, onValueChange }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedOption = group.options.find(opt => opt.raw === value);
    
    return (
      <>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.dropdownButtonText,
            !value && styles.dropdownPlaceholder
          ]}>
            {selectedOption ? 
              `${selectedOption.label}${selectedOption.price ? ` (+${formatCurrency(selectedOption.price)})` : ''}` 
              : 'Choose an option'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#335f93" />
        </TouchableOpacity>
        
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalPickerContainer, {
              width: width * 0.9,
              maxHeight: height * 0.7,
            }]}>
              <View style={styles.modalPickerHeader}>
                <Text style={styles.modalPickerTitle}>{group.label}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#0b2343" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity 
                  style={styles.modalPickerOption}
                  onPress={() => {
                    onValueChange('');
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalPickerOptionText}>Choose an option</Text>
                  {value === '' && <Ionicons name="checkmark" size={20} color="#335f93" />}
                </TouchableOpacity>
                {group.options.map((option) => (
                  <TouchableOpacity
                    key={option.raw}
                    style={styles.modalPickerOption}
                    onPress={() => {
                      onValueChange(option.raw);
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.modalPickerOptionContent}>
                      <Text style={styles.modalPickerOptionText}>
                        {option.label}
                      </Text>
                      {option.price > 0 && (
                        <Text style={styles.modalPickerOptionPrice}>
                          +{formatCurrency(option.price)}
                        </Text>
                      )}
                    </View>
                    {value === option.raw && <Ionicons name="checkmark" size={20} color="#335f93" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const renderCustomizationGroup = ({ item: group }) => (
    <View style={styles.customizationField}>
      <Text style={styles.customizationLabel}>{group.label}</Text>
      <CustomDropdown
        group={group}
        value={selectedCustomizationOptions[group.label] || ''}
        onValueChange={(value) =>
          setSelectedCustomizationOptions(prev => ({ ...prev, [group.label]: value }))
        }
      />
    </View>
  );

  const renderBundleItem = ({ item, index }) => (
    <TouchableOpacity style={styles.bundleItemRow} onPress={() => setBundlePreview({ src: item.image, title: item.title })}>
      <View style={styles.bundleItemThumb}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.bundleItemImage} />
        ) : (
          <View style={styles.bundleItemPlaceholder} />
        )}
      </View>
      <View style={styles.bundleItemCopy}>
        <Text style={styles.bundleItemTitle} numberOfLines={2}>{item.title}</Text>
        {item.details && <Text style={styles.bundleItemDetails} numberOfLines={1}>{item.details}</Text>}
      </View>
      <View style={styles.bundleItemPrices}>
        {item.originalPrice && (
          <Text style={styles.bundleItemOld}>{formatCurrency(item.originalPrice)}</Text>
        )}
        <Text style={styles.bundleItemNew}>{formatCurrency(item.price || 0)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
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
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={isTablet ? 28 : 24} color="#0b2343" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
        </View>

        {/* Gallery */}
        <View style={styles.gallerySection}>
          <Image 
            source={{ uri: product.images?.[selectedImage] }} 
            style={[styles.mainImage, { height: isTablet ? 400 : isSmallPhone ? 250 : 300 }]} 
          />
          {product.images && product.images.length > 1 && (
            <FlatList
              data={product.images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `thumb-${index}`}
              renderItem={({ index }) => (
                <TouchableOpacity
                  style={[styles.thumbnail, selectedImage === index && styles.thumbnailActive]}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image source={{ uri: product.images[index] }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.thumbnailContainer}
            />
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <Text style={styles.productTitle}>{product.name}</Text>
            <Text style={styles.price}>{formatPriceDisplay(basePrice)}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {renderStars(averageRating)}
            <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}> ({totalReviews} reviews)</Text>
          </View>

          {product.sku && (
            <View style={styles.skuRow}>
              <Text style={styles.skuLabel}>SKU:</Text>
              <Text style={styles.skuValue}>{product.sku}</Text>
            </View>
          )}

          {product.description && <Text style={styles.description}>{product.description}</Text>}

          {/* Customizations */}
          {customizationEnabled && allCustomizationGroups.length > 0 && (
            <View style={styles.customizationSection}>
              <Text style={styles.sectionTitle}>Customization</Text>
              <FlatList
                data={allCustomizationGroups}
                renderItem={renderCustomizationGroup}
                keyExtractor={(item) => item.label}
                scrollEnabled={false}
              />
              {hasPricingMatrix && !allPricingSelected && (
                <Text style={styles.priceNote}>⚠️ Select all pricing options for matrix pricing</Text>
              )}
            </View>
          )}

          {/* Always visible unit price */}
          <View style={styles.priceSummary}>
            <Text style={styles.finalPrice}>Unit Price: {formatCurrency(finalUnitPrice)}</Text>
            {hasPricingMatrix && matchedPricingRow && (
              <Text style={styles.matrixNote}>Matrix: {formatCurrency(matrixPrice)}</Text>
            )}
            {addOnPrice > 0 && (
              <Text style={styles.addonNote}>Add-ons: +{formatCurrency(addOnPrice)}</Text>
            )}
          </View>

          {/* Bundle Items */}
          {bundleMode && product.bundleItems?.length > 0 && (
            <View style={styles.bundleItemsSection}>
              <Text style={styles.sectionTitle}>Bundle Items</Text>
              <FlatList
                data={product.bundleItems}
                renderItem={renderBundleItem}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Specs */}
          {product.specs?.length > 0 && (
            <View style={styles.specsSection}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {product.specs.map((spec, index) => (
                <View key={index} style={styles.specRow}>
                  <MaterialIcons name="fiber-manual-record" size={12} color="#335f93" />
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Review Form */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            <View style={styles.reviewForm}>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={reviewerName}
                onChangeText={setReviewerName}
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.starInput}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starBtn}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons 
                      name={star <= rating ? 'star' : 'star-outline'} 
                      size={isTablet ? 32 : 28} 
                      color="#fbbf24" 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Share your experience..."
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={[styles.submitBtn, reviewSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmitReview}
                disabled={reviewSubmitting}
              >
                <Text style={styles.submitBtnText}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={isTablet ? 24 : 20} color="#335f93" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={isTablet ? 24 : 20} color="#335f93" />
              </TouchableOpacity>
            </View>
            <Text style={styles.totalText}>Total: {formatCurrency(totalPrice)}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleQuoteRequest}>
              <Text style={styles.primaryBtnText}>Request Quote on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bundle Preview Modal */}
      <Modal
        visible={!!bundlePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setBundlePreview(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBundlePreview(null)}
        >
          <View style={[styles.modalContent, { width: width * 0.9 }]}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setBundlePreview(null)}
            >
              <Ionicons name="close" size={28} color="#0b2343" />
            </TouchableOpacity>
            {bundlePreview?.src && (
              <Image source={{ uri: bundlePreview.src }} style={[styles.modalImage, { height: isTablet ? 400 : 300 }]} />
            )}
            {bundlePreview?.title && <Text style={styles.modalTitle}>{bundlePreview.title}</Text>}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#eef4fb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginVertical: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#0b2343',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerBack: {
    padding: 8,
  },
  headerTitle: {
    fontSize: width >= 768 ? 20 : 18,
    fontWeight: '700',
    color: '#0b2343',
    marginLeft: 16,
    flex: 1,
  },
  gallerySection: {
    backgroundColor: 'white',
    padding: width >= 768 ? 24 : 16,
  },
  mainImage: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  thumbnailContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  thumbnail: {
    width: width >= 768 ? 80 : 70,
    height: width >= 768 ? 80 : 70,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#335f93',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    flex: 1,
    backgroundColor: 'white',
    padding: width >= 768 ? 24 : 20,
    marginTop: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: width >= 768 ? 28 : 24,
    fontWeight: '700',
    color: '#0b2343',
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: width >= 768 ? 28 : 24,
    fontWeight: '800',
    color: '#0b2343',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  stars: {
    flexDirection: 'row',
  },
  ratingValue: {
    fontWeight: '600',
    color: '#0b2343',
    marginLeft: 8,
    fontSize: width >= 768 ? 18 : 16,
  },
  ratingCount: {
    fontSize: width >= 768 ? 16 : 14,
    color: '#64748b',
    marginLeft: 4,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  skuLabel: {
    color: '#64748b',
    marginRight: 8,
    fontWeight: '600',
  },
  skuValue: {
    fontWeight: '700',
    color: '#1f2937',
  },
  description: {
    fontSize: width >= 768 ? 18 : 16,
    lineHeight: width >= 768 ? 28 : 24,
    color: '#475569',
    marginBottom: 20,
  },
  customizationSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: width >= 768 ? 20 : 18,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 16,
  },
  customizationField: {
    marginBottom: 16,
  },
  customizationLabel: {
    fontSize: width >= 768 ? 18 : 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: width >= 768 ? 17 : 16,
    color: '#1f2937',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b2343',
  },
  modalPickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalPickerOptionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPickerOptionText: {
    fontSize: 16,
    color: '#334155',
    flex: 1,
  },
  modalPickerOptionPrice: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 8,
  },
  priceNote: {
    color: '#b45309',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  priceSummary: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  finalPrice: {
    fontWeight: '700',
    color: '#0b2343',
    textAlign: 'center',
    fontSize: width >= 768 ? 18 : 16,
  },
  matrixNote: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
    textAlign: 'center',
  },
  addonNote: {
    fontSize: 14,
    color: '#b45309',
    marginTop: 2,
    textAlign: 'center',
  },
  bundleItemsSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bundleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  bundleItemThumb: {
    width: width >= 768 ? 60 : 50,
    height: width >= 768 ? 60 : 50,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginRight: 12,
    overflow: 'hidden',
  },
  bundleItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  bundleItemPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  bundleItemCopy: {
    flex: 1,
    marginRight: 12,
  },
  bundleItemTitle: {
    fontWeight: '600',
    color: '#374151',
    fontSize: width >= 768 ? 16 : 15,
  },
  bundleItemDetails: {
    fontSize: width >= 768 ? 14 : 13,
    color: '#6b7280',
  },
  bundleItemPrices: {
    alignItems: 'flex-end',
  },
  bundleItemOld: {
    fontSize: width >= 768 ? 13 : 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  bundleItemNew: {
    fontWeight: '700',
    color: '#111827',
    fontSize: width >= 768 ? 16 : 14,
  },
  specsSection: {
    marginBottom: 20,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  specText: {
    fontSize: width >= 768 ? 16 : 15,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
  },
  reviewSection: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  reviewForm: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: width >= 768 ? 17 : 16,
    backgroundColor: 'white',
  },
  textarea: {
    minHeight: 100,
    paddingTop: 12,
  },
  starInput: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starBtn: {
    padding: 4,
  },
  submitBtn: {
    backgroundColor: '#0b2343',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: width >= 768 ? 17 : 16,
  },
  actionsSection: {
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
  },
  quantityBtn: {
    width: width >= 768 ? 52 : 44,
    height: width >= 768 ? 52 : 44,
    borderRadius: width >= 768 ? 26 : 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityText: {
    fontSize: width >= 768 ? 24 : 20,
    fontWeight: '800',
    color: '#0b2343',
    marginHorizontal: 20,
  },
  totalText: {
    fontSize: width >= 768 ? 24 : 20,
    fontWeight: '800',
    color: '#0b2343',
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#0b2343',
    paddingVertical: width >= 768 ? 18 : 16,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: width >= 768 ? 18 : 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 35, 67, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  modalTitle: {
    marginTop: 12,
    fontSize: width >= 768 ? 20 : 18,
    fontWeight: '700',
    color: '#0b2343',
    textAlign: 'center',
  },
});