import type { Product } from '@/features/shop/types';

describe('Ayurvedic Cart & AYUSH Discount Computations', () => {
  const mockProductA: Product = {
    id: 'prod_1',
    name: 'Amrutam Kuntal Care Hair Oil',
    subtitle: 'Herbal Hair Growth Formulation',
    category: 'Hair Care',
    healthConcerns: ['Hair Fall', 'Dandruff'],
    price: 450,
    originalPrice: 500,
    discountPercentage: 10,
    rating: 4.8,
    reviewCount: 320,
    inStock: true,
    stockCount: 15,
    size: '200 ml',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-07f9c2d1b0ef?w=600',
    description: 'Classical Ayurvedic herb formulation.',
    ingredients: ['Bhringraj', 'Amla', 'Neem'],
    benefits: ['Promotes healthy follicles', 'Scalp nourishment'],
    howToUse: 'Apply gently to roots before sleep.',
  };

  const mockProductB: Product = {
    id: 'prod_2',
    name: 'Amrutam Chyawanprash Gold Blend',
    subtitle: 'Authentic Ayurvedic Formulation',
    category: 'Immunity',
    healthConcerns: ['Low Energy'],
    price: 650,
    originalPrice: 750,
    discountPercentage: 13,
    rating: 4.9,
    reviewCount: 450,
    inStock: true,
    stockCount: 20,
    size: '500 g',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    description: 'Gold blend immunity enhancer.',
    ingredients: ['Amalaki', 'Gold Bhasma', 'Ghee'],
    benefits: ['Boosts natural immunity', 'Restores vitality'],
    howToUse: '1 teaspoon daily with milk.',
  };

  function computeCartSummary(items: { product: Product; quantity: number }[]) {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    // 10% AYUSH Discount on orders >= 1000
    const discount = subtotal >= 1000 ? Math.round(subtotal * 0.1) : 0;
    // Free delivery on orders >= 500
    const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 50;
    const total = subtotal - discount + deliveryFee;

    return { subtotal, itemCount, discount, deliveryFee, total };
  }

  test('correctly calculates subtotal and applies delivery fee for orders below 500', () => {
    const items = [{ product: mockProductA, quantity: 1 }]; // subtotal: 450
    const summary = computeCartSummary(items);

    expect(summary.subtotal).toBe(450);
    expect(summary.itemCount).toBe(1);
    expect(summary.deliveryFee).toBe(50);
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(500);
  });

  test('applies free delivery for orders above 500 and no discount under 1000', () => {
    const items = [{ product: mockProductB, quantity: 1 }]; // subtotal: 650
    const summary = computeCartSummary(items);

    expect(summary.subtotal).toBe(650);
    expect(summary.deliveryFee).toBe(0);
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(650);
  });

  test('applies 10% AYUSH discount and free delivery when subtotal >= 1000', () => {
    const items = [
      { product: mockProductA, quantity: 1 }, // 450
      { product: mockProductB, quantity: 1 }, // 650
    ]; // subtotal: 1100
    const summary = computeCartSummary(items);

    expect(summary.subtotal).toBe(1100);
    expect(summary.itemCount).toBe(2);
    expect(summary.deliveryFee).toBe(0);
    expect(summary.discount).toBe(110); // 10% of 1100
    expect(summary.total).toBe(990); // 1100 - 110
  });
});
