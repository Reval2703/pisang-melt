// ============================================================
// PRODUCT TYPES
// ============================================================

export interface Product {
  id: string;
  name: string;
  category: 'crispy' | 'nugget';

  price: number;
  originalPrice?: number;

  image: string;

  tagline: string;
  description: string;

  crispLevel: number; // 1-5
  meltLevel: number; // 1-5

  rating: number;
  reviewsCount: number;

  isBestSeller?: boolean;
  isNew?: boolean;

  portion: string;
  calories: string;

  ingredients: string[];
}

// ============================================================
// EXTRA TOPPINGS
// Customer dapat memilih topping tambahan
// ============================================================

export interface ExtraTopping {
  id: string;
  name: string;
  price: number;
}

export const EXTRA_TOPPINGS: ExtraTopping[] = [
  {
    id: 'extra-choco',
    name: 'Extra Molten Choco Dip',
    price: 4000,
  },
  {
    id: 'extra-cheese',
    name: 'Ekstra Keju Serut Melimpah',
    price: 4000,
  },
  {
    id: 'almond-slices',
    name: 'Roasted Almond Slices',
    price: 5000,
  },
  {
    id: 'choco-chips',
    name: 'Crunchy Choco Chips',
    price: 3000,
  },
  {
    id: 'oreo-crumb',
    name: 'Oreo Crumb Sprinkle',
    price: 3000,
  },
];

// ============================================================
// PRODUCTS
// Sumber utama data produk customer
// ============================================================

export const PRODUCTS: Product[] = [
  {
    id: 'pisang-crispy-cokelat',

    name: 'Pisang Crispy Cokelat',
    category: 'crispy',

    price: 18000,
    originalPrice: 22000,

    image:
      '/src/assets/images/crispy_cokelat_1790912080345.jpg',

    tagline:
      'Kriuk renyah panko emas berselimut lelehan cokelat premium.',

    description:
      'Pisang raja pilihan dipotong pas, dibalut adonan rahasia dan tepung panko renyah, lalu digoreng hingga keemasan. Disajikan hangat dengan siraman dark chocolate glaze yang lumer saat digigit.',

    crispLevel: 5,
    meltLevel: 5,

    rating: 4.9,
    reviewsCount: 428,

    portion: '1 Kotak (6 pcs jumbo)',
    calories: '290 kcal / porsi',

    ingredients: [
      'Pisang Raja Matang',
      'Tepung Roti Panko Jepang',
      'Glaze Dark Chocolate Belgian',
      'Minyak Nabati Higienis',
    ],
  },

  {
    id: 'pisang-crispy-keju',

    name: 'Pisang Crispy Keju',
    category: 'crispy',

    price: 18000,
    originalPrice: 22000,

    image:
      '/src/assets/images/crispy_keju_1790912092380.jpg',

    tagline:
      'Gunungan keju cheddar gurih berpadu manis renyahnya pisang.',

    description:
      'Sensasi gurih renyah tanpa henti. Pisang goreng crispy panas yang ditaburi parutan keju cheddar premium melimpah hingga menutupi seluruh permukaan, plus sentuhan susu kental manis lembut.',

    crispLevel: 5,
    meltLevel: 4,

    rating: 4.8,
    reviewsCount: 312,

    portion: '1 Kotak (6 pcs jumbo)',
    calories: '280 kcal / porsi',

    ingredients: [
      'Pisang Raja Matang',
      'Keju Cheddar Pilihan',
      'Susu Kental Manis Gurih',
      'Tepung Panko Crispy',
    ],
  },

  {
    id: 'pisang-crispy-cokelat-keju',

    name: 'Pisang Crispy Cokelat Keju',
    category: 'crispy',

    price: 22000,
    originalPrice: 26000,

    image:
      '/src/assets/images/crispy_cokelat_keju_1790912104730.jpg',

    tagline:
      'Varian #1 Terfavorit: Kombinasi sempurna cokelat leleh pekat & gurih keju.',

    description:
      'Kombinasi juara yang tidak pernah salah! Pisang renyah kriuk dengan siraman cokelat lumer pekat di satu sisi dan limpahan keju cheddar gurih di atasnya. Rasa manis, gurih, dan renyah meledak di lidah.',

    crispLevel: 5,
    meltLevel: 5,

    rating: 5.0,
    reviewsCount: 980,

    isBestSeller: true,

    portion: '1 Kotak (6 pcs jumbo)',
    calories: '330 kcal / porsi',

    ingredients: [
      'Pisang Raja Spesial',
      'Belgian Dark Chocolate',
      'Keju Cheddar Parut',
      'Susu Legit',
    ],
  },

  {
    id: 'pisang-nugget-cokelat',

    name: 'Pisang Nugget Cokelat',
    category: 'nugget',

    price: 20000,
    originalPrice: 24000,

    image:
      '/src/assets/images/nugget_cokelat_1790912117739.jpg',

    tagline:
      'Bite-sized nugget pisang empuk di dalam, berenang dalam lumernya cokelat.',

    description:
      'Nugget pisang bertekstur lembut dan kenyal di dalam dengan kulit panko kriuk. Dicelup ke dalam cokelat ganache hangat lumer yang melimpah ruah, cocok dinikmati untuk camilan santai bersama teman.',

    crispLevel: 4,
    meltLevel: 5,

    rating: 4.9,
    reviewsCount: 512,

    portion: '1 Kotak (8 bite-sized cubes)',
    calories: '310 kcal / porsi',

    ingredients: [
      'Pisang Olahan Lembut',
      'Panko Gold',
      'Choco Ganache Dip',
      'Vanilla Infusion',
    ],
  },

  {
    id: 'pisang-nugget-keju',

    name: 'Pisang Nugget Keju',
    category: 'nugget',

    price: 20000,
    originalPrice: 24000,

    image:
      '/src/assets/images/nugget_keju_1790912129349.jpg',

    tagline:
      'Nugget pisang gurih creamy dengan lelehan saus keju spesial.',

    description:
      'Camilan favorit penikmat keju sejati. Nugget pisang garing disiram cheese sauce lumer creamy dan diberi topping parutan keju keemasan. Tekstur kontras renyah dan lumer yang bikin nagih.',

    crispLevel: 4,
    meltLevel: 5,

    rating: 4.8,
    reviewsCount: 389,

    isNew: true,

    portion: '1 Kotak (8 bite-sized cubes)',
    calories: '305 kcal / porsi',

    ingredients: [
      'Pisang Olahan Premium',
      'Saus Keju Melt Creamy',
      'Cheddar Snow',
      'Panko Gold',
    ],
  },
];

