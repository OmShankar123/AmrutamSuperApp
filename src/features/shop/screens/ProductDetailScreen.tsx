import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ProductDetailScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shop — Product Detail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAF8',
  },
  text: { fontSize: 18, fontWeight: '600', color: '#2D6A4F' },
});
