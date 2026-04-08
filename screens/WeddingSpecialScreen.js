import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function WeddingSpecialScreen() {
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
    return null; // Header provides space
  }

  const weddingCategory = categories.find((cat) => cat.name.toLowerCase().includes('wedding'));
  const weddingProducts = products.filter(
    (product) => product.categoryId === weddingCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Wedding Special"
      subtitle="Elegant wedding cards, invitations, gift packaging, and event stationery."
      heroImage={
        weddingCategory?.image ||
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80'
      }
      products={weddingProducts}
      emptyTitle="No Wedding Products Found"
      emptyText="Wedding special collection coming soon."
    />
  );
}

