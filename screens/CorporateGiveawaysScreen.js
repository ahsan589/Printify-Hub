import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function CorporateGiveawaysScreen() {
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

  const corporateCategory = categories.find((cat) => cat.name.toLowerCase().includes('corporate') || cat.name.toLowerCase().includes('giveaway'));
  const corporateProducts = products.filter(
    (product) => product.categoryId === corporateCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Corporate Giveaways"
      subtitle="Branded mugs, pens, notebooks, and promotional merchandise for events and clients."
      heroImage={
        corporateCategory?.image ||
        'https://images.unsplash.com/photo-1558618047-3c8c76ffe6f4?auto=format&fit=crop&w=1600&q=80'
      }
      products={corporateProducts}
      emptyTitle="No Corporate Giveaways Found"
      emptyText="Corporate giveaways collection coming soon."
    />
  );
}

