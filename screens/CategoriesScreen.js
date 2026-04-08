import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,

} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'categories'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoriesDetail', { categoryId: item.id })}
    >
      <View style={styles.categoryImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.categoryImg} />
        ) : (
          <View style={[styles.categoryPlaceholder, { backgroundColor: item.color || '#3b6797' }]}>
            <Text style={styles.categoryPlaceholderText}>{item.name?.charAt(0) || 'C'}</Text>
          </View>
        )}
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryDesc}>{item.description || 'Browse products'}</Text>
      <View style={styles.categoryFooter}>
        <Text style={styles.categoryAction}>Open Category</Text>
        <Ionicons name="chevron-forward" size={16} color="#335f93" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoryList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Product Categories</Text>
            <Text style={styles.subtitle}>Choose the section that matches what you want to print.</Text>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0b2343',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#60728d',
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  categoryRow: {
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
  },
  categoryList: {
    paddingBottom: 40,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryImage: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPlaceholderText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b2343',
    marginBottom: 6,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#60728d',
    lineHeight: 16,
    marginBottom: 12,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#335f93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef4fb',
  },
  loadingText: {
    marginTop: 12,
    color: '#60728d',
    fontSize: 16,
  },
});

export default CategoriesScreen;