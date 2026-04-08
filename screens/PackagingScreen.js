import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function PackagingScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsSnap = await getDocs(collection(db, 'products'));
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const categoriesData = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return null;
  }

  const packagingCategory = categories.find((cat) => cat.name.toLowerCase().includes('packaging') || cat.name.toLowerCase().includes('box'));
  const packagingProducts = products.filter(
    (product) => product.categoryId === packagingCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Packaging"
      subtitle="Smart packaging solutions for retail, shipping, gifting, and branded presentation."
      heroImage={
        packagingCategory?.image ||
        'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80'
      }
      products={packagingProducts}
      emptyTitle="No Packaging Products Found"
      emptyText="Check back soon for our packaging collection."
    />
  );
}

