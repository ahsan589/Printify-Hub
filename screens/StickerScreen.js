import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function StickerScreen() {
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

  const stickerCategory = categories.find((cat) => cat.name.toLowerCase().includes('sticker'));
  const stickerProducts = products.filter(
    (product) => product.categoryId === stickerCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Stickers"
      subtitle="Custom vinyl stickers, labels, decals for branding and packaging."
      heroImage={
        stickerCategory?.image ||
        'https://images.unsplash.com/photo-1577405912987-a0f7a5af143b?auto=format&fit=crop&w=1600&q=80'
      }
      products={stickerProducts}
      emptyTitle="No Stickers Found"
      emptyText="Sticker collection coming soon."
    />
  );
}

