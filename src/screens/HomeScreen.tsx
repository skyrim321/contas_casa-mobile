import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { session, logout } = useAuth();

  if (!session) return null;

  const loginAtFormatted = session.loginAt.toLocaleString('pt-BR');

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo, {session.username}!</Text>

      <View style={styles.card}>
        <Text style={styles.label}>ID da Sessão</Text>
        <Text style={styles.value}>{session.sessionId}</Text>

        <Text style={styles.label}>Início da Sessão</Text>
        <Text style={styles.value}>{loginAtFormatted}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  button: {
    width: '100%',
    backgroundColor: '#e53935',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
