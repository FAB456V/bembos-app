import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Ingresa tu email y contrasena.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={require('../assents/Bembos.png')} style={styles.logo} />
          <Text style={styles.headerCaption}>Sabor peruano que se disfruta</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>¡Bienvenido de vuelta!</Text>
            <Text style={styles.subtitle}>Ingresa para disfrutar tus favoritos.</Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="nombre@correo.com"
                placeholderTextColor="#8A8A8A"
                style={styles.input}
                value={email}
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>●</Text>
              <TextInput
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#8A8A8A"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </Pressable>

            <Link href="/(auth)/register" style={styles.link}>
              ¿No tienes cuenta? <Text style={styles.linkHighlight}>Regístrate</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: '#1300D0',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 44,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  logo: { height: 112, marginBottom: 8, resizeMode: 'contain', width: 112 },
  headerCaption: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 4,
    marginTop: -22,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  title: { color: '#1A1A1A', fontSize: 25, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#666666', fontSize: 15, lineHeight: 21, marginBottom: 24 },
  label: { color: '#1A1A1A', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8D8D8',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  inputIcon: { color: '#1300D0', fontSize: 17, fontWeight: '900', marginRight: 10 },
  input: { color: '#1A1A1A', flex: 1, fontSize: 15, paddingVertical: 14 },
  error: { color: '#E30613', fontSize: 13, fontWeight: '600', marginBottom: 14 },
  button: {
    alignItems: 'center',
    backgroundColor: '#1300D0',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 52,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  link: { color: '#555555', fontSize: 14, marginTop: 20, textAlign: 'center' },
  linkHighlight: { color: '#E30613', fontWeight: '800' },
});
