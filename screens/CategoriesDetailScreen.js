import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { formatPriceDisplay, getDisplayText } from '../utils/productHelpers';

export default function CategoriesDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params || {};
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    fetchCategoryAndProducts();
  }, [categoryId]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      // Fetch category
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const foundCategory = categoriesSnap.docs.find(doc => doc.id === categoryId);
      if (foundCategory) {
        setCategory({ id: foundCategory.id, ...foundCategory.data() });
      }

      // Fetch products in category
      const productsQuery = query(collection(db, 'products'), where('categoryId', '==', categoryId));
      const productsSnap = await getDocs(productsQuery);
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef4fb' }}>
        <ActivityIndicator size="large" color="#3b6797" />
      </View>
    );
  }

  return (
    <CategoryShowcasePage
      title={category?.name || 'Category'}
      subtitle={category?.description || 'Explore products in this category.'}
      heroImage={category?.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80'}
      products={products}
      emptyTitle="No Products Found"
      emptyText="Check back soon or add products to this category from admin."
      fromCategory={true}
    />
  );
}

