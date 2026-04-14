import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import FamiliaScreen from './FamiliaScreen';

const MENU_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'familia', label: 'Família' },
];

export default function HomeScreen() {
  const { session, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 768;
  const [activeMenu, setActiveMenu] = useState('home');

  if (!session) return null;

  const sidebar = (
    <View style={[styles.sidebar, isWide ? styles.sidebarWide : styles.sidebarTop]}>
      {!isWide && (
        <Text style={styles.sidebarTitle}>Contas da Casa</Text>
      )}
      <View style={isWide ? styles.menuVertical : styles.menuHorizontal}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.menuItem,
              isWide ? styles.menuItemVertical : styles.menuItemHorizontal,
              activeMenu === item.key && styles.menuItemActive,
            ]}
            onPress={() => setActiveMenu(item.key)}
          >
            <Text
              style={[
                styles.menuItemText,
                activeMenu === item.key && styles.menuItemTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isWide && (
        <TouchableOpacity style={styles.logoutSidebar} onPress={logout}>
          <Text style={styles.logoutSidebarText}>Sair</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const header = isWide ? (
    <View style={styles.headerWide}>
      <Text style={styles.headerTitle}>Contas da Casa</Text>
      <View style={styles.headerRight}>
        <Text style={styles.headerUser}>{session.user.username}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.headerMobile}>
      <Text style={styles.headerTitleMobile}>Contas da Casa</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );

  const body = activeMenu === 'familia' ? (
    <FamiliaScreen />
  ) : (
    <ScrollView
      contentContainerStyle={styles.bodyContent}
      style={styles.body}
    >
      <Text style={styles.bodyGreeting}>
        Bem vindo ao aplicativo, {session.user.name}!
      </Text>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.root}>
      {header}
      <View style={styles.layout}>
        {isWide && sidebar}
        <View style={styles.mainArea}>
          {!isWide && sidebar}
          {body}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  // Header
  headerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1976d2',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerUser: {
    color: '#e3f2fd',
    fontSize: 14,
  },
  headerMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleMobile: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Layout
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainArea: {
    flex: 1,
  },

  // Sidebar
  sidebar: {
    backgroundColor: '#1565c0',
  },
  sidebarWide: {
    width: 220,
    paddingTop: 24,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  sidebarTop: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  menuVertical: {
    flexDirection: 'column',
    gap: 4,
  },
  menuHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItem: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemVertical: {
    width: '100%',
  },
  menuItemHorizontal: {
    marginRight: 4,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuItemText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  menuItemTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutSidebar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  logoutSidebarText: {
    color: '#ef9a9a',
    fontSize: 14,
    fontWeight: '600',
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 24,
  },
  bodyGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  bodySection: {
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  bodyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bodyCardText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});
