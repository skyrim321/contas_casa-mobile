import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Family } from '../types';
import { FamiliaService } from '../services/familiaService';

type Tab = 'buscar' | 'criar';

export default function FamiliaScreen() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 768;

  const [tab, setTab] = useState<Tab>('buscar');

  // Buscar
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Family[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [joinedMessage, setJoinedMessage] = useState('');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // Criar
  const [descricao, setDescricao] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdFamily, setCreatedFamily] = useState<Family | null>(null);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults(null);
    setJoinedMessage('');
    try {
      const res = await FamiliaService.searchFamily(searchQuery.trim());
      setSearchResults(res.data);
      if (res.data.length === 0) setSearchError('Nenhuma família encontrada.');
    } catch {
      setSearchError('Erro ao buscar. Tente novamente.');
    } finally {
      setSearching(false);
    }
  }

  async function handleJoin(familyId: number) {
    setJoiningId(familyId);
    setJoinedMessage('');
    try {
      const res = await FamiliaService.joinFamily(familyId);
      setJoinedMessage(res.data);
    } catch {
      setJoinedMessage('Erro ao entrar na família.');
    } finally {
      setJoiningId(null);
    }
  }

  async function handleCreate() {
    if (!descricao.trim()) {
      setCreateError('Informe uma descrição para a família.');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreatedFamily(null);
    try {
      const res = await FamiliaService.createFamily({ descricao: descricao.trim() });
      setCreatedFamily(res.data);
      setDescricao('');
    } catch {
      setCreateError('Erro ao criar família. Tente novamente.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
      <Text style={styles.pageTitle}>Família</Text>
      <Text style={styles.pageSubtitle}>
        Crie uma nova família ou encontre uma existente para fazer parte.
      </Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'buscar' && styles.tabActive]}
          onPress={() => { setTab('buscar'); setCreatedFamily(null); setSearchResults(null); setJoinedMessage(''); }}
        >
          <Text style={[styles.tabText, tab === 'buscar' && styles.tabTextActive]}>
            Buscar família
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'criar' && styles.tabActive]}
          onPress={() => { setTab('criar'); setSearchResults(null); setCreatedFamily(null); setJoinedMessage(''); }}
        >
          <Text style={[styles.tabText, tab === 'criar' && styles.tabTextActive]}>
            Criar família
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab Buscar ── */}
      {tab === 'buscar' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Busque pelo ID ou descrição</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: 1 ou Sete Setembro"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.searchBtnText}>Buscar</Text>
              }
            </TouchableOpacity>
          </View>

          {searchError !== '' && <Text style={styles.errorText}>{searchError}</Text>}

          {joinedMessage !== '' && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{joinedMessage}</Text>
            </View>
          )}

          {searchResults && searchResults.map((family) => (
            <View key={family.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardFieldLabel}>ID</Text>
                <Text style={styles.cardFieldValue}>{family.id}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardFieldLabel}>Descrição</Text>
                <Text style={styles.cardFieldValue}>{family.descricao}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardFieldLabel}>Ativo</Text>
                <View style={[styles.badge, family.ativo ? styles.badgeAtivo : styles.badgeInativo]}>
                  <Text style={styles.badgeText}>{family.ativo ? 'Sim' : 'Não'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.joinBtn, joiningId === family.id && styles.joinBtnDisabled]}
                onPress={() => handleJoin(family.id)}
                disabled={joiningId === family.id}
              >
                {joiningId === family.id
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.joinBtnText}>Fazer parte desta família</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ── Tab Criar ── */}
      {tab === 'criar' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preencha os dados da nova família</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Família Silva"
              value={descricao}
              onChangeText={(v) => { setDescricao(v); setCreateError(''); }}
              maxLength={80}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>ID</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value="Gerado automaticamente"
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Ativo</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value="Sim (padrão)"
              editable={false}
            />
          </View>

          {createError !== '' && <Text style={styles.errorText}>{createError}</Text>}

          <TouchableOpacity
            style={[styles.createBtn, creating && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={creating}
          >
            {creating
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.createBtnText}>Criar família</Text>
            }
          </TouchableOpacity>

          {createdFamily && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>Família criada com sucesso!</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardFieldLabel}>ID</Text>
                <Text style={styles.cardFieldValue}>{createdFamily.id}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardFieldLabel}>Descrição</Text>
                <Text style={styles.cardFieldValue}>{createdFamily.descricao}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardFieldLabel}>Ativo</Text>
                <View style={[styles.badge, styles.badgeAtivo]}>
                  <Text style={styles.badgeText}>Sim</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f0f2f5',
  },
  scrollWide: {
    paddingHorizontal: 40,
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#e3e8f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1565c0',
  },

  // Section
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Card result
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardFieldLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    width: 80,
  },
  cardFieldValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },

  // Badge ativo
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeAtivo: {
    backgroundColor: '#e8f5e9',
  },
  badgeInativo: {
    backgroundColor: '#fce4e4',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },

  // Join button
  joinBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  joinBtnDisabled: {
    opacity: 0.6,
  },
  joinBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Create form
  formGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#aaa',
  },
  createBtn: {
    backgroundColor: '#388e3c',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Feedback
  errorText: {
    color: '#c62828',
    fontSize: 13,
    marginTop: 2,
  },
  successBanner: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  successText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
});

