import { db } from './src/db';
import { settings, products, categories, brands, pricelists, discounts, localizations, paymentGateways, notifications } from './src/db/schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Seeding database...');

  try {
    // Check if brands already exist
    const existingBrands = await db.select().from(brands).limit(1);
    let brandId;
    if (existingBrands.length === 0) {
      brandId = uuidv4();
      await db.insert(brands).values({
        id: brandId,
        name: 'TAYFA Luxury',
        slug: 'tayfa-luxury',
        description: 'Premium luxury brand',
      });
    } else {
      brandId = existingBrands[0].id;
    }

    // Check if categories already exist
    const existingCategories = await db.select().from(categories).limit(1);
    let catId;
    if (existingCategories.length === 0) {
      catId = uuidv4();
      await db.insert(categories).values({
        id: catId,
        name: 'Clothing',
        slug: 'clothing',
        description: 'Luxury clothing',
      });
    } else {
      catId = existingCategories[0].id;
    }

    // Seed Pricelists if empty
    const existingPricelists = await db.select().from(pricelists).limit(1);
    if (existingPricelists.length === 0) {
      await db.insert(pricelists).values({
        id: uuidv4(),
        name: 'Standard Pricelist',
        description: 'Default pricing for all customers',
        currency: 'PKR',
        isActive: true,
      });
    }

    // Seed Discounts if empty
    const existingDiscounts = await db.select().from(discounts).limit(1);
    if (existingDiscounts.length === 0) {
      await db.insert(discounts).values({
        id: uuidv4(),
        name: 'Welcome Discount',
        description: '10% off for new customers',
        type: 'percentage',
        value: '10.00',
        minPurchase: '1000.00',
        isActive: true,
      });
    }

    // Seed SEO Settings if empty
    const existingSettings = await db.select().from(settings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(settings).values({
        id: uuidv4(),
        key: 'seo_global',
        value: {
          title: 'TAYFA | Luxury Marketplace',
          description: 'The ultimate destination for luxury fashion and accessories.',
          keywords: 'luxury, fashion, marketplace, premium',
        },
        description: 'Global SEO settings',
      });

      await db.insert(settings).values({
        id: uuidv4(),
        key: 'seo_pages',
        value: [
          { path: '/', title: 'Home | TAYFA', description: 'Welcome to TAYFA' },
          { path: '/shop', title: 'Shop | TAYFA', description: 'Browse our collection' },
        ],
        description: 'Page-specific SEO settings',
      });
    }

    // Seed Products if empty
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      await db.insert(products).values({
        id: uuidv4(),
        name: 'Silk Evening Gown',
        slug: 'silk-evening-gown',
        brandId: brandId,
        categoryId: catId,
        price: '12500.00',
        description: 'A beautiful silk evening gown for special occasions.',
        images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop'],
        status: 'published',
        isFeatured: true,
      });
    }

    // Seed Localizations if empty
    const existingLocalizations = await db.select().from(localizations).limit(1);
    if (existingLocalizations.length === 0) {
      console.log('Seeding localizations...');
      await db.insert(localizations).values([
        {
          id: uuidv4(),
          code: 'en',
          name: 'English',
          isDefault: true,
          isActive: true,
          translations: {
            'home': 'Home',
            'shop': 'Shop',
            'cart': 'Cart',
            'checkout': 'Checkout',
            'account': 'Account'
          }
        },
        {
          id: uuidv4(),
          code: 'ur',
          name: 'Urdu',
          isDefault: false,
          isActive: true,
          translations: {
            'home': 'گھر',
            'shop': 'دکان',
            'cart': 'ٹوکری',
            'checkout': 'چیک آؤٹ',
            'account': 'اکاؤنٹ'
          }
        }
      ]);
    }

    // Seed Payment Gateways if empty
    const existingGateways = await db.select().from(paymentGateways).limit(1);
    if (existingGateways.length === 0) {
      console.log('Seeding payment gateways...');
      await db.insert(paymentGateways).values([
        {
          id: uuidv4(),
          name: 'Stripe',
          code: 'stripe',
          type: 'card',
          status: true,
          isDefault: true
        },
        {
          id: uuidv4(),
          name: 'PayPal',
          code: 'paypal',
          type: 'wallet',
          status: true,
          isDefault: false
        }
      ]);
    }

    // Seed Notifications if empty
    const existingNotifications = await db.select().from(notifications).limit(1);
    if (existingNotifications.length === 0) {
      console.log('Seeding notifications...');
      await db.insert(notifications).values([
        {
          id: uuidv4(),
          title: 'Welcome to TAYFA',
          message: 'Your admin account has been successfully set up.',
          type: 'success',
          isRead: false
        },
        {
          id: uuidv4(),
          title: 'System Update',
          message: 'The platform has been updated to version 2.0.',
          type: 'info',
          isRead: true
        }
      ]);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();
