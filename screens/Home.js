import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TextInput, Pressable, ScrollView 
} from 'react-native';
import * as SQLite from 'expo-sqlite';

// Initialize the DB
const db = SQLite.openDatabaseSync('little_lemon');
const API_URL = 'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json';
const sections = ['starters', 'mains', 'desserts', 'drinks'];

const Home = () => {
  const [menuData, setMenuData] = useState([]);
  const [searchBarText, setSearchBarText] = useState('');
  const [query, setQuery] = useState('');
  const [filterSelections, setFilterSelections] = useState(sections.map(() => false));

  // --- Step 4: Debounce logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(searchBarText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchBarText]);

  // --- Initial Table Setup & Data Fetching ---
  useEffect(() => {
    (async () => {
      try {
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY NOT NULL, 
            name TEXT, 
            price TEXT, 
            description TEXT, 
            image TEXT, 
            category TEXT
          );
        `);

        const allRows = await db.getAllAsync('SELECT * FROM menu');

        if (allRows.length === 0) {
          const response = await fetch(API_URL);
          const json = await response.json();
          for (const item of json.menu) {
            await db.runAsync(
              'INSERT INTO menu (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)',
              [item.name, item.price, item.description, item.image, item.category]
            );
          }
          const freshRows = await db.getAllAsync('SELECT * FROM menu');
          setMenuData(freshRows);
        } else {
          setMenuData(allRows);
        }
      } catch (e) {
        console.error("DB Init Error:", e);
      }
    })();
  }, []);

  // --- Step 2 & 4: Live Filtering (Compound Query) ---
  useEffect(() => {
    (async () => {
      try {
        const activeCategories = sections.filter((s, i) => filterSelections[i]);
        
        let sql = 'SELECT * FROM menu';
        let params = [];
        let conditions = [];

        if (query) {
          conditions.push('name LIKE ?');
          params.push(`%${query}%`);
        }

        if (activeCategories.length > 0) {
          const placeholders = activeCategories.map(() => '?').join(', ');
          conditions.push(`category IN (${placeholders})`);
          params.push(...activeCategories);
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        const results = await db.getAllAsync(sql, params);
        setMenuData(results);
      } catch (e) {
        console.error("Filter Error:", e);
      }
    })();
  }, [query, filterSelections]);

  const handleFiltersChange = (index) => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index];
    setFilterSelections(arrayCopy);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
      </View>
      <Image 
        source={{ uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true` }} 
        style={styles.itemImage} 
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero Banner Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Little Lemon</Text>
        <View style={styles.heroInner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroSubtitle}>Chicago</Text>
            <Text style={styles.heroText}>
              We are a family owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.
            </Text>
          </View>
          <Image source={require('../assets/images/hero.jpg')} style={styles.heroImage} />
        </View>
        <TextInput 
          style={styles.searchBar} 
          placeholder="Search" 
          placeholderTextColor="#495E57"
          value={searchBarText}
          onChangeText={setSearchBarText}
        />
      </View>

      <Text style={styles.orderTitle}>ORDER FOR DELIVERY!</Text>
      
      {/* Step 1: Scrollable Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sections.map((section, index) => (
            <Pressable
              key={section}
              onPress={() => handleFiltersChange(index)}
              style={[
                styles.pill,
                filterSelections[index] && styles.pillActive
              ]}
            >
              <Text style={[
                styles.pillText, 
                filterSelections[index] && styles.pillTextActive
              ]}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={menuData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
        <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No dishes found matching your search.</Text>
        </View>
  }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroSection: { backgroundColor: '#495E57', padding: 20 },
  heroTitle: { color: '#F4CE14', fontSize: 40, fontWeight: 'bold', fontFamily: 'MarkaziText_400Regular' },
  heroInner: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  heroLeft: { flex: 0.7 },
  heroSubtitle: { color: '#fff', fontSize: 24, fontWeight: '600' },
  heroText: { color: '#fff', fontSize: 14, marginTop: 10 },
  heroImage: { width: 100, height: 100, borderRadius: 15 },
  searchBar: { backgroundColor: '#EDEFEE', borderRadius: 8, padding: 12, marginTop: 10, fontSize: 16 },
  orderTitle: { fontSize: 18, fontWeight: 'bold', margin: 20 },
  categoriesContainer: { paddingLeft: 20, marginBottom: 20 },
  pill: { backgroundColor: '#EDEFEE', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, marginRight: 15 },
  pillActive: { backgroundColor: '#495E57' },
  pillText: { fontWeight: 'bold', color: '#495E57' },
  pillTextActive: { color: '#EDEFEE' },
  itemContainer: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  itemTextContainer: { flex: 0.7 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  itemDescription: { color: '#495E57', marginVertical: 5 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#495E57' },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  divider: { height: 1, backgroundColor: '#EDEFEE', marginHorizontal: 20 },
  emptyContainer: {padding: 40, alignItems: 'center',},
  emptyText: {color: '#495E57', fontSize: 16, textAlign: 'center', fontWeight: '600'},
});

export default Home;