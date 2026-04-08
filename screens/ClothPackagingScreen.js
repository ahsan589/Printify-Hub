import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function ClothPackagingScreen() {
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

  const clothCategory = categories.find((cat) => cat.name.toLowerCase().includes('cloth'));
  const clothProducts = products.filter(
    (product) => product.categoryId === clothCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Cloth Packaging"
      subtitle="Premium cloth bags, fabric pouches, and textile packaging solutions."
      heroImage={
        clothCategory?.image ||
        'https://images.unsplash.com/photo-1581235707031-0156d95d3cde?auto=format&fit=crop&w=1600&q=80'
      }
      products={clothProducts}
      emptyTitle="No Cloth Packaging Found"
      emptyText="Cloth packaging collection coming soon."
    />
  );
}

