export interface Supply {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  description: string;
  usageGuide: string;
  features?: string[];
}

export const SUPPLY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'brushes', label: 'Brushes' },
  { id: 'files', label: 'Files & Buffers' },
  { id: 'tools', label: 'Tools' },
  { id: 'coats', label: 'Base & Top Coats' },
  { id: 'lamps', label: 'Lamps' },
  { id: 'glue', label: 'Nail Glue' },
];

export const supplies: Supply[] = [
  {
    id: 'sup-001',
    slug: 'nail-art-brush-set',
    name: 'Nail Art Brush Set (12pcs)',
    price: 24.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Brush+Set'],
    category: 'brushes',
    inStock: true,
    description:
      'A complete set of 12 professional nail art brushes, crafted for precision and versatility. Ideal for gel, acrylic, and regular nail polish applications.',
    usageGuide:
      'Clean brushes after each use with brush cleaner or acetone. Store flat or with bristles facing up to maintain shape.',
    features: [
      'Set of 12 brushes covering all nail art techniques',
      'High-quality synthetic bristles for smooth, even strokes',
      'Ergonomic handles for steady control',
      'Suitable for gel, acrylic, and regular polish',
    ],
  },
  {
    id: 'sup-002',
    slug: 'detail-liner-brush',
    name: 'Ultra-Fine Detail Liner Brush',
    price: 8.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Liner+Brush'],
    category: 'brushes',
    inStock: true,
    description:
      'An ultra-fine liner brush designed for intricate nail art details. Perfect for creating thin lines, swirls, and delicate patterns.',
    usageGuide:
      'Dip bristles lightly into polish. Apply with gentle pressure for the finest lines. Clean immediately after use.',
    features: [
      'Extra-fine 0.5 mm tip for micro-detail work',
      'Long flexible bristles for fluid line control',
      'Stainless steel ferrule — no shedding',
    ],
  },
  {
    id: 'sup-003',
    slug: 'glass-nail-file',
    name: 'Czech Glass Nail File',
    price: 12.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Glass+File'],
    category: 'files',
    inStock: true,
    description:
      'Handcrafted from tempered Czech glass, this nail file seals the nail edge as it shapes, preventing peeling and breakage.',
    usageGuide:
      'File in one direction only to seal the nail edge. Rinse under water to clean. Can be sterilized by boiling.',
    features: [
      'Etched tempered Czech glass — lifetime durability',
      'Seals nail keratin layers to prevent splitting',
      'Gentle on natural nails and press-ons',
      'Dishwasher and autoclave safe',
    ],
  },
  {
    id: 'sup-004',
    slug: 'buffer-block-set',
    name: 'Professional Buffer Block Set (4-way)',
    price: 9.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Buffer+Block'],
    category: 'files',
    inStock: true,
    description:
      'A 4-way buffer block that files, smooths, buffs, and shines in one tool. Achieve a mirror-like finish without top coat.',
    usageGuide:
      'Use each side in sequence: file → smooth → buff → shine. Replace when sides become worn or discoloured.',
    features: [
      '4 grits in one block: 100/180/240/280',
      'Foam core for flexible, even pressure',
      'Removes ridges and creates a glass-like shine',
    ],
  },
  {
    id: 'sup-005',
    slug: 'cuticle-pusher-set',
    name: 'Stainless Cuticle Pusher & Cutter Set',
    price: 18.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Cuticle+Set'],
    category: 'tools',
    inStock: true,
    description:
      'A professional-grade cuticle pusher and cutter set made from surgical stainless steel. Ideal for clean, precise cuticle maintenance.',
    usageGuide:
      'Soak nails in warm water for 3–5 minutes before use. Push cuticles back gently, then trim excess with the cutter. Sterilize after each use.',
    features: [
      'Surgical stainless steel — rust-proof and long-lasting',
      'Double-ended pusher: flat tip + angled spoon',
      'Spring-loaded cutter for precise trimming',
      'Includes travel pouch',
    ],
  },
  {
    id: 'sup-006',
    slug: 'nail-drill-machine',
    name: 'Portable Electric Nail Drill',
    price: 49.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Nail+Drill'],
    category: 'tools',
    inStock: false,
    description:
      'A cordless electric nail drill with adjustable speed up to 20,000 RPM. Compatible with standard 3/32" drill bits for all nail prep tasks.',
    usageGuide:
      'Start at a low speed setting. Keep the drill moving at all times to avoid heat buildup. Use appropriate bits for each task.',
    features: [
      'Variable speed 0–20,000 RPM',
      'Forward and reverse rotation',
      'Rechargeable USB-C battery (3-hour life)',
      'Low vibration and noise',
      'Compatible with standard 3/32" bits',
    ],
  },
  {
    id: 'sup-007',
    slug: 'nail-tips-kit',
    name: 'Clear Nail Tips Kit (500pcs)',
    price: 14.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Nail+Tips'],
    category: 'tools',
    inStock: true,
    description:
      'A 500-piece kit of ultra-thin clear nail tips in 10 sizes. Perfect for nail extensions and press-on creation.',
    usageGuide:
      'Select the size closest to your natural nail width. Apply with nail glue or gel, then file and shape as desired.',
    features: [
      '500 tips across 10 sizes (50 per size)',
      'Ultra-thin contact zone for invisible seams',
      'Clear ABS material — easy to paint over',
    ],
  },
  {
    id: 'sup-008',
    slug: 'strengthening-base-coat',
    name: 'Strengthening Base Coat',
    price: 16.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Base+Coat'],
    category: 'coats',
    inStock: true,
    description:
      'A keratin-enriched base coat that strengthens brittle nails and improves polish adhesion for a longer-lasting manicure.',
    usageGuide:
      'Apply one thin coat to clean, dry nails. Allow 60 seconds to dry before applying colour. Can be used daily as a nail treatment.',
    features: [
      'Keratin and calcium formula',
      'Improves colour adhesion and longevity',
      'Reduces breakage and peeling',
      'Free from formaldehyde and toluene',
    ],
  },
  {
    id: 'sup-009',
    slug: 'high-gloss-top-coat',
    name: 'High-Gloss No-Wipe Top Coat',
    price: 16.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Top+Coat'],
    category: 'coats',
    inStock: true,
    description:
      'A no-wipe gel top coat that cures to an ultra-high-gloss finish, sealing in your nail art and extending wear up to 4 weeks.',
    usageGuide:
      'Apply a thin layer over fully cured gel or nail art. Cure under UV/LED lamp for 60 seconds. No cleansing step required.',
    features: [
      'No-wipe formula — no sticky inhibition layer',
      'Ultra-high gloss and self-levelling',
      'Chip-resistant for up to 4 weeks',
      'Compatible with all gel systems',
    ],
  },
  {
    id: 'sup-010',
    slug: 'matte-top-coat',
    name: 'Matte Finish Top Coat',
    price: 15.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Matte+Top'],
    category: 'coats',
    inStock: true,
    description:
      'Transform any gel or regular nail colour into a sophisticated matte finish in seconds. Fast-drying and smudge-resistant.',
    usageGuide:
      'Apply over fully dried/cured colour. For gel: cure for 60 seconds under UV/LED. For regular polish: allow 2 minutes to dry.',
    features: [
      'Instant velvet-matte transformation',
      'Works over gel and regular polish',
      'Non-yellowing formula',
    ],
  },
  {
    id: 'sup-011',
    slug: 'uv-led-lamp-36w',
    name: 'Professional UV/LED Lamp 36W',
    price: 39.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=UV+Lamp'],
    category: 'lamps',
    inStock: true,
    description:
      'A 36W dual UV/LED curing lamp with 4 timer settings, smart sensor, and space-saving design. Cures all gel brands in seconds.',
    usageGuide:
      'Plug in and select your timer (10s / 30s / 60s / 99s). Place hand flat inside the lamp. Clean the reflector plate regularly for best results.',
    features: [
      '36W dual UV/LED beads — compatible with all gel brands',
      '4 timer presets and smart hand sensor',
      'Removable base for pedicure use',
      'Overheat protection built-in',
    ],
  },
  {
    id: 'sup-012',
    slug: 'mini-uv-lamp',
    name: 'Mini Portable UV/LED Lamp',
    price: 19.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Mini+Lamp'],
    category: 'lamps',
    inStock: false,
    description:
      'A compact travel-friendly UV/LED lamp that cures gel nails one finger at a time. Powered by USB — works with any power bank.',
    usageGuide:
      'Connect via USB. Press the button to activate 60-second cure cycle. Cure each finger individually for best results.',
    features: [
      'USB powered — compatible with any 5V power source',
      '6W LED beads for quick curing',
      'Lightweight at 85g',
      'One-button operation',
    ],
  },
  {
    id: 'sup-013',
    slug: 'press-on-nail-glue',
    name: 'Long-Lasting Nail Glue (5g)',
    price: 6.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Nail+Glue'],
    category: 'glue',
    inStock: true,
    description:
      'Professional-strength cyanoacrylate nail glue that bonds press-on nails securely for up to 2 weeks. Dries clear and flexible.',
    usageGuide:
      'Apply a small drop to the natural nail or the press-on. Press and hold for 10–15 seconds. Avoid water for 1 hour after application.',
    features: [
      'Professional cyanoacrylate formula',
      'Sets in 10 seconds — holds for up to 2 weeks',
      'Precision applicator tip',
      'Dries clear and flexible',
    ],
  },
  {
    id: 'sup-014',
    slug: 'nail-glue-tabs',
    name: 'Double-Sided Adhesive Tabs (60pcs)',
    price: 5.99,
    images: ['https://placehold.co/600x600/F8F8F8/1A1A1A?text=Glue+Tabs'],
    category: 'glue',
    inStock: true,
    description:
      'Gentle, residue-free double-sided adhesive tabs for temporary press-on nail wear. Perfect for events and occasions.',
    usageGuide:
      'Clean and buff natural nails. Peel one side of the tab and press onto the natural nail. Peel the second side and press the press-on firmly. To remove, soak in warm water for 60 seconds.',
    features: [
      '60 tabs across 10 sizes for a perfect fit',
      'Gentle on natural nails — no residue on removal',
      'Waterproof hold for up to 3 days',
      'Ideal for short-term or event wear',
    ],
  },
];

export function getSupplyById(id: string): Supply | undefined {
  return supplies.find((s) => s.id === id);
}

export function getSupplyBySlug(slug: string): Supply | undefined {
  return supplies.find((s) => s.slug === slug);
}
