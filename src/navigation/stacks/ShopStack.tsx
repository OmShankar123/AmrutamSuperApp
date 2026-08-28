import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CartScreen } from '@/features/shop/screens/CartScreen';
import { ProductCatalogScreen } from '@/features/shop/screens/ProductCatalogScreen';
import { WishlistScreen } from '@/features/shop/screens/WishlistScreen';

import type { ShopStackParamList } from '../types';

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
    </Stack.Navigator>
  );
}
