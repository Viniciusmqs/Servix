import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export function SplashScreen({ navigation }: Props) {
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progress    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 1400, useNativeDriver: false }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Onboarding1'), 2600);
    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], marginBottom: 28 }}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
        <Text style={styles.name}>SERVIX</Text>
        <Text style={styles.tagline}>Conecte. Contrate. Confie.</Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: barWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 26,
  },
  textWrap: {
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#00C896',
    fontWeight: '500',
    letterSpacing: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 48,
    right: 48,
    height: 3,
    backgroundColor: '#1E3A5F',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00C896',
    borderRadius: 2,
  },
});
