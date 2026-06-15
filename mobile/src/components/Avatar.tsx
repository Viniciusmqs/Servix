import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface AvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: number;
  fontSize?: number;
  backgroundColor?: string;
}

export function Avatar({ name, avatarUrl, size = 46, fontSize, backgroundColor }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const fSize = fontSize ?? Math.round(size * 0.4);
  const bgColor = backgroundColor ?? Colors.primary;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        defaultSource={undefined}
      />
    );
  }

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.text, { fontSize: fSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '700' },
});
