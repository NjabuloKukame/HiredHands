// ========================================
// FILE: prisma/seed.js
// ========================================
// Run with: npx prisma db seed
// Make sure your package.json has:
// "prisma": { "seed": "node prisma/seed.js" }
// ========================================

import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

const categories = [
  // ── Beauty & Personal Care ──────────────────────────────────────────
  { name: 'Hair Styling',       slug: 'hair-styling',       icon: 'scissors',        description: 'Haircuts, colouring, blowouts, braiding and more.' },
  { name: 'Beauty & Makeup',    slug: 'beauty-makeup',      icon: 'sparkles',        description: 'Makeup artistry, facials, skincare treatments.' },
  { name: 'Nail Care',          slug: 'nail-care',          icon: 'hand',            description: 'Manicures, pedicures, nail art and extensions.' },
  { name: 'Massage Therapy',    slug: 'massage-therapy',    icon: 'heart-pulse',     description: 'Relaxation, deep tissue, sports and therapeutic massage.' },
  { name: 'Barbering',          slug: 'barbering',          icon: 'scissors',        description: 'Haircuts, shaves and beard grooming for men.' },
  { name: 'Lash & Brow',        slug: 'lash-brow',          icon: 'eye',             description: 'Lash extensions, lash lifts, brow shaping and tinting.' },
  { name: 'Tattooing',          slug: 'tattooing',          icon: 'pen-tool',        description: 'Custom tattoo art and permanent body art.' },
  { name: 'Waxing',             slug: 'waxing',             icon: 'zap',             description: 'Full body waxing and hair removal services.' },

  // ── Health & Fitness ────────────────────────────────────────────────
  { name: 'Personal Training',  slug: 'personal-training',  icon: 'dumbbell',        description: 'One-on-one fitness coaching and workout plans.' },
  { name: 'Yoga & Pilates',     slug: 'yoga-pilates',       icon: 'activity',        description: 'Private and group yoga, pilates and stretching sessions.' },
  { name: 'Nutrition Coaching', slug: 'nutrition-coaching', icon: 'apple',           description: 'Personalised meal plans and dietary guidance.' },
  { name: 'Life Coaching',      slug: 'life-coaching',      icon: 'compass',         description: 'Goal setting, motivation and personal development.' },
  { name: 'Mental Wellness',    slug: 'mental-wellness',    icon: 'brain',           description: 'Mindfulness coaching, stress management and wellbeing.' },

  // ── Home Services ───────────────────────────────────────────────────
  { name: 'Cleaning',           slug: 'cleaning',           icon: 'sparkle',         description: 'Home, office and deep cleaning services.' },
  { name: 'Home Repair',        slug: 'home-repair',        icon: 'wrench',          description: 'General repairs, handyman and maintenance services.' },
  { name: 'Plumbing',           slug: 'plumbing',           icon: 'droplets',        description: 'Pipe repairs, installations and leak fixes.' },
  { name: 'Electrical',         slug: 'electrical',         icon: 'zap',             description: 'Wiring, installations, fault finding and compliance.' },
  { name: 'Painting',           slug: 'painting',           icon: 'paint-bucket',    description: 'Interior and exterior painting and finishing.' },
  { name: 'Landscaping',        slug: 'landscaping',        icon: 'tree-pine',       description: 'Garden design, lawn care and outdoor maintenance.' },
  { name: 'Moving & Delivery',  slug: 'moving-delivery',    icon: 'truck',           description: 'Furniture moving, removals and courier services.' },
  { name: 'Interior Design',    slug: 'interior-design',    icon: 'layout-panel-top',description: 'Home styling, space planning and décor consulting.' },
  { name: 'Security',           slug: 'security',           icon: 'shield',          description: 'CCTV installation, alarm systems and access control.' },
  { name: 'Pool & Spa',         slug: 'pool-spa',           icon: 'waves',           description: 'Pool cleaning, maintenance and spa servicing.' },

  // ── Education & Tutoring ────────────────────────────────────────────
  { name: 'Tutoring',           slug: 'tutoring',           icon: 'book-open',       description: 'Academic tutoring for all ages and subjects.' },
  { name: 'Music Lessons',      slug: 'music-lessons',      icon: 'music',           description: 'Guitar, piano, voice and instrument lessons.' },
  { name: 'Language Lessons',   slug: 'language-lessons',   icon: 'languages',       description: 'Learn a new language with a native or qualified teacher.' },
  { name: 'Coding & Tech',      slug: 'coding-tech',        icon: 'code-2',          description: 'Programming lessons, tech tutoring and digital skills.' },
  { name: 'Art & Crafts',       slug: 'art-crafts',         icon: 'palette',         description: 'Drawing, painting, pottery and creative workshops.' },
  { name: 'Dance Lessons',      slug: 'dance-lessons',      icon: 'music-2',         description: 'Ballet, contemporary, salsa and dance coaching.' },

  // ── Creative & Media ────────────────────────────────────────────────
  { name: 'Photography',        slug: 'photography',        icon: 'camera',          description: 'Portrait, event, commercial and real estate photography.' },
  { name: 'Videography',        slug: 'videography',        icon: 'video',           description: 'Event filming, editing and video production.' },
  { name: 'Graphic Design',     slug: 'graphic-design',     icon: 'pen-tool',        description: 'Logos, branding, print and digital design.' },
  { name: 'DJing & Music',      slug: 'djing-music',        icon: 'radio',           description: 'DJ services for events, parties and weddings.' },
  { name: 'Catering & Chefs',   slug: 'catering-chefs',     icon: 'chef-hat',        description: 'Private chefs, catering and meal prep services.' },
  { name: 'Event Planning',     slug: 'event-planning',     icon: 'calendar-heart',  description: 'Wedding and event coordination, décor and management.' },

  // ── Pet Services ────────────────────────────────────────────────────
  { name: 'Pet Care',           slug: 'pet-care',           icon: 'paw-print',       description: 'Dog walking, pet sitting and animal care.' },
  { name: 'Pet Grooming',       slug: 'pet-grooming',       icon: 'scissors',        description: 'Bathing, trimming and grooming for dogs and cats.' },
  { name: 'Vet & Pet Health',   slug: 'vet-pet-health',     icon: 'stethoscope',     description: 'Mobile vet visits and animal health services.' },

  // ── Professional & Business ─────────────────────────────────────────
  { name: 'Accounting',         slug: 'accounting',         icon: 'calculator',      description: 'Bookkeeping, tax returns and financial services.' },
  { name: 'Legal Services',     slug: 'legal-services',     icon: 'scale',           description: 'Legal advice, contracts and document preparation.' },
  { name: 'Marketing',          slug: 'marketing',          icon: 'megaphone',       description: 'Social media, SEO, ads and digital marketing.' },
  { name: 'IT Support',         slug: 'it-support',         icon: 'monitor',         description: 'Computer repairs, networking and tech support.' },
  { name: 'Transcription',      slug: 'transcription',      icon: 'mic',             description: 'Audio, video and meeting transcription services.' },

  // ── Transport ───────────────────────────────────────────────────────
  { name: 'Chauffeur & Rides',  slug: 'chauffeur-rides',    icon: 'car',             description: 'Private driver, airport transfers and executive rides.' },
  { name: 'Courier Services',   slug: 'courier-services',   icon: 'package',         description: 'Same-day delivery and courier runs.' },
];

async function main() {
  console.log('🌱 Seeding categories...');

  let created = 0;
  let skipped = 0;

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.category.create({ data: category });
    created++;
  }

  console.log(`✅ Done — ${created} categories created, ${skipped} already existed.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });