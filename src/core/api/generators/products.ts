import type { HealthConcern, Product, ProductCategory } from '@/features/shop/types';

import { SeededRandom } from './seed';

const CATEGORIES: readonly ProductCategory[] = [
  'Hair Care',
  'Skin Care',
  'Digestion & Gut',
  'Immunity',
  'Stress & Sleep',
  'Joint Care',
  'Women Health',
  'Men Health',
];

const HEALTH_CONCERNS: readonly HealthConcern[] = [
  'Hair Fall',
  'Dandruff',
  'Acne & Blemishes',
  'Acidity & Bloating',
  'Insomnia',
  'Joint Pain',
  'Low Energy',
  'Hormonal Balance',
];

const VERIFIED_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108',
  'https://images.unsplash.com/photo-1617897903246-719242758050',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b',
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908',
  'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec',
  'https://images.unsplash.com/photo-1508759073847-9ca702cec7d2',
  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
];

const PRODUCT_BASES = [
  { name: 'Kuntal Care Hair Spa', cat: 'Hair Care', concern: 'Hair Fall', size: '200g' },
  { name: 'Bhringraj & Shikakai Oil', cat: 'Hair Care', concern: 'Dandruff', size: '200ml' },
  {
    name: 'Kumkumadi Tailam Glow Serum',
    cat: 'Skin Care',
    concern: 'Acne & Blemishes',
    size: '30ml',
  },
  {
    name: 'Neem & Aloe Face Cleanser',
    cat: 'Skin Care',
    concern: 'Acne & Blemishes',
    size: '150ml',
  },
  {
    name: 'Triphala Churna Digestive',
    cat: 'Digestion & Gut',
    concern: 'Acidity & Bloating',
    size: '100g',
  },
  {
    name: 'Pachak Amrit Gut Tonic',
    cat: 'Digestion & Gut',
    concern: 'Acidity & Bloating',
    size: '200ml',
  },
  { name: 'Chyawanprash Gold Blend', cat: 'Immunity', concern: 'Low Energy', size: '500g' },
  { name: 'Giloy & Tulsi Immunity Drops', cat: 'Immunity', concern: 'Low Energy', size: '50ml' },
  {
    name: 'Ashwagandha Churna Stress Relief',
    cat: 'Stress & Sleep',
    concern: 'Insomnia',
    size: '100g',
  },
  {
    name: 'Brahmi & Shankhpushpi Syrup',
    cat: 'Stress & Sleep',
    concern: 'Insomnia',
    size: '200ml',
  },
  { name: 'Orthokey Pain Relief Oil', cat: 'Joint Care', concern: 'Joint Pain', size: '100ml' },
  { name: 'Shallaki & Guggulu Tablets', cat: 'Joint Care', concern: 'Joint Pain', size: '60 tabs' },
  {
    name: 'Nari Sondarya Malt Women Tonic',
    cat: 'Women Health',
    concern: 'Hormonal Balance',
    size: '400g',
  },
  {
    name: 'Shatavari Hormonal Care',
    cat: 'Women Health',
    concern: 'Hormonal Balance',
    size: '60 caps',
  },
  { name: 'Amrutam Gold Vitality Malt', cat: 'Men Health', concern: 'Low Energy', size: '400g' },
  { name: 'Shilajit Pure Himalayan Resin', cat: 'Men Health', concern: 'Low Energy', size: '20g' },
];

const HERBS = [
  'Ashwagandha',
  'Brahmi',
  'Bhringraj',
  'Amla',
  'Shatavari',
  'Guduchi',
  'Manjistha',
  'Triphala',
  'Neem',
  'Tulsi',
];

export function generateProducts(count = 20000): Product[] {
  const rng = new SeededRandom(108);
  const products: Product[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const base = rng.pick(PRODUCT_BASES);
    const id = `prod_${i + 1}`;
    const variantNum = Math.floor(i / PRODUCT_BASES.length) + 1;
    const name = variantNum === 1 ? base.name : `${base.name} - Batch #${variantNum}`;
    const category = (base.cat as ProductCategory) ?? rng.pick(CATEGORIES);
    const concern = (base.concern as HealthConcern) ?? rng.pick(HEALTH_CONCERNS);
    const originalPrice = rng.nextInt(25, 350) * 10;
    const discount = rng.nextInt(5, 30);
    const price = Math.round(originalPrice * (1 - discount / 100));
    const rating = Number((4.1 + rng.next() * 0.89).toFixed(1));
    const stockCount = rng.nextInt(0, 150);
    const baseImageUrl = VERIFIED_PRODUCT_IMAGES[i % VERIFIED_PRODUCT_IMAGES.length];

    products[i] = {
      id,
      name,
      subtitle: `Authentic Ayurvedic formulation with ${rng.pick(HERBS)}`,
      category,
      healthConcerns: [concern],
      price,
      originalPrice,
      discountPercentage: discount,
      rating,
      reviewCount: rng.nextInt(15, 2400),
      inStock: stockCount > 0,
      stockCount,
      imageUrl: `${baseImageUrl}?w=400&auto=format&fit=crop&q=80`,
      description: `Amrutam's handcrafted ${name} is made using classical Ayurvedic texts, infused with concentrated herbal decoctions.`,
      ingredients: rng.pickMultiple(HERBS, 4),
      benefits: [
        'Supports cellular rejuvenation',
        'Balances Tridoshas',
        '100% natural and preservative-free',
      ],
      howToUse:
        'Take 1-2 teaspoons twice daily with warm milk or water, or apply topically as directed.',
      size: base.size,
      isBestseller: rng.next() > 0.8,
    };
  }

  return products;
}
