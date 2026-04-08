import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, TextInput,
  Platform, Modal, Share, Animated
} from 'react-native';
import LottieView from 'lottie-react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GAP = 4;
const PADDING = 6;
const COLUMN_COUNT = 2;
const COLUMN_WIDTH = (screenWidth - PADDING * 2 - GAP) / COLUMN_COUNT;

// Preview image size (not fullscreen)
const PREVIEW_WIDTH = screenWidth * 0.85;
const PREVIEW_HEIGHT = screenHeight * 0.6;

const GalleryScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [imageHeights, setImageHeights] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const scaleAnims = useRef(new Map());
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchGalleryImages(); }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'products'));
      const data = snap.docs.flatMap(doc => {
        const d = doc.data();
        return (d.images || []).map((imageUrl, i) => ({
          id: `${doc.id}_${i}`,
          title: d.name,
          category: d.category || 'Uncategorized',
          imageUrl,
          productId: doc.id,
        }));
      }).filter(Boolean);
      setImages(data);
    } catch (err) {
      console.error('Gallery fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onImageLoad = useCallback((id, event) => {
    const { width, height } = event.nativeEvent.source;
    const ratio = height / width;
    setImageHeights(prev => ({ ...prev, [id]: COLUMN_WIDTH * ratio }));
  }, []);

  const filtered = images.filter(img => {
    const searchMatch = searchText.trim() === '' ||
      img.title.toLowerCase().includes(searchText.toLowerCase()) ||
      img.category.toLowerCase().includes(searchText.toLowerCase());
    return searchMatch;
  });

  const leftCol = filtered.filter((_, i) => i % 2 === 0);
  const rightCol = filtered.filter((_, i) => i % 2 !== 0);

  const getScaleAnim = (id) => {
    if (!scaleAnims.current.has(id)) {
      scaleAnims.current.set(id, new Animated.Value(1));
    }
    return scaleAnims.current.get(id);
  };

  const handlePressIn = (id) => {
    Animated.spring(getScaleAnim(id), {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = (id) => {
    Animated.spring(getScaleAnim(id), {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const renderPin = (item) => {
    const imgHeight = imageHeights[item.id] ?? COLUMN_WIDTH * 1.4;
    const scaleAnim = getScaleAnim(item.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.pin}
          activeOpacity={0.9}
          onPress={() => {
            setPreviewImage(item);
            Animated.parallel([
              Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
              Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
            ]).start();
          }}
          onPressIn={() => handlePressIn(item.id)}
          onPressOut={() => handlePressOut(item.id)}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.pinImg, { height: imgHeight }]}
            resizeMode="cover"
            onLoad={(e) => onImageLoad(item.id, e)}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(() => setPreviewImage(null));
  };

  const handleShare = async (imageUrl, title) => {
    try {
      await Share.share({
        message: `Check out this design: ${title || 'Print'}\n${imageUrl}`,
        url: imageUrl,
        title: title || 'Share Design',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

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
        <Text style={styles.loadingText}>Loading gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Print Gallery</Text>
          <Ionicons name="share-social-outline" size={22} color="#64748b" />
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search designs..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.masonry}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={56} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No matching images</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          <View style={styles.columns}>
            <View style={styles.col}>{leftCol.map(renderPin)}</View>
            <View style={styles.col}>{rightCol.map(renderPin)}</View>
          </View>
        )}
      </ScrollView>

      {/* Transparent Preview Modal - no background card, just the image */}
      <Modal
        visible={previewImage !== null}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeModal} activeOpacity={1} />
          <Animated.View style={[styles.previewContainer, { transform: [{ scale: modalScale }] }]}>
            {previewImage && (
              <Image
                source={{ uri: previewImage.imageUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.previewCloseButton} onPress={closeModal}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.previewShareButton}
              onPress={() => handleShare(previewImage?.imageUrl, previewImage?.title)}
            >
              <Ionicons name="share-social" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#0f172a' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a', padding: 0 },
  masonry: { padding: PADDING },
  columns: { flexDirection: 'row', gap: GAP },
  col: { flex: 1, gap: GAP },
  pin: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  pinImg: { width: '100%', backgroundColor: '#e2e8f0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748b' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#475569', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 6 },
  
  // Transparent preview styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // fully transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    backgroundColor: 'transparent', // no background card
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  
  },
  previewCloseButton: {
    position: 'absolute',
    top: -40, // above the image
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  previewShareButton: {
    position: 'absolute',
    top: -40,
    left: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
});

export default GalleryScreen;