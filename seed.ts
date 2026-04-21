import { getSupabaseClient } from './src/storage/database/supabase-client';

const client = getSupabaseClient()!;

if (!client) {
  console.error('Failed to initialize Supabase client. Check environment variables.');
  process.exit(1);
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Create categories
    console.log('Creating categories...');
    const { data: categories, error: catError } = await client
      .from('categories')
      .insert([
        {
          name: 'Electronics',
          slug: 'electronics',
          description: 'Latest electronic devices and gadgets',
          image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
        },
        {
          name: 'Clothing',
          slug: 'clothing',
          description: 'Fashion and apparel for all occasions',
          image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
        },
        {
          name: 'Home & Garden',
          slug: 'home-garden',
          description: 'Everything for your home and garden',
          image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
        },
        {
          name: 'Sports & Outdoors',
          slug: 'sports-outdoors',
          description: 'Equipment for your outdoor adventures',
          image_url: 'https://images.unsplash.com/photo-1461896836934- voices-of-the-forest?w=800',
        },
      ])
      .select();

    if (catError) {
      console.error('Error creating categories:', catError);
    } else {
      console.log(`✓ Created ${categories?.length || 0} categories`);
    }

    // 2. Create products
    console.log('Creating products...');
    const { data: createdCategories } = await client
      .from('categories')
      .select('id, slug')
      .order('name');

    const categoryMap = createdCategories?.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>) || {};

    const products = [
      // Electronics
      {
        name: 'Wireless Headphones Pro',
        slug: 'wireless-headphones-pro',
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.',
        price: 199.99,
        compare_price: 249.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        images: [],
        stock: 50,
        category_id: categoryMap['electronics'],
        is_active: true,
        is_featured: true,
      },
      {
        name: 'Smart Watch Series X',
        slug: 'smart-watch-series-x',
        description: 'Advanced smartwatch with health tracking, GPS, water resistance, and seamless smartphone integration. Track your fitness and stay connected.',
        price: 349.99,
        compare_price: 399.99,
        image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        images: [],
        stock: 30,
        category_id: categoryMap['electronics'],
        is_active: true,
        is_featured: true,
      },
      {
        name: 'Portable Bluetooth Speaker',
        slug: 'portable-bluetooth-speaker',
        description: 'Compact Bluetooth speaker with powerful 360° sound, waterproof design, and 12-hour battery. Take your music anywhere.',
        price: 79.99,
        compare_price: 99.99,
        image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
        images: [],
        stock: 100,
        category_id: categoryMap['electronics'],
        is_active: true,
        is_featured: false,
      },

      // Clothing
      {
        name: 'Premium Cotton T-Shirt',
        slug: 'premium-cotton-tshirt',
        description: 'Comfortable 100% organic cotton t-shirt with a modern fit. Available in multiple colors. Perfect for everyday wear.',
        price: 29.99,
        compare_price: 39.99,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        images: [],
        stock: 200,
        category_id: categoryMap['clothing'],
        is_active: true,
        is_featured: false,
      },
      {
        name: 'Classic Denim Jacket',
        slug: 'classic-denim-jacket',
        description: 'Timeless denim jacket with vintage-inspired design. Features multiple pockets, button closure, and a comfortable relaxed fit.',
        price: 89.99,
        compare_price: 119.99,
        image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800',
        images: [],
        stock: 75,
        category_id: categoryMap['clothing'],
        is_active: true,
        is_featured: true,
      },
      {
        name: 'Running Shoes Elite',
        slug: 'running-shoes-elite',
        description: 'High-performance running shoes with advanced cushioning technology, breathable mesh upper, and durable outsole. Maximum comfort for long runs.',
        price: 129.99,
        compare_price: 159.99,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        images: [],
        stock: 60,
        category_id: categoryMap['clothing'],
        is_active: true,
        is_featured: true,
      },

      // Home & Garden
      {
        name: 'Modern Table Lamp',
        slug: 'modern-table-lamp',
        description: 'Elegant table lamp with minimalist design. Features dimmable LED light, USB charging port, and touch controls. Perfect for any room.',
        price: 59.99,
        compare_price: 79.99,
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        images: [],
        stock: 45,
        category_id: categoryMap['home-garden'],
        is_active: true,
        is_featured: false,
      },
      {
        name: 'Indoor Plant Set',
        slug: 'indoor-plant-set',
        description: 'Set of 3 beautiful indoor plants with decorative pots. Includes care instructions. Perfect for adding greenery to your home.',
        price: 49.99,
        compare_price: 69.99,
        image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800',
        images: [],
        stock: 30,
        category_id: categoryMap['home-garden'],
        is_active: true,
        is_featured: false,
      },

      // Sports & Outdoors
      {
        name: 'Yoga Mat Premium',
        slug: 'yoga-mat-premium',
        description: 'Extra thick yoga mat with non-slip surface and alignment lines. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
        price: 39.99,
        compare_price: 54.99,
        image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
        images: [],
        stock: 80,
        category_id: categoryMap['sports-outdoors'],
        is_active: true,
        is_featured: false,
      },
      {
        name: 'Hiking Backpack 40L',
        slug: 'hiking-backpack-40l',
        description: 'Durable 40L hiking backpack with multiple compartments, rain cover, and comfortable padded straps. Perfect for day hikes and overnight trips.',
        price: 79.99,
        compare_price: 99.99,
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        images: [],
        stock: 40,
        category_id: categoryMap['sports-outdoors'],
        is_active: true,
        is_featured: true,
      },
    ];

    const { data: createdProducts, error: prodError } = await client
      .from('products')
      .insert(products)
      .select();

    if (prodError) {
      console.error('Error creating products:', prodError);
    } else {
      console.log(`✓ Created ${createdProducts?.length || 0} products`);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => {
    console.log('Seed completed. Press Ctrl+C to exit.');
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
