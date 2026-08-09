import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, ProductType } from '../lib/generated/prisma/client';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? '');
const prisma = new PrismaClient({ adapter });

const PLACEHOLDER_COLORS: Record<ProductType, string> = {
  MOBILE: '#0F172A',
  LAPTOP: '#2563EB',
  ACCESSORY: '#06B6D4',
  GADGET: '#F59E0B',
};

// Lives outside public/images/ deliberately: that directory is mounted as a
// persistent volume in production (see README) so admin-uploaded files
// survive redeploys, and Railway volumes are not overlays — anything baked
// into the image at the mount path would be hidden the moment it attaches.
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'seed', 'products');

/**
 * Generates a simple flat-color placeholder product image so the storefront
 * never renders broken images before real product photography is uploaded
 * through the admin panel.
 */
function ensurePlaceholderImage(
  slug: string,
  brand: string,
  name: string,
  type: ProductType,
): string {
  const color = PLACEHOLDER_COLORS[type];
  const words = name.split(' ');
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${color}"/>
  <circle cx="400" cy="400" r="220" fill="#ffffff" opacity="0.06"/>
  <text x="400" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" letter-spacing="4" fill="#ffffff" opacity="0.7">${brand.toUpperCase()}</text>
  <text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff">${line1}</text>
  <text x="400" y="466" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff">${line2}</text>
</svg>`;

  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const filePath = path.join(IMAGES_DIR, `${slug}.svg`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  return `/seed/products/${slug}.svg`;
}

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

const categories: CategorySeed[] = [
  {
    name: 'Mobile Phones',
    slug: 'mobile-phones',
    description: 'Latest smartphones from leading brands.',
    displayOrder: 1,
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    description: 'Laptops for work, study, and gaming.',
    displayOrder: 2,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'General mobile and laptop accessories.',
    displayOrder: 3,
  },
  {
    name: 'Gadgets',
    slug: 'gadgets',
    description: 'Speakers, wearables, and everyday tech gadgets.',
    displayOrder: 4,
  },
  {
    name: 'Chargers & Cables',
    slug: 'chargers-cables',
    description: 'Fast chargers, adapters, and cables.',
    displayOrder: 5,
  },
  {
    name: 'Earphones & Headphones',
    slug: 'earphones-headphones',
    description: 'Wired and wireless audio devices.',
    displayOrder: 6,
  },
  {
    name: 'Smart Watches',
    slug: 'smart-watches',
    description: 'Fitness bands and smart watches.',
    displayOrder: 7,
  },
  {
    name: 'Power Banks',
    slug: 'power-banks',
    description: 'Portable charging solutions.',
    displayOrder: 8,
  },
  {
    name: 'Cases & Covers',
    slug: 'cases-covers',
    description: 'Protective cases for phones and laptops.',
    displayOrder: 9,
  },
  {
    name: 'Screen Protectors',
    slug: 'screen-protectors',
    description: 'Tempered glass and film screen protectors.',
    displayOrder: 10,
  },
  {
    name: 'Other Electronics',
    slug: 'other-electronics',
    description: 'Additional electronics and computer peripherals.',
    displayOrder: 11,
  },
];

type ServiceSeed = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  startingPrice: number;
  displayOrder: number;
};

const services: ServiceSeed[] = [
  {
    name: 'Mobile Repair',
    slug: 'mobile-repair',
    shortDescription: 'Complete diagnostics and repair for all smartphone brands.',
    description:
      'Our technicians repair hardware and software issues for all major smartphone brands, with genuine parts and warranty on labor.',
    startingPrice: 500,
    displayOrder: 1,
  },
  {
    name: 'Laptop Repair',
    slug: 'laptop-repair',
    shortDescription: 'Full laptop diagnostics, repair, and servicing.',
    description:
      'From boot failures to hardware faults, we diagnose and repair laptops across all major brands.',
    startingPrice: 800,
    displayOrder: 2,
  },
  {
    name: 'Display / Screen Replacement',
    slug: 'screen-replacement',
    shortDescription: 'Cracked or damaged screen replacement for phones and laptops.',
    description:
      'We replace cracked, unresponsive, or damaged displays using quality-tested replacement parts.',
    startingPrice: 1500,
    displayOrder: 3,
  },
  {
    name: 'Battery Replacement',
    slug: 'battery-replacement',
    shortDescription: 'Restore battery life with genuine replacement batteries.',
    description:
      'Fast battery health diagnosis and replacement for phones and laptops that no longer hold a charge.',
    startingPrice: 1200,
    displayOrder: 4,
  },
  {
    name: 'Charging Port Repair',
    slug: 'charging-port-repair',
    shortDescription: 'Fix loose or non-functioning charging ports.',
    description: 'Charging port cleaning, repair, and replacement for phones and laptops.',
    startingPrice: 700,
    displayOrder: 5,
  },
  {
    name: 'Mic & Speaker Repair',
    slug: 'mic-speaker-repair',
    shortDescription: 'Repair for microphone and speaker issues.',
    description: 'Diagnose and fix microphone, earpiece, and speaker faults on mobile devices.',
    startingPrice: 600,
    displayOrder: 6,
  },
  {
    name: 'Software Installation',
    slug: 'software-installation',
    shortDescription: 'OS installation, updates, and software setup.',
    description:
      'Operating system installation, software setup, and system optimization for laptops and phones.',
    startingPrice: 500,
    displayOrder: 7,
  },
  {
    name: 'Phone Troubleshooting',
    slug: 'phone-troubleshooting',
    shortDescription: 'Diagnose and resolve smartphone software issues.',
    description: 'General troubleshooting for freezing, crashing, or malfunctioning smartphones.',
    startingPrice: 300,
    displayOrder: 8,
  },
  {
    name: 'Laptop Troubleshooting',
    slug: 'laptop-troubleshooting',
    shortDescription: 'Diagnose and resolve laptop performance issues.',
    description: 'General troubleshooting for slow, overheating, or malfunctioning laptops.',
    startingPrice: 400,
    displayOrder: 9,
  },
  {
    name: 'Water Damage Repair',
    slug: 'water-damage-repair',
    shortDescription: 'Emergency diagnostics and repair for liquid-damaged devices.',
    description:
      'Rapid disassembly, cleaning, and component-level repair for water-damaged phones and laptops.',
    startingPrice: 1000,
    displayOrder: 10,
  },
  {
    name: 'Hardware Repair',
    slug: 'hardware-repair',
    shortDescription: 'Component-level hardware diagnostics and repair.',
    description: 'Motherboard-level diagnostics and repair for complex hardware faults.',
    startingPrice: 1500,
    displayOrder: 11,
  },
  {
    name: 'General Maintenance',
    slug: 'general-maintenance',
    shortDescription: 'Routine cleaning and maintenance for phones and laptops.',
    description:
      'Internal cleaning, thermal paste replacement, and general upkeep to extend device lifespan.',
    startingPrice: 400,
    displayOrder: 12,
  },
  {
    name: 'Apple Care Service',
    slug: 'apple-care-service',
    shortDescription: 'Specialized repair and support for all Apple devices.',
    description:
      'Dedicated repair service for iPhone, iPad, and MacBook covering screens, batteries, and hardware faults.',
    startingPrice: 1500,
    displayOrder: 13,
  },
  {
    name: 'Phone & Laptop Unlock Service',
    slug: 'unlock-service',
    shortDescription: 'Carrier and pattern/PIN unlock services.',
    description:
      'Unlock service for carrier-locked phones and devices locked out of pattern, PIN, or account access.',
    startingPrice: 800,
    displayOrder: 14,
  },
];

type ProductSeed = {
  name: string;
  sku: string;
  brand: string;
  categorySlug: string;
  productType: ProductType;
  price: number;
  discountPrice?: number;
  stock: number;
  warranty: string;
  shortDescription: string;
  description: string;
  tags: string[];
  flags: Partial<{
    isNew: boolean;
    isFeatured: boolean;
    isBestSeller: boolean;
    isTopSale: boolean;
    isRecommended: boolean;
    isOnSale: boolean;
  }>;
  specs: [string, string][];
};

const products: ProductSeed[] = [
  {
    name: 'Samsung Galaxy S24 Ultra 256GB',
    sku: 'MOB-SAM-S24U-256',
    brand: 'Samsung',
    categorySlug: 'mobile-phones',
    productType: 'MOBILE',
    price: 189999,
    discountPrice: 179999,
    stock: 8,
    warranty: '1 Year Official Warranty',
    shortDescription: 'Flagship Samsung smartphone with S Pen and 200MP camera.',
    description:
      'The Samsung Galaxy S24 Ultra combines a titanium frame, a 200MP main camera, and Galaxy AI features for a true flagship experience.',
    tags: ['samsung', 'galaxy', 'flagship', '5g'],
    flags: { isNew: true, isFeatured: true, isOnSale: true },
    specs: [
      ['Display', '6.8" Dynamic AMOLED 2X, 120Hz'],
      ['Processor', 'Snapdragon 8 Gen 3'],
      ['RAM', '12GB'],
      ['Storage', '256GB'],
      ['Battery', '5000mAh'],
    ],
  },
  {
    name: 'Apple iPhone 15 Pro 128GB',
    sku: 'MOB-APL-IP15P-128',
    brand: 'Apple',
    categorySlug: 'mobile-phones',
    productType: 'MOBILE',
    price: 209999,
    stock: 6,
    warranty: '1 Year Apple Warranty',
    shortDescription: 'Titanium iPhone 15 Pro with A17 Pro chip.',
    description:
      'iPhone 15 Pro features a titanium design, A17 Pro chip, and a pro camera system with a 48MP main sensor.',
    tags: ['apple', 'iphone', 'flagship', '5g'],
    flags: { isFeatured: true, isBestSeller: true },
    specs: [
      ['Display', '6.1" Super Retina XDR'],
      ['Processor', 'A17 Pro'],
      ['Storage', '128GB'],
      ['Battery', 'Up to 23 hours video'],
    ],
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro 5G',
    sku: 'MOB-XIA-RN13P-256',
    brand: 'Xiaomi',
    categorySlug: 'mobile-phones',
    productType: 'MOBILE',
    price: 42999,
    discountPrice: 38999,
    stock: 15,
    warranty: '1 Year Official Warranty',
    shortDescription: 'Affordable 5G performer with 200MP camera.',
    description:
      'Redmi Note 13 Pro 5G offers a 200MP main camera, AMOLED display, and fast charging at a mid-range price point.',
    tags: ['xiaomi', 'redmi', '5g', 'value'],
    flags: { isNew: true, isOnSale: true, isTopSale: true },
    specs: [
      ['Display', '6.67" AMOLED, 120Hz'],
      ['Processor', 'Snapdragon 7s Gen 2'],
      ['RAM', '8GB'],
      ['Storage', '256GB'],
    ],
  },
  {
    name: 'Vivo V30 5G',
    sku: 'MOB-VIV-V30-256',
    brand: 'Vivo',
    categorySlug: 'mobile-phones',
    productType: 'MOBILE',
    price: 54999,
    stock: 10,
    warranty: '1 Year Official Warranty',
    shortDescription: 'Stylish design with Aura Light portrait camera.',
    description:
      'Vivo V30 5G features a slim design, Aura Light front camera, and smooth 120Hz curved display.',
    tags: ['vivo', '5g', 'camera'],
    flags: { isRecommended: true },
    specs: [
      ['Display', '6.78" AMOLED, 120Hz'],
      ['RAM', '8GB'],
      ['Storage', '256GB'],
    ],
  },
  {
    name: 'Oppo Reno 11',
    sku: 'MOB-OPP-R11-256',
    brand: 'Oppo',
    categorySlug: 'mobile-phones',
    productType: 'MOBILE',
    price: 49999,
    discountPrice: 46999,
    stock: 12,
    warranty: '1 Year Official Warranty',
    shortDescription: 'Portrait-focused camera phone with sleek design.',
    description:
      'Oppo Reno 11 offers a portrait-tuned camera system and a premium curved-glass design.',
    tags: ['oppo', 'reno', 'camera'],
    flags: { isOnSale: true },
    specs: [
      ['Display', '6.7" AMOLED, 120Hz'],
      ['RAM', '8GB'],
      ['Storage', '256GB'],
    ],
  },
  {
    name: 'Apple iPhone 13 128GB',
    sku: 'MOB-APL-IP13-128',
    brand: 'Apple',
    categorySlug: 'mobile-phones',
    productType: 'MOBILE',
    price: 99999,
    stock: 5,
    warranty: '1 Year Apple Warranty',
    shortDescription: 'Reliable iPhone with A15 Bionic chip.',
    description:
      'iPhone 13 remains a fast, reliable choice with the A15 Bionic chip and dual-camera system.',
    tags: ['apple', 'iphone'],
    flags: { isBestSeller: true, isRecommended: true },
    specs: [
      ['Display', '6.1" Super Retina XDR'],
      ['Processor', 'A15 Bionic'],
      ['Storage', '128GB'],
    ],
  },
  {
    name: 'Dell Inspiron 15 3520',
    sku: 'LAP-DEL-INS15-I5',
    brand: 'Dell',
    categorySlug: 'laptops',
    productType: 'LAPTOP',
    price: 85000,
    stock: 6,
    warranty: '1 Year Dell Warranty',
    shortDescription: '15.6" laptop for everyday productivity.',
    description:
      'The Dell Inspiron 15 3520 delivers dependable performance for study and office work with a full-HD display.',
    tags: ['dell', 'inspiron', 'laptop'],
    flags: { isFeatured: true },
    specs: [
      ['Processor', 'Intel Core i5-1235U'],
      ['RAM', '8GB'],
      ['Storage', '512GB SSD'],
      ['Display', '15.6" FHD'],
    ],
  },
  {
    name: 'HP Pavilion 14',
    sku: 'LAP-HP-PAV14-I5',
    brand: 'HP',
    categorySlug: 'laptops',
    productType: 'LAPTOP',
    price: 92000,
    discountPrice: 87000,
    stock: 4,
    warranty: '1 Year HP Warranty',
    shortDescription: 'Compact and stylish laptop for work and study.',
    description:
      'HP Pavilion 14 pairs a lightweight aluminum design with strong everyday performance.',
    tags: ['hp', 'pavilion', 'laptop'],
    flags: { isOnSale: true, isNew: true },
    specs: [
      ['Processor', 'Intel Core i5-1335U'],
      ['RAM', '16GB'],
      ['Storage', '512GB SSD'],
    ],
  },
  {
    name: 'Lenovo IdeaPad Slim 3',
    sku: 'LAP-LEN-IPS3-R5',
    brand: 'Lenovo',
    categorySlug: 'laptops',
    productType: 'LAPTOP',
    price: 68000,
    stock: 9,
    warranty: '1 Year Lenovo Warranty',
    shortDescription: 'Slim, affordable laptop for daily use.',
    description:
      'The IdeaPad Slim 3 offers reliable AMD Ryzen performance in a thin, portable chassis.',
    tags: ['lenovo', 'ideapad', 'laptop', 'value'],
    flags: { isBestSeller: true, isTopSale: true },
    specs: [
      ['Processor', 'AMD Ryzen 5 7530U'],
      ['RAM', '8GB'],
      ['Storage', '512GB SSD'],
    ],
  },
  {
    name: 'Apple MacBook Air M2',
    sku: 'LAP-APL-MBA-M2',
    brand: 'Apple',
    categorySlug: 'laptops',
    productType: 'LAPTOP',
    price: 179000,
    stock: 3,
    warranty: '1 Year Apple Warranty',
    shortDescription: 'Fanless laptop with the Apple M2 chip.',
    description:
      'MacBook Air with M2 delivers silent, all-day performance in an ultra-portable design.',
    tags: ['apple', 'macbook', 'laptop'],
    flags: { isFeatured: true, isRecommended: true },
    specs: [
      ['Processor', 'Apple M2'],
      ['RAM', '8GB'],
      ['Storage', '256GB SSD'],
      ['Display', '13.6" Liquid Retina'],
    ],
  },
  {
    name: 'Asus Vivobook 15',
    sku: 'LAP-ASU-VB15-I3',
    brand: 'Asus',
    categorySlug: 'laptops',
    productType: 'LAPTOP',
    price: 75000,
    discountPrice: 69999,
    stock: 7,
    warranty: '1 Year Asus Warranty',
    shortDescription: 'Everyday laptop with a spacious full-HD display.',
    description:
      'Asus Vivobook 15 balances performance and battery life for study, browsing, and office work.',
    tags: ['asus', 'vivobook', 'laptop'],
    flags: { isOnSale: true },
    specs: [
      ['Processor', 'Intel Core i3-1215U'],
      ['RAM', '8GB'],
      ['Storage', '512GB SSD'],
    ],
  },
  {
    name: 'Spigen Rugged Armor Case (iPhone 15)',
    sku: 'ACC-SPG-RA-IP15',
    brand: 'Spigen',
    categorySlug: 'cases-covers',
    productType: 'ACCESSORY',
    price: 1800,
    stock: 30,
    warranty: '6 Months Seller Warranty',
    shortDescription: 'Shock-absorbing protective case.',
    description:
      'Flexible TPU case with reinforced corners for drop protection, designed specifically for iPhone 15.',
    tags: ['case', 'iphone', 'protection'],
    flags: { isNew: true },
    specs: [
      ['Material', 'Flexible TPU'],
      ['Compatibility', 'iPhone 15'],
    ],
  },
  {
    name: 'Universal Laptop Sleeve 15.6"',
    sku: 'ACC-TAR-SLV-156',
    brand: 'Targus',
    categorySlug: 'cases-covers',
    productType: 'ACCESSORY',
    price: 2200,
    stock: 20,
    warranty: '6 Months Seller Warranty',
    shortDescription: 'Padded protective sleeve for 15.6" laptops.',
    description:
      'Water-resistant padded sleeve that fits most 15.6" laptops for daily commuting protection.',
    tags: ['sleeve', 'laptop', 'protection'],
    flags: { isRecommended: true },
    specs: [
      ['Compatibility', 'Up to 15.6" laptops'],
      ['Material', 'Water-resistant fabric'],
    ],
  },
  {
    name: 'Tempered Glass Screen Protector (Universal)',
    sku: 'ACC-CLG-TG-UNI',
    brand: 'ClearGuard',
    categorySlug: 'screen-protectors',
    productType: 'ACCESSORY',
    price: 500,
    discountPrice: 350,
    stock: 100,
    warranty: '1 Month Breakage Warranty',
    shortDescription: '9H hardness tempered glass protector.',
    description:
      'Scratch-resistant tempered glass with oleophobic coating and easy bubble-free installation.',
    tags: ['screen protector', 'tempered glass'],
    flags: { isOnSale: true, isTopSale: true },
    specs: [
      ['Hardness', '9H'],
      ['Thickness', '0.33mm'],
    ],
  },
  {
    name: 'Anker 20W USB-C Fast Charger',
    sku: 'ACC-ANK-20W-USBC',
    brand: 'Anker',
    categorySlug: 'chargers-cables',
    productType: 'ACCESSORY',
    price: 2500,
    stock: 40,
    warranty: '1 Year Anker Warranty',
    shortDescription: 'Compact 20W PD fast charger.',
    description:
      'Delivers 20W of fast-charging power through USB-C, compatible with most modern phones.',
    tags: ['charger', 'fast charging', 'usb-c'],
    flags: { isBestSeller: true, isFeatured: true },
    specs: [
      ['Output', '20W USB-C PD'],
      ['Compatibility', 'USB-C devices'],
    ],
  },
  {
    name: 'Type-C to Type-C Cable 1m',
    sku: 'ACC-ANK-CC-1M',
    brand: 'Anker',
    categorySlug: 'chargers-cables',
    productType: 'ACCESSORY',
    price: 900,
    stock: 60,
    warranty: '6 Months Warranty',
    shortDescription: 'Durable braided USB-C to USB-C cable.',
    description:
      'Braided nylon cable rated for fast charging and data transfer between USB-C devices.',
    tags: ['cable', 'usb-c'],
    flags: { isRecommended: true },
    specs: [
      ['Length', '1 meter'],
      ['Material', 'Braided nylon'],
    ],
  },
  {
    name: '65W GaN Laptop Charger',
    sku: 'ACC-UGR-65W-GAN',
    brand: 'Ugreen',
    categorySlug: 'chargers-cables',
    productType: 'ACCESSORY',
    price: 4500,
    discountPrice: 3999,
    stock: 15,
    warranty: '1 Year Warranty',
    shortDescription: 'Compact GaN charger for laptops and phones.',
    description:
      'High-efficiency 65W GaN charger, small enough to carry daily, suitable for most USB-C laptops and phones.',
    tags: ['charger', 'laptop', 'gan'],
    flags: { isOnSale: true, isNew: true },
    specs: [
      ['Output', '65W USB-C PD'],
      ['Technology', 'Gallium Nitride (GaN)'],
    ],
  },
  {
    name: 'boAt Airdopes 141 TWS',
    sku: 'ACC-BOAT-AD141',
    brand: 'boAt',
    categorySlug: 'earphones-headphones',
    productType: 'ACCESSORY',
    price: 2499,
    discountPrice: 1999,
    stock: 25,
    warranty: '1 Year Warranty',
    shortDescription: 'True wireless earbuds with long battery life.',
    description:
      'Airdopes 141 offer up to 42 hours of total playback with ENx environmental noise cancellation for calls.',
    tags: ['earbuds', 'tws', 'wireless'],
    flags: { isBestSeller: true, isOnSale: true, isTopSale: true },
    specs: [
      ['Battery Life', 'Up to 42 hours (with case)'],
      ['Connectivity', 'Bluetooth 5.3'],
    ],
  },
  {
    name: 'JBL Tune 510BT Headphones',
    sku: 'ACC-JBL-T510BT',
    brand: 'JBL',
    categorySlug: 'earphones-headphones',
    productType: 'ACCESSORY',
    price: 4990,
    stock: 12,
    warranty: '1 Year JBL Warranty',
    shortDescription: 'On-ear wireless headphones with JBL Pure Bass.',
    description:
      'Lightweight on-ear headphones with up to 40 hours of battery life and JBL Pure Bass sound.',
    tags: ['headphones', 'wireless', 'jbl'],
    flags: { isFeatured: true },
    specs: [
      ['Battery Life', 'Up to 40 hours'],
      ['Connectivity', 'Bluetooth 5.0'],
    ],
  },
  {
    name: 'Apple AirPods Pro (2nd Gen)',
    sku: 'ACC-APL-APP2',
    brand: 'Apple',
    categorySlug: 'earphones-headphones',
    productType: 'ACCESSORY',
    price: 39999,
    stock: 5,
    warranty: '1 Year Apple Warranty',
    shortDescription: 'Active noise cancelling earbuds by Apple.',
    description:
      'AirPods Pro (2nd generation) feature Adaptive Audio, Active Noise Cancellation, and Personalized Spatial Audio.',
    tags: ['apple', 'airpods', 'earbuds'],
    flags: { isFeatured: true, isRecommended: true },
    specs: [
      ['Noise Cancellation', 'Active Noise Cancellation'],
      ['Chip', 'Apple H2'],
    ],
  },
  {
    name: 'Anker 20000mAh Power Bank',
    sku: 'GAD-ANK-PB20K',
    brand: 'Anker',
    categorySlug: 'power-banks',
    productType: 'GADGET',
    price: 6500,
    discountPrice: 5999,
    stock: 18,
    warranty: '1 Year Anker Warranty',
    shortDescription: 'High-capacity power bank with fast charging.',
    description:
      'A 20,000mAh power bank with dual USB-C/USB-A output for charging multiple devices on the go.',
    tags: ['power bank', 'portable charger'],
    flags: { isOnSale: true, isBestSeller: true },
    specs: [
      ['Capacity', '20,000mAh'],
      ['Output', '18W Fast Charging'],
    ],
  },
  {
    name: 'Mi Power Bank 10000mAh',
    sku: 'GAD-XIA-PB10K',
    brand: 'Xiaomi',
    categorySlug: 'power-banks',
    productType: 'GADGET',
    price: 3200,
    stock: 22,
    warranty: '6 Months Warranty',
    shortDescription: 'Slim and lightweight power bank.',
    description: 'Compact 10,000mAh power bank that easily fits in a pocket or bag for daily use.',
    tags: ['power bank', 'xiaomi'],
    flags: { isTopSale: true },
    specs: [['Capacity', '10,000mAh']],
  },
  {
    name: 'Amazfit GTS 4 Mini',
    sku: 'GAD-AMZ-GTS4M',
    brand: 'Amazfit',
    categorySlug: 'smart-watches',
    productType: 'GADGET',
    price: 12999,
    discountPrice: 10999,
    stock: 10,
    warranty: '1 Year Warranty',
    shortDescription: 'Slim smart watch with health tracking.',
    description:
      'Tracks heart rate, sleep, and 120+ sports modes with up to 12 days of battery life.',
    tags: ['smart watch', 'fitness'],
    flags: { isNew: true, isOnSale: true },
    specs: [
      ['Battery Life', 'Up to 12 days'],
      ['Display', '1.75" AMOLED'],
    ],
  },
  {
    name: 'Apple Watch SE (2nd Gen)',
    sku: 'GAD-APL-WSE2',
    brand: 'Apple',
    categorySlug: 'smart-watches',
    productType: 'GADGET',
    price: 45999,
    stock: 4,
    warranty: '1 Year Apple Warranty',
    shortDescription: 'Essential Apple Watch features at a lower price.',
    description:
      'Apple Watch SE delivers essential health, fitness, and safety features with a fast S8 chip.',
    tags: ['apple watch', 'smart watch'],
    flags: { isFeatured: true, isRecommended: true },
    specs: [
      ['Chip', 'Apple S8 SiP'],
      ['Display', 'Retina LTPO'],
    ],
  },
  {
    name: 'JBL Go 3 Bluetooth Speaker',
    sku: 'GAD-JBL-GO3',
    brand: 'JBL',
    categorySlug: 'gadgets',
    productType: 'GADGET',
    price: 4500,
    discountPrice: 3999,
    stock: 14,
    warranty: '1 Year JBL Warranty',
    shortDescription: 'Portable waterproof Bluetooth speaker.',
    description:
      'Ultra-portable JBL Go 3 delivers bold sound with an IP67 waterproof and dustproof design.',
    tags: ['speaker', 'bluetooth', 'portable'],
    flags: { isOnSale: true, isTopSale: true },
    specs: [
      ['Waterproofing', 'IP67'],
      ['Battery Life', 'Up to 5 hours'],
    ],
  },
  {
    name: 'Logitech M185 Wireless Mouse',
    sku: 'OTH-LOG-M185',
    brand: 'Logitech',
    categorySlug: 'other-electronics',
    productType: 'ACCESSORY',
    price: 1200,
    stock: 25,
    warranty: '1 Year Logitech Warranty',
    shortDescription: 'Reliable wireless mouse for everyday computing.',
    description:
      'A compact wireless mouse with a 2.4GHz connection and up to 12 months of battery life.',
    tags: ['mouse', 'wireless', 'peripheral'],
    flags: { isRecommended: true },
    specs: [
      ['Connectivity', '2.4GHz Wireless'],
      ['Battery Life', 'Up to 12 months'],
    ],
  },
];

type ReviewSeed = { authorName: string; rating: number; comment: string };

const reviews: ReviewSeed[] = [
  {
    authorName: 'Sunita Shrestha',
    rating: 5,
    comment: 'Fixed my phone screen the same day. Great service and fair pricing!',
  },
  {
    authorName: 'Bikash Tamang',
    rating: 5,
    comment:
      'Bought a laptop charger here and the staff was very helpful in finding the right one.',
  },
  {
    authorName: 'Anita Gurung',
    rating: 4,
    comment:
      'Good repair service for my laptop battery replacement. Took a little longer than expected but worked well.',
  },
  {
    authorName: 'Ramesh Karki',
    rating: 4,
    comment: 'Reliable shop for accessories. Prices are reasonable compared to nearby stores.',
  },
  {
    authorName: 'Sabina Rai',
    rating: 3,
    comment:
      'Service was okay, had to wait a bit during a busy afternoon, but the repair quality was good.',
  },
];

async function main() {
  console.log('Seeding categories...');
  const categoryMap = new Map<string, number>();
  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, displayOrder: c.displayOrder },
      create: c,
    });
    categoryMap.set(c.slug, category.id);
  }

  console.log('Seeding services...');
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  console.log('Seeding products...');
  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.categorySlug}`);

    const slug = p.sku.toLowerCase();
    const imageUrl = ensurePlaceholderImage(slug, p.brand, p.name, p.productType);

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        brand: p.brand,
        categoryId,
        productType: p.productType,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        stock: p.stock,
        warranty: p.warranty,
        shortDescription: p.shortDescription,
        description: p.description,
        tags: p.tags.join(','),
        ...p.flags,
      },
      create: {
        name: p.name,
        slug,
        sku: p.sku,
        brand: p.brand,
        categoryId,
        productType: p.productType,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        stock: p.stock,
        warranty: p.warranty,
        shortDescription: p.shortDescription,
        description: p.description,
        tags: p.tags.join(','),
        ...p.flags,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: { productId: product.id, url: imageUrl, alt: p.name, isPrimary: true, sortOrder: 0 },
    });

    await prisma.productSpecification.deleteMany({ where: { productId: product.id } });
    if (p.specs.length > 0) {
      await prisma.productSpecification.createMany({
        data: p.specs.map(([label, value], index) => ({
          productId: product.id,
          label,
          value,
          displayOrder: index,
        })),
      });
    }
  }

  console.log('Seeding reviews...');
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    await prisma.review.upsert({
      where: { id: i + 1 },
      update: r,
      create: { id: i + 1, ...r },
    });
  }

  console.log('Seeding site settings...');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log('Seeding admin account...');
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment to seed the admin account.',
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: 'Administrator' },
  });

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