// ============================================================
// PROMO BUNDLE TYPES
// ============================================================

export interface PromoBundle {
  id: string;
  name: string;
  items: string;

  price: number;
  originalPrice: number;

  badge: string;
  description: string;

  popular?: boolean;
}

// ============================================================
// PROMO BUNDLES
// Sumber utama data paket promo customer
// ============================================================

export const PROMO_BUNDLES: PromoBundle[] = [
  {
    id: 'bundle-duo',

    name: 'Paket Duo Lumer Puas',

    items:
      '1 Pisang Crispy Cokelat + 1 Pisang Crispy Keju',

    price: 32000,
    originalPrice: 40000,

    badge: 'Hemat Rp 8.000',

    description:
      'Pilihan hemat untuk berdua. Perpaduan manisnya cokelat lumer dan gurihnya keju dalam satu paket nikmat.',
  },

  {
    id: 'bundle-party',

    name: 'Paket Best Seller Komplit',

    items:
      '1 Crispy Cokelat Keju + 1 Nugget Cokelat + 1 Nugget Keju',

    price: 55000,
    originalPrice: 70000,

    badge: 'Diskon 21%',

    description:
      'Paket kumpul bareng keluarga atau teman kantor. Rasakan semua varian lumer paling hits sekaligus!',

    popular: true,
  },

  {
    id: 'bundle-kantor',

    name: 'Paket Sultan Party Box (5 Box)',

    items:
      'Semua 5 Varian Lengkap + 2 Extra Dip Choco',

    price: 89000,
    originalPrice: 116000,

    badge: 'Hemat Rp 27.000',

    description:
      'Sangat cocok untuk arisan, rapat kantor, atau traktiran ultah. Dijamin jadi rebutan semua orang!',
  },
];

