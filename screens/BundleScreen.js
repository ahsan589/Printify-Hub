import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency, formatPriceDisplay, isBundleProduct, getDisplayText } from '../utils/productHelpers';

const BundleScreen = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsSnap = await getDocs(collection(db, 'products'));
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Responsive columns
  const getGridColumns = useCallback(() => {
    if (screenWidth >= 1000) return 3;
    if (screenWidth >= 700) return 2;
    return 1;
  }, [screenWidth]);

  // Filter bundle products
  const bundleProducts = useMemo(() => {
    return products.filter((product) => {
      if (isBundleProduct(product)) return true;
      const category = categories.find((item) => item.id === product.categoryId);
      return category?.name?.toLowerCase().includes('bundle');
    });
  }, [products, categories]);

  // Group bundle products
  const bundleGroups = useMemo(() => {
    const groups = new Map();
    bundleProducts.forEach((product) => {
      let groupName = (product.bundleGroup || 'All Bundles').trim();
      if (groupName === '') groupName = 'All Bundles';
      if (!groups.has(groupName)) groups.set(groupName, []);
      groups.get(groupName).push(product);
    });
    
    const groupArray = Array.from(groups.entries()).map(([name, items]) => ({
      name,
      items,
    }));
    
    // Sort: 'All Bundles' first, then alphabetically
    return groupArray.sort((a, b) => {
      if (a.name === 'All Bundles') return -1;
      if (b.name === 'All Bundles') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [bundleProducts]);

  // Reset activeGroup if current group no longer exists
  useEffect(() => {
    if (activeGroup !== 'all') {
      const groupExists = bundleGroups.some(group => group.name === activeGroup);
      if (!groupExists) setActiveGroup('all');
    }
  }, [bundleGroups, activeGroup]);

  const visibleGroups = useMemo(() => {
    if (activeGroup === 'all') return bundleGroups;
    return bundleGroups.filter((group) => group.name === activeGroup);
  }, [activeGroup, bundleGroups]);

  const startingPrice = useMemo(() => {
    const prices = bundleProducts
      .map((product) => product.price)
      .filter((price) => typeof price === 'number' && Number.isFinite(price) && price > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [bundleProducts]);

  const handleFilterPress = useCallback((groupName) => {
    setActiveGroup(groupName === 'All Bundles' ? 'all' : groupName);
  }, []);

  const renderFilterChip = useCallback(({ item }) => {
    const isActive = item === 'All Bundles' 
      ? activeGroup === 'all' 
      : activeGroup === item;
    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => handleFilterPress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  }, [activeGroup, handleFilterPress]);

  const renderBundleCard = useCallback(({ item: product }) => {
    // ✅ FIXED: Use original working navigation pattern
    const handlePress = () => {
      navigation.navigate('Categories', {
        screen: 'ProductDetails',
        params: { productId: product.id },
      });
    };

    return (
      <TouchableOpacity 
        style={styles.bundleCard}
        onPress={handlePress}
        activeOpacity={0.92}
      >
        <View style={styles.bundleCardImage}>
          <Image
            source={{
              uri: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80'
            }}
            style={styles.bundleCardImg}
            resizeMode="cover"
          />
        </View>
        <View style={styles.bundleCardBody}>
          <View style={styles.bundleCardTag}>
            <Text style={styles.bundleCardTagText}>{product.bundleGroup || 'Bundle'}</Text>
          </View>
          <Text style={styles.bundleCardTitle} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.bundleCardDesc} numberOfLines={3}>
            {getDisplayText(
              product.discountText || product.shortNote || product.description,
              'Open bundle details to see included items and request custom quantities.'
            )}
          </Text>
          <View style={styles.bundleCardFooter}>
            <Text style={styles.bundleCardPrice}>{formatPriceDisplay(product.price)}</Text>
            <View style={styles.arrowLink}>
              <Text style={styles.arrowText}>View Details</Text>
              <Feather name="arrow-right" size={16} color="#335f93" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  const renderGroupSection = useCallback(({ item: group }) => {
    const numColumns = getGridColumns();
    return (
      <View style={styles.bundleGroup}>
        <View style={styles.groupHead}>
          <View style={styles.groupHeadText}>
            <Text style={styles.groupKicker}>Bundle Group</Text>
            <Text style={styles.groupTitle}>{group.name}</Text>
          </View>
          <View style={styles.groupCount}>
            <Text style={styles.groupCountText}>{group.items.length} {group.items.length === 1 ? 'item' : 'items'}</Text>
          </View>
        </View>
        <FlatList
          data={group.items}
          keyExtractor={(item) => item.id}
          renderItem={renderBundleCard}
          numColumns={numColumns}
          key={`group-${group.name}-${numColumns}`}
          contentContainerStyle={styles.bundleCardGrid}
          scrollEnabled={false}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        />
      </View>
    );
  }, [renderBundleCard, getGridColumns]);

  const filterData = useMemo(() => {
    const groupNames = bundleGroups.map(g => g.name);
    const uniqueGroups = groupNames.filter(name => name !== 'All Bundles');
    return ['All Bundles', ...uniqueGroups];
  }, [bundleGroups]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eef4fb" />
        <View style={styles.loadingContainer}>
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
          <Text style={styles.loadingText}>Loading bundles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef4fb" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Ready-Made Bundles</Text>
          <Text style={styles.heroTitle}>Simple bundle offers for faster ordering.</Text>
          <Text style={styles.heroSubtitle}>
            Choose a bundle group, open the option you like, and send an inquiry for pricing,
            quantity, or customization. This page is kept simple so it is easier to browse.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Feather name="package" size={24} color="#335f93" />
              <View>
                <Text style={styles.statNumber}>{bundleProducts.length}</Text>
                <Text style={styles.statLabel}>Bundle products</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Feather name="layers" size={24} color="#335f93" />
              <View>
                <Text style={styles.statNumber}>{bundleGroups.length}</Text>
                <Text style={styles.statLabel}>Bundle groups</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View>
                <Text style={styles.statNumber}>
                  {startingPrice ? formatCurrency(startingPrice) : 'Inquiry'}
                </Text>
                <Text style={styles.statLabel}>Starting price</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        {filterData.length > 1 && (
          <FlatList
            data={filterData}
            keyExtractor={(item, idx) => `filter-${idx}-${item}`}
            renderItem={renderFilterChip}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={styles.filterList}
          />
        )}

        {/* Bundle Groups */}
        {visibleGroups.length > 0 ? (
          <FlatList
            data={visibleGroups}
            keyExtractor={(item) => `group-${item.name}`}
            renderItem={renderGroupSection}
            contentContainerStyle={styles.groupStack}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Feather name="package" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No bundles added yet</Text>
            <Text style={styles.emptySubtitle}>
              Add bundle-type products from admin and they will appear here automatically.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  heroKicker: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#335f93',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0b2343',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#4a5a72',
    lineHeight: 22,
    marginBottom: 24,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b2343',
  },
  statLabel: {
    fontSize: 13,
    color: '#5a6e8a',
    marginTop: 2,
  },
  filterList: {
    marginBottom: 20,
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: 40,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: '#0b2343',
    borderColor: '#0b2343',
  },
  filterChipText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1e2f4a',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  groupStack: {
    gap: 16,
  },
  bundleGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  groupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 12,
  },
  groupHeadText: {
    flex: 1,
  },
  groupKicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#335f93',
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0b2343',
    lineHeight: 26,
  },
  groupCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff3f9',
    borderRadius: 40,
  },
  groupCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#335f93',
  },
  bundleCardGrid: {
    gap: 14,
  },
  columnWrapper: {
    gap: 14,
    justifyContent: 'space-between',
  },
  bundleCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eef2f6',
    overflow: 'hidden',
    shadowColor: '#0b2343',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  bundleCardImage: {
    height: 170,
    backgroundColor: '#f1f5f9',
  },
  bundleCardImg: {
    width: '100%',
    height: '100%',
  },
  bundleCardBody: {
    padding: 14,
    gap: 8,
  },
  bundleCardTag: {
    alignSelf: 'flex-start',
  },
  bundleCardTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#335f93',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#eff3f9',
    borderRadius: 30,
    overflow: 'hidden',
  },
  bundleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b2343',
    lineHeight: 22,
  },
  bundleCardDesc: {
    fontSize: 13,
    color: '#5a6e8a',
    lineHeight: 20,
  },
  bundleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#eef2f6',
  },
  bundleCardPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0b2343',
  },
  arrowLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  arrowText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#335f93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b2343',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#5a6e8a',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#5a6e8a',
    fontSize: 15,
  },
});

export default BundleScreen;