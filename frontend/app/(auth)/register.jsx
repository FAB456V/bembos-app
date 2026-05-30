import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!nombre.trim() || !email.trim() || password.length < 8) {
      setError('Completa tus datos. La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signUp({ nombre: nombre.trim(), email: email.trim(), password, telefono: telefono.trim() });
      router.replace('/(tabs)');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>BEMBOS</Text>
      <Text style={styles.title}>Crear cuenta</Text>
      <TextInput onChangeText={setNombre} placeholder="Nombre" style={styles.input} value={nombre} />
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        keyboardType="phone-pad"
        onChangeText={setTelefono}
        placeholder="Telefono (opcional)"
        style={styles.input}
        value={telefono}
      />
      <TextInput
        autoComplete="password-new"
        onChangeText={setPassword}
        placeholder="Contrasena"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.button}>
        {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Registrarme</Text>}
      </Pressable>
      <Link href="/(auth)/login" style={styles.link}>
        Ya tengo una cuenta
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#ffffff' },
  brand: { color: '#d71920', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  title: { color: '#222222', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { borderColor: '#dddddd', borderRadius: 8, borderWidth: 1, marginBottom: 12, padding: 14 },
  error: { color: '#b00020', marginBottom: 12 },
  button: { alignItems: 'center', backgroundColor: '#d71920', borderRadius: 8, minHeight: 48, justifyContent: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  link: { color: '#d71920', marginTop: 18, textAlign: 'center' },
});