// ============================================================
// MARKETING COPYWRITING
// Konten promosi yang ditampilkan kepada customer
// ============================================================

export const MARKETING_COPYWRITING = [
  {
    channel: 'TikTok & Reels Viral Hook',

    title: 'Sound Renyah & Lumer Cokelat',

    content:
      'Pernah gak sih nemu pisang goreng yang pas digigit bunyinya KRIUKK banget, tapi pas dikunyah cokelatnya langsung MELELEH banjir di mulut? 🤤 Jangan ditonton pas lagi laper, langsung checkout di bio ya!',
  },

  {
    channel: 'Instagram Story Engagement',

    title: 'Poll: Tim Cokelat vs Tim Keju',

    content:
      'Kamu tim mana nih? Tim Cokelat Lumer Pekat 🍫 atau Tim Keju Gurih Melimpah 🧀? Voting sekarang dan dapatkan voucher potongan 20% kode: LUMER20!',
  },

  {
    channel: 'WhatsApp Broadcast Pelanggan',

    title: 'Promo Siang Camilan Kantor',

    content:
      'Hai Kak! Jam 3 sore gini mata udah mulai sepet? Waktunya recharg energi pake Pisang Melt anget-anget yang kriuk dan lumer! Ada promo Gratis Ongkir min. 2 box khusus hari ini yaa kak. Mau dianterin jam berapa?',
  },
];

// ============================================================
// CUSTOMER TESTIMONIALS
// ============================================================

export const CUSTOMER_TESTIMONIALS = [
  {
    id: '1',

    name: 'Anindya Putri',

    role:
      'Food Blogger & Content Creator, Jakarta Selatan',

    review:
      'Jujur ini pisang crispy paling renyah yang pernah aku coba. Panko-nya gak berminyak sama sekali, cokelatnya premium kental bukan yang manis gula murahan. Varian Pisang Crispy Cokelat Keju-nya beneran nagih!',

    rating: 5,

    order:
      'Pisang Crispy Cokelat Keju',

    verified: true,

    date: 'Kemarin',
  },

  {
    id: '2',

    name: 'Rian Pratama',

    role:
      'Product Designer, Sudirman',

    review:
      'Selalu jadi camilan wajib pas meeting sore di kantor. Nugget cokelatnya empuk banget di dalem, luarnya crispy. Sampai ke kantor masih anget dan sausnya gak tumpah karena packaging-nya rapi banget.',

    rating: 5,

    order:
      'Paket Best Seller Komplit',

    verified: true,

    date: '3 hari yang lalu',
  },

  {
    id: '3',

    name: 'Devi Anggraini',

    role:
      'Ibu Rumah Tangga, Bintaro',

    review:
      'Anak-anak suka banget sama Pisang Nugget Keju-nya. Rasa kejunya gurih creamy dan pisangnya manis matang alami tanpa asam. Pasti repeat order terus!',

    rating: 5,

    order:
      'Pisang Nugget Keju',

    verified: true,

    date: '1 minggu yang lalu',
  },
];

// ============================================================
// CUSTOMER / MARKETING BENEFITS
// ============================================================

export const MARKETING_BENEFITS = [
  {
    title: '100% Pisang Raja Asli',

    desc:
      'Hanya menggunakan pisang raja pilihan dengan tingkat kematangan optimal alami, manis legit tanpa rasa sepat.',
  },

  {
    title: 'Minyak Bersih Higienis',

    desc:
      'Menggunakan minyak kelapa nabati berkualitas yang rutin diganti, menjamin warna emas cerah dan tidak bikin seret.',
  },

  {
    title: 'Saus Cokelat & Keju Premium',

    desc:
      'Racikan cokelat melt khas Eropa dengan rasa cocoa pekat dan parutan keju cheddar asli yang berlimpah.',
  },

  {
    title: 'Freshly Fried Sesuai Pesanan',

    desc:
      'Digoreng dadakan saat pesanan masuk, dikemas dalam eco-friendly box berventilasi agar kriuknya tahan lama.',
  },
];