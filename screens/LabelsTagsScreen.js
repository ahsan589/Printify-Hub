import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function LabelsAndTagsScreen() {
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

  const labelsCategory = categories.find((cat) => cat.name.toLowerCase().includes('label') || cat.name.toLowerCase().includes('tag'));
  const labelsProducts = products.filter(
    (product) => product.categoryId === labelsCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Labels & Tags"
      subtitle="Product labels, hang tags, barcode stickers, and pricing tags."
      heroImage={
        labelsCategory?.image ||
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80'
      }
      products={labelsProducts}
      emptyTitle="No Labels Found"
      emptyText="Labels and tags collection coming soon."
    />
  );
}

