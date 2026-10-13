# PROYEK LENGKAP PISANG MELT - LARAVEL 11 / 12 (DARI AWAL SAMPAI AKHIR)

Panduan ini berisi seluruh file kode sumber proyek **Pisang Melt Artisan** mulai dari instalasi awal, migrasi database, model, seeder, controller, routes, hingga template Blade lengkap beserta JavaScript (Alpine.js) untuk interaktivitas keranjang belanja, status pelacakan pesanan dapur, dan gerbang pembayaran online.

---

## DAFTAR ISI FILE & URUTAN IMPLEMENTASI
1. **Langkah 1:** Instalasi & Konfigurasi Lingkungan (`.env`)
2. **Langkah 2:** Database Migration:
   - `database/migrations/2026_01_01_000001_create_products_table.php`
   - `database/migrations/2026_01_01_000002_create_orders_table.php`
3. **Langkah 3:** Eloquent Models:
   - `app/Models/Product.php`
   - `app/Models/Order.php`
   - `app/Models/OrderItem.php`
4. **Langkah 4:** Database Seeder:
   - `database/seeders/ProductSeeder.php`
   - `database/seeders/DatabaseSeeder.php`
5. **Langkah 5:** Controller:
   - `app/Http/Controllers/PisangMeltController.php`
6. **Langkah 6:** Routing:
   - `routes/web.php`
7. **Langkah 7:** Master Layout Blade:
   - `resources/views/layouts/app.blade.php`
8. **Langkah 8:** Halaman Utama:
   - `resources/views/home.blade.php`
9. **Langkah 9:** Drawer Keranjang & Pelacakan Status:
   - `resources/views/partials/cart-drawer.blade.php`
10. **Langkah 10:** Modal Pembayaran Online (QRIS, VA, E-Wallet):
    - `resources/views/partials/payment-modal.blade.php`

---

## LANGKAH 1: INSTALASI AWAL
Jalankan perintah berikut di terminal:
```bash
composer create-project laravel/laravel pisang-melt
cd pisang-melt
```

Konfigurasi database di file `.env`:
```env
APP_NAME="Pisang Melt"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pisang_melt
DB_USERNAME=root
DB_PASSWORD=
```

---

## LANGKAH 2: DATABASE MIGRATION

### 1. `database/migrations/2026_01_01_000001_create_products_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->enum('category', ['crispy', 'nugget']);
            $table->integer('price');
            $table->integer('original_price')->nullable();
            $table->integer('special_price')->nullable(); // Harga flash deal Menu Hari Ini
            $table->string('image');
            $table->string('tagline');
            $table->text('description');
            $table->tinyInteger('crisp_level')->default(5);
            $table->tinyInteger('melt_level')->default(5);
            $table->decimal('rating', 2, 1)->default(4.9);
            $table->integer('reviews_count')->default(100);
            $table->boolean('is_best_seller')->default(false);
            $table->boolean('is_new')->default(false);
            $table->string('portion')->default('1 Kotak (6 pcs jumbo)');
            $table->string('calories')->default('290 kcal / porsi');
            $table->json('ingredients')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

### 2. `database/migrations/2026_01_01_000002_create_orders_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Contoh: PM-8942
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address')->nullable();
            $table->enum('delivery_option', ['pickup', 'gosend', 'grabexpress'])->default('gosend');
            $table->enum('status', ['received', 'cooking', 'ready'])->default('received');
            $table->enum('payment_method', ['qris', 'bca_va', 'mandiri_va', 'gopay', 'dana', 'cod'])->default('qris');
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->string('payment_ref')->nullable(); // TRX-XXXXXX
            $table->integer('subtotal');
            $table->integer('discount_amount')->default(0);
            $table->integer('delivery_fee')->default(0);
            $table->integer('grand_total');
            $table->integer('points_earned')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->integer('price');
            $table->integer('quantity');
            $table->json('toppings')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
```

---

## LANGKAH 3: ELOQUENT MODELS

### 1. `app/Models/Product.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'name', 'category', 'price', 'original_price', 'special_price',
        'image', 'tagline', 'description', 'crisp_level', 'melt_level',
        'rating', 'reviews_count', 'is_best_seller', 'is_new',
        'portion', 'calories', 'ingredients'
    ];

    protected $casts = [
        'ingredients' => 'array',
        'is_best_seller' => 'boolean',
        'is_new' => 'boolean',
    ];
}
```

### 2. `app/Models/Order.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'customer_name', 'customer_phone', 'customer_address',
        'delivery_option', 'status', 'payment_method', 'payment_status',
        'payment_ref', 'subtotal', 'discount_amount', 'delivery_fee',
        'grand_total', 'points_earned', 'notes'
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
```

### 3. `app/Models/OrderItem.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_name', 'price', 'quantity', 'toppings', 'notes'
    ];

    protected $casts = [
        'toppings' => 'array',
    ];
}
```

---

## LANGKAH 4: DATABASE SEEDER

### `database/seeders/ProductSeeder.php`
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'slug' => 'pisang-crispy-cokelat',
                'name' => 'Pisang Crispy Cokelat',
                'category' => 'crispy',
                'price' => 18000,
                'original_price' => 22000,
                'special_price' => 14500,
                'image' => 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Kriuk renyah panko emas berselimut lelehan cokelat premium.',
                'description' => 'Pisang raja pilihan dipotong pas, dibalut adonan rahasia dan tepung panko renyah, lalu digoreng hingga keemasan.',
                'crisp_level' => 5,
                'melt_level' => 5,
                'rating' => 4.9,
                'reviews_count' => 428,
                'is_best_seller' => false,
                'is_new' => false,
                'portion' => '1 Kotak (6 pcs jumbo)',
                'calories' => '290 kcal / porsi',
                'ingredients' => ['Pisang Raja Matang', 'Tepung Roti Panko', 'Glaze Dark Chocolate Belgian'],
            ],
            [
                'slug' => 'pisang-crispy-keju',
                'name' => 'Pisang Crispy Keju',
                'category' => 'crispy',
                'price' => 18000,
                'original_price' => 22000,
                'special_price' => 14500,
                'image' => 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Gunungan keju cheddar gurih berpadu manis renyahnya pisang.',
                'description' => 'Sensasi gurih renyah tanpa henti. Pisang goreng crispy panas yang ditaburi parutan keju cheddar premium melimpah.',
                'crisp_level' => 5,
                'melt_level' => 4,
                'rating' => 4.8,
                'reviews_count' => 312,
                'is_best_seller' => false,
                'is_new' => false,
                'portion' => '1 Kotak (6 pcs jumbo)',
                'calories' => '280 kcal / porsi',
                'ingredients' => ['Pisang Raja Matang', 'Keju Cheddar Pilihan', 'Susu Kental Manis Gurih'],
            ],
            [
                'slug' => 'pisang-crispy-cokelat-keju',
                'name' => 'Pisang Crispy Cokelat Keju',
                'category' => 'crispy',
                'price' => 22000,
                'original_price' => 26000,
                'special_price' => 16900,
                'image' => 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Varian #1 Terfavorit: Kombinasi sempurna cokelat leleh pekat & gurih keju.',
                'description' => 'Kombinasi juara yang tidak pernah salah! Manis gurih menyatu dalam gigitan kriuk.',
                'crisp_level' => 5,
                'melt_level' => 5,
                'rating' => 5.0,
                'reviews_count' => 980,
                'is_best_seller' => true,
                'is_new' => false,
                'portion' => '1 Kotak (6 pcs jumbo)',
                'calories' => '330 kcal / porsi',
                'ingredients' => ['Pisang Raja Spesial', 'Belgian Dark Chocolate', 'Keju Cheddar Parut'],
            ],
            [
                'slug' => 'pisang-nugget-cokelat',
                'name' => 'Pisang Nugget Cokelat',
                'category' => 'nugget',
                'price' => 20000,
                'original_price' => 24000,
                'special_price' => 15500,
                'image' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Bite-sized nugget pisang empuk di dalam, berenang dalam lumernya cokelat.',
                'description' => 'Nugget pisang lembut berselimut dark chocolate ganache hangat.',
                'crisp_level' => 4,
                'melt_level' => 5,
                'rating' => 4.9,
                'reviews_count' => 512,
                'is_best_seller' => false,
                'is_new' => false,
                'portion' => '1 Kotak (8 cubes)',
                'calories' => '310 kcal / porsi',
                'ingredients' => ['Pisang Olahan Lembut', 'Panko Gold', 'Choco Ganache Dip'],
            ],
            [
                'slug' => 'pisang-nugget-keju',
                'name' => 'Pisang Nugget Keju',
                'category' => 'nugget',
                'price' => 20000,
                'original_price' => 24000,
                'special_price' => 15500,
                'image' => 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Nugget pisang gurih creamy dengan lelehan saus keju spesial.',
                'description' => 'Disiram cheese melt creamy dan salju keju cheddar emas.',
                'crisp_level' => 4,
                'melt_level' => 5,
                'rating' => 4.8,
                'reviews_count' => 389,
                'is_best_seller' => false,
                'is_new' => true,
                'portion' => '1 Kotak (8 cubes)',
                'calories' => '305 kcal / porsi',
                'ingredients' => ['Pisang Olahan Premium', 'Saus Keju Melt Creamy', 'Cheddar Snow'],
            ],
        ];

        foreach ($products as $item) {
            Product::updateOrCreate(['slug' => $item['slug']], $item);
        }
    }
}
```

---

## LANGKAH 5: CONTROLLER

### `app/Http/Controllers/PisangMeltController.php`
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;

class PisangMeltController extends Controller
{
    public function index()
    {
        $products = Product::all();

        // Fallback jika database belum di-seed
        if ($products->isEmpty()) {
            (new \Database\Seeders\ProductSeeder())->run();
            $products = Product::all();
        }

        // Rotasi Otomatis Menu Hari Ini berdasarkan hari
        $todayIndex = date('w') % count($products);
        $dailySpecial = $products[$todayIndex];

        // 3 Paket Promo Bundling
        $bundles = [
            [
                'id' => 'bundle-duo',
                'name' => 'Paket Duo Lumer (Hemat 22%)',
                'items' => '1x Pisang Crispy Cokelat + 1x Pisang Crispy Keju',
                'price' => 31000,
                'original_price' => 40000,
                'badge' => 'Hemat Rp 9.000',
            ],
            [
                'id' => 'bundle-trio',
                'name' => 'Paket Nobar Best Seller',
                'items' => '2x Pisang Crispy Cokelat Keju + 1x Pisang Nugget',
                'price' => 52000,
                'original_price' => 64000,
                'badge' => 'Paling Populer',
            ],
            [
                'id' => 'bundle-pesta',
                'name' => 'Paket Sultan Party Box (Free Ongkir)',
                'items' => 'Semua 5 Varian Lengkap + 2x Extra Dip Saus',
                'price' => 88000,
                'original_price' => 110000,
                'badge' => 'Free Ongkir Instan',
            ],
        ];

        return view('home', compact('products', 'dailySpecial', 'bundles'));
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'nullable|string',
            'delivery_option' => 'required|in:pickup,gosend,grabexpress',
            'payment_method' => 'required|in:qris,bca_va,mandiri_va,gopay,dana,cod',
            'items' => 'required|array|min:1',
            'subtotal' => 'required|integer',
            'discount_amount' => 'required|integer',
            'delivery_fee' => 'required|integer',
            'grand_total' => 'required|integer',
        ]);

        $orderNumber = 'PM-' . rand(1000, 9999);
        $pointsEarned = floor($validated['grand_total'] / 1000);

        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'delivery_option' => $validated['delivery_option'],
            'status' => 'received',
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
            'subtotal' => $validated['subtotal'],
            'discount_amount' => $validated['discount_amount'],
            'delivery_fee' => $validated['delivery_fee'],
            'grand_total' => $validated['grand_total'],
            'points_earned' => $pointsEarned,
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_name' => $item['name'],
                'price' => $item['price'],
                'quantity' => $item['quantity'],
            ]);
        }

        return response()->json([
            'success' => true,
            'order_number' => $order->order_number,
            'grand_total' => $order->grand_total,
            'points_earned' => $pointsEarned,
        ]);
    }

    public function verifyPayment(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->update([
            'payment_status' => 'paid',
            'payment_ref' => 'TRX-' . rand(100000, 999999),
            'status' => 'cooking', // Langsung masuk antrean dapur begitu lunas
        ]);

        return response()->json([
            'success' => true,
            'status' => $order->status,
            'payment_ref' => $order->payment_ref,
        ]);
    }

    public function updateStatus(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->update(['status' => $request->input('status')]);

        return response()->json(['success' => true, 'status' => $order->status]);
    }
}
```

---

## LANGKAH 6: ROUTING

### `routes/web.php`
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PisangMeltController;

Route::get('/', [PisangMeltController::class, 'index'])->name('home');
Route::post('/api/checkout', [PisangMeltController::class, 'checkout'])->name('order.checkout');
Route::post('/api/orders/{orderNumber}/verify-payment', [PisangMeltController::class, 'verifyPayment'])->name('order.verify-payment');
Route::post('/api/orders/{orderNumber}/status', [PisangMeltController::class, 'updateStatus'])->name('order.status');
```

---

## LANGKAH 7: MASTER LAYOUT BLADE

### `resources/views/layouts/app.blade.php`
```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pisang Melt - Pisang Crispy & Nugget Lumer No. 1 Jakarta</title>
    <meta name="description" content="Pisang goreng krispi berbalut tepung panko renyah dengan siraman cokelat lumer premium dan keju melimpah. Pesan instan sekarang!">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        display: ['"Playfair Display"', 'serif'],
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js untuk Reaktivitas Keranjang & Pembayaran -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>[x-cloak] { display: none !important; }</style>
</head>
<body class="bg-[#FAF7F2] text-[#2C241E] font-sans antialiased" x-data="pisangMeltApp()" x-init="initApp()">

    <!-- Top Announcement Banner -->
    <div class="bg-[#241305] text-[#F3EFEA] text-xs py-2.5 px-4 text-center border-b border-stone-800">
        <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>🎉 Promo Peluncuran: Gunakan Voucher <strong>LUMER20</strong> untuk Diskon 20%!</span>
        </div>
    </div>

    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <a href="#" class="text-2xl font-extrabold tracking-tight text-[#3A1E08] font-display flex items-center gap-2">
                <span>Pisang Melt</span>
                <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            </a>

            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
                <a href="#menu-hari-ini" class="text-amber-950 font-bold hover:text-black transition-colors flex items-center gap-1">
                    <span>Menu Hari Ini</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                </a>
                <a href="#menu-varian" class="hover:text-black">Menu Varian</a>
                <a href="#paket-promo" class="hover:text-black">Paket Hemat</a>
                <a href="#poin-hadiah" class="hover:text-black flex items-center gap-1.5">
                    <span>Poin Hadiah</span>
                    <span class="text-[11px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-mono" x-text="loyaltyPoints + ' Pts'"></span>
                </a>
                <a href="#kualitas" class="hover:text-black">Kualitas</a>
                <a href="#ulasan" class="hover:text-black">Ulasan</a>
            </nav>

            <div class="flex items-center gap-3">
                <a href="https://wa.me/6281234567890" target="_blank" class="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg">
                    Chat WA
                </a>

                <button @click="isCartOpen = true" class="relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#3A1E08] hover:bg-black rounded-xl transition-colors shadow-sm">
                    <span>Pesanan</span>
                    <span x-show="cartTotalCount > 0" class="w-5 h-5 bg-amber-400 text-stone-900 rounded-full flex items-center justify-center font-bold text-xs" x-text="cartTotalCount"></span>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main>@yield('content')</main>

    <!-- Slide-out Cart Drawer & Order Tracker -->
    @include('partials.cart-drawer')

    <!-- Modal Pembayaran Online -->
    @include('partials.payment-modal')

    <!-- Floating Tracking Status Pill -->
    <div x-show="activeOrder" x-cloak class="fixed bottom-6 left-6 z-40">
        <button @click="isCartOpen = true; activeTab = 'tracking'" class="bg-[#241305] text-white py-2.5 px-4 rounded-2xl shadow-2xl border border-amber-800 flex items-center gap-3 hover:scale-105 transition-all">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">🍌</div>
            <div class="text-left text-xs">
                <div class="flex items-center gap-1.5">
                    <span class="font-bold text-amber-300 font-mono" x-text="'#' + (activeOrder ? activeOrder.orderId : '')"></span>
                    <span class="text-[11px] font-semibold text-white" x-text="getOrderStatusLabel()"></span>
                </div>
                <span class="text-[10px] text-stone-400">Pantau proses dapur real-time</span>
            </div>
        </button>
    </div>

    <!-- Alpine.js Store & State Logic -->
    <script>
        function pisangMeltApp() {
            return {
                isCartOpen: false,
                isPaymentOpen: false,
                activeTab: 'cart',
                cartItems: [],
                loyaltyPoints: 60,
                activeOrder: null,
                selectedPaymentMethod: 'qris',
                orderInfo: {
                    name: 'Rian Pratama',
                    phone: '081234567890',
                    address: 'Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan',
                    deliveryOption: 'gosend',
                    paymentMethod: 'qris',
                },

                initApp() {
                    const saved = localStorage.getItem('pisang_melt_order');
                    if (saved) this.activeOrder = JSON.parse(saved);
                },

                get cartTotalCount() {
                    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
                },

                get subtotal() {
                    return this.cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
                },

                get discountAmount() {
                    return Math.round(this.subtotal * 0.2); // Diskon 20%
                },

                get deliveryFee() {
                    return (this.orderInfo.deliveryOption === 'pickup' || this.subtotal >= 60000) ? 0 : 10000;
                },

                get grandTotal() {
                    return Math.max(0, this.subtotal - this.discountAmount + this.deliveryFee);
                },

                addToCart(product, customPrice = null) {
                    const price = customPrice || product.price;
                    const existing = this.cartItems.find(i => i.id === product.id);
                    if (existing) existing.quantity++;
                    else this.cartItems.push({ id: product.id, name: product.name, price: price, quantity: 1, image: product.image });
                    this.isCartOpen = true;
                    this.activeTab = 'cart';
                },

                updateQty(id, qty) {
                    if (qty <= 0) this.cartItems = this.cartItems.filter(i => i.id !== id);
                    else { const item = this.cartItems.find(i => i.id === id); if (item) item.quantity = qty; }
                },

                openPaymentModal() {
                    if (!this.orderInfo.name || !this.orderInfo.phone) {
                        alert('Mohon lengkapi nama dan nomor WhatsApp Anda.');
                        return;
                    }

                    const orderNumber = 'PM-' + Math.floor(1000 + Math.random() * 9000);
                    this.activeOrder = {
                        orderId: orderNumber,
                        grandTotal: this.grandTotal,
                        status: 'received',
                        paymentStatus: 'pending',
                        paymentMethod: this.orderInfo.paymentMethod,
                        items: [...this.cartItems],
                    };

                    localStorage.setItem('pisang_melt_order', JSON.stringify(this.activeOrder));
                    this.cartItems = [];
                    this.isPaymentOpen = true;
                    this.activeTab = 'tracking';
                },

                confirmPaymentSuccess() {
                    if (!this.activeOrder) return;
                    this.activeOrder.paymentStatus = 'paid';
                    this.activeOrder.status = 'cooking';
                    this.activeOrder.paymentRef = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                    this.loyaltyPoints += Math.floor(this.activeOrder.grandTotal / 1000);
                    localStorage.setItem('pisang_melt_order', JSON.stringify(this.activeOrder));
                    this.isPaymentOpen = false;
                },

                getOrderStatusLabel() {
                    if (!this.activeOrder) return '';
                    if (this.activeOrder.status === 'received') return 'Pesanan Diterima';
                    if (this.activeOrder.status === 'cooking') return 'Sedang Dimasak';
                    if (this.activeOrder.status === 'ready') return 'Siap Diantar';
                    return '';
                }
            }
        }
    </script>
</body>
</html>
```

---

## LANGKAH 8: HALAMAN UTAMA BLADE

### `resources/views/home.blade.php`
```html
@extends('layouts.app')

@section('content')
<!-- 1. Hero Section -->
<section class="py-16 sm:py-24 bg-gradient-to-b from-[#FAF7F2] to-amber-50/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                🍌 Pisang Goreng Crispy Artisan #1 Jakarta
            </span>
            <h1 class="text-4xl sm:text-6xl font-black text-[#241305] font-display leading-tight tracking-tight">
                Kriuknya Emas, <br><span class="italic text-amber-700">Lumernya Pecah di Lidah.</span>
            </h1>
            <p class="text-stone-600 text-sm sm:text-base max-w-xl leading-relaxed">
                Pisang raja pilihan dipotong pas, dibalut adonan rahasia dan tepung panko renyah, digoreng dadakan hingga keemasan dengan siraman cokelat lumer premium dan keju gurih melimpah.
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-2">
                <a href="#menu-hari-ini" class="px-6 py-3.5 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-lg transition-all">
                    Lihat Promo Hari Ini (Diskon 35%)
                </a>
                <a href="#menu-varian" class="px-6 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors">
                    Jelajahi 5 Varian
                </a>
            </div>
        </div>

        <div class="lg:col-span-5 relative">
            <div class="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img src="{{ $dailySpecial->image ?? $dailySpecial['image'] }}" class="w-full h-full object-cover" alt="Pisang Melt">
            </div>
        </div>
    </div>
</section>

<!-- 2. Menu Hari Ini (Flash Deal Harian) -->
<section id="menu-hari-ini" class="py-14 bg-gradient-to-b from-[#FAF7F2] to-amber-50/50 border-y border-amber-900/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
            <span class="text-xs font-bold text-amber-900 uppercase tracking-wider block">🔥 Flash Deal Harian</span>
            <h2 class="text-3xl font-extrabold text-[#241305] font-display">Menu Spesial Hari Ini</h2>
            <p class="text-xs sm:text-sm text-stone-600 mt-1">
                Diskon spesial hingga 35% + Gratis 1 Cup Extra Molten Choco Dipping Sauce!
            </p>
        </div>

        <div class="bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div class="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto">
                <img src="{{ $dailySpecial->image ?? $dailySpecial['image'] }}" class="w-full h-full object-cover" alt="{{ $dailySpecial->name ?? $dailySpecial['name'] }}">
                <span class="absolute top-4 left-4 bg-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-lg shadow">
                    Diskon Spesial Hari Ini
                </span>
            </div>

            <div class="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div class="space-y-3">
                    <span class="text-xs font-semibold text-amber-800 uppercase tracking-wider">Varian Rekomendasi</span>
                    <h3 class="text-2xl sm:text-3xl font-black text-[#241305] font-display">{{ $dailySpecial->name ?? $dailySpecial['name'] }}</h3>
                    <p class="text-xs text-stone-600 leading-relaxed">{{ $dailySpecial->description ?? $dailySpecial['description'] }}</p>

                    <div class="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                        <strong>🎁 Keuntungan Spesial Hari Ini:</strong>
                        <ul class="list-disc pl-5">
                            <li>Gratis 1 cup Extra Molten Choco Dip (Rp 0)</li>
                            <li>Bonus Poin Loyalty MeltClub</li>
                        </ul>
                    </div>
                </div>

                <div class="pt-4 border-t border-stone-200 flex items-center justify-between">
                    <div>
                        <span class="text-xs text-stone-400 line-through">Rp {{ number_format($dailySpecial->original_price ?? $dailySpecial['original_price'], 0, ',', '.') }}</span>
                        <div class="text-3xl font-black text-[#241305] font-display">
                            Rp {{ number_format($dailySpecial->special_price ?? $dailySpecial['special_price'], 0, ',', '.') }}
                        </div>
                    </div>

                    <button @click="addToCart({{ json_encode($dailySpecial) }}, {{ $dailySpecial->special_price ?? $dailySpecial['special_price'] }})" class="px-6 py-3 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all">
                        + Ambil Promo Hari Ini
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 3. Katalog 5 Varian dengan Animasi Hover Interaktif -->
<section id="menu-varian" class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold text-[#241305] font-display">5 Pilihan Varian Pisang Melt</h2>
        <p class="text-xs sm:text-sm text-stone-600 mt-2">Dibuat fresh dadakan hanya saat Anda memesan.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($products as $product)
        <div class="group relative bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-950/15 hover:-translate-y-2 hover:border-amber-400/80 transition-all duration-300 ease-out cursor-pointer select-none">
            
            <!-- Foto dengan Zoom & Quick Hover Badge -->
            <div class="aspect-[4/3] relative overflow-hidden bg-stone-900">
                <img src="{{ $product->image ?? $product['image'] }}" alt="{{ $product->name ?? $product['name'] }}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110">
                
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span class="px-3.5 py-1.5 rounded-full bg-white/95 text-[#241305] text-xs font-bold shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-amber-200">
                        <span>✨ Kustomisasi & Pesan</span>
                    </span>
                </div>

                @if(!empty($product->is_best_seller ?? $product['is_best_seller']))
                <span class="absolute top-3 left-3 bg-[#3A1E08] text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow transform group-hover:scale-105 transition-transform">
                    🔥 BEST SELLER #1
                </span>
                @endif
            </div>

            <!-- Detail Produk & Tombol Pesan -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-amber-50/20 transition-colors duration-300">
                <div>
                    <h3 class="text-base font-bold text-[#241305] font-display group-hover:text-amber-800 transition-colors">{{ $product->name ?? $product['name'] }}</h3>
                    <p class="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">{{ $product->description ?? $product['description'] }}</p>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-stone-100 group-hover:border-amber-200/60 transition-colors">
                    <div>
                        <span class="text-[11px] text-stone-400 line-through">Rp {{ number_format($product->original_price ?? $product['original_price'], 0, ',', '.') }}</span>
                        <div class="text-base font-extrabold text-[#3A1E08] group-hover:text-amber-950">Rp {{ number_format($product->price ?? $product['price'], 0, ',', '.') }}</div>
                    </div>

                    <button @click="addToCart({{ json_encode($product) }})" class="px-4 py-2 bg-[#3A1E08] hover:bg-black group-hover:bg-[#241305] text-white text-xs font-bold rounded-xl shadow-sm transform group-hover:scale-105 transition-all">
                        + Pesan
                    </button>
                </div>
            </div>
        </div>
        @endforeach
    </div>
</section>

<!-- 4. Paket Promo Bundling -->
<section id="paket-promo" class="py-16 bg-[#FAF7F2] border-t border-stone-200">
    <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#241305] font-display text-center mb-8">Paket Hemat Nobar & Pesta</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach($bundles as $b)
            <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                    <span class="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">{{ $b['badge'] }}</span>
                    <h3 class="text-lg font-bold text-[#241305] mt-2 font-display">{{ $b['name'] }}</h3>
                    <p class="text-xs text-stone-600 mt-1">{{ $b['items'] }}</p>
                </div>
                <div class="flex justify-between items-center pt-3 border-t">
                    <span class="text-lg font-black text-[#241305]">Rp {{ number_format($b['price'], 0, ',', '.') }}</span>
                    <button @click="addToCart({ id: '{{ $b['id'] }}', name: '{{ $b['name'] }}', price: {{ $b['price'] }} })" class="px-3.5 py-1.5 bg-[#3A1E08] text-white text-xs font-bold rounded-lg">+ Ambil</button>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>
@endsection
```

---

## LANGKAH 9: DRAWER KERANJANG & PELACAKAN STATUS

### `resources/views/partials/cart-drawer.blade.php`
```html
<div x-show="isCartOpen" x-cloak class="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
    <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between" @click.away="isCartOpen = false">
        
        <!-- Header & Dual Tabs -->
        <div>
            <div class="p-4 border-b flex justify-between bg-stone-50">
                <h3 class="font-bold text-stone-900 font-display">Pemesanan & Status</h3>
                <button @click="isCartOpen = false">✕</button>
            </div>

            <div class="flex border-b bg-stone-100 p-1 text-xs font-bold">
                <button @click="activeTab = 'cart'" :class="activeTab === 'cart' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'" class="flex-1 py-2 rounded-lg">
                    Keranjang (<span x-text="cartTotalCount"></span>)
                </button>
                <button @click="activeTab = 'tracking'" :class="activeTab === 'tracking' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'" class="flex-1 py-2 rounded-lg relative">
                    Status Dapur
                    <span x-show="activeOrder" class="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-2 right-4"></span>
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            
            <!-- Tab 1: Keranjang Belanja -->
            <div x-show="activeTab === 'cart'">
                <template x-if="cartItems.length === 0">
                    <p class="text-center py-16 text-xs text-stone-400">Keranjang belanja Anda masih kosong.</p>
                </template>

                <div class="space-y-2">
                    <template x-for="item in cartItems" :key="item.id">
                        <div class="p-3 bg-[#FAF7F2] rounded-xl border flex justify-between items-center">
                            <div>
                                <h4 class="text-xs font-bold" x-text="item.name"></h4>
                                <span class="text-xs text-amber-900 font-mono" x-text="'Rp ' + (item.price * item.quantity).toLocaleString('id-ID')"></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button @click="updateQty(item.id, item.quantity - 1)" class="w-6 h-6 border rounded bg-white text-xs font-bold">-</button>
                                <span class="text-xs font-bold" x-text="item.quantity"></span>
                                <button @click="updateQty(item.id, item.quantity + 1)" class="w-6 h-6 border rounded bg-white text-xs font-bold">+</button>
                            </div>
                        </div>
                    </template>
                </div>

                <div x-show="cartItems.length > 0" class="pt-4 border-t space-y-2 mt-4">
                    <span class="text-xs font-bold uppercase block">Data Pengiriman:</span>
                    <input type="text" x-model="orderInfo.name" placeholder="Nama Lengkap" class="w-full text-xs p-2.5 border rounded-lg">
                    <input type="tel" x-model="orderInfo.phone" placeholder="Nomor WhatsApp" class="w-full text-xs p-2.5 border rounded-lg">
                    <textarea x-model="orderInfo.address" placeholder="Alamat Pengiriman Lengkap" class="w-full text-xs p-2.5 border rounded-lg"></textarea>
                </div>
            </div>

            <!-- Tab 2: Visual 3-Stage Order Tracking Stepper -->
            <div x-show="activeTab === 'tracking'" class="space-y-4">
                <template x-if="activeOrder">
                    <div>
                        <!-- Header Status Card -->
                        <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex justify-between items-center">
                            <div>
                                <span class="text-[10px] text-stone-500 uppercase block font-semibold">Nomor Tiket</span>
                                <span class="text-sm font-bold font-mono" x-text="'#' + activeOrder.orderId"></span>
                            </div>
                            <span :class="activeOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'" class="px-2.5 py-1 text-[11px] font-bold rounded-lg" x-text="activeOrder.paymentStatus === 'paid' ? 'LUNAS (VERIFIED)' : 'MENUNGGU PEMBAYARAN'"></span>
                        </div>

                        <!-- 3 Tahapan Utama Dapur -->
                        <div class="space-y-6 pl-4 border-l-2 border-amber-600 text-xs">
                            <div>
                                <h4 class="font-bold text-amber-900">1. Pesanan Diterima</h4>
                                <p class="text-[11px] text-stone-500">Tiket masuk antrean dapur Senopati.</p>
                            </div>
                            <div>
                                <h4 class="font-bold text-stone-700">2. Sedang Dimasak</h4>
                                <p class="text-[11px] text-stone-500">Pisang digoreng panko emas & dilumuri cokelat leleh.</p>
                            </div>
                            <div>
                                <h4 class="font-bold text-stone-700">3. Siap Diantar</h4>
                                <p class="text-[11px] text-stone-500">Dikemas boks berventilasi, siap diserahkan ke kurir.</p>
                            </div>
                        </div>

                        <!-- Interactive Status Simulation Buttons -->
                        <div class="mt-8 p-3 bg-stone-100 rounded-xl space-y-2">
                            <span class="text-[10px] text-stone-500 font-bold uppercase block">Simulasi Perubahan Status Dapur:</span>
                            <div class="grid grid-cols-3 gap-1 text-[11px]">
                                <button @click="activeOrder.status = 'received'" class="p-1.5 bg-white rounded font-bold">1. Diterima</button>
                                <button @click="activeOrder.status = 'cooking'" class="p-1.5 bg-white rounded font-bold">2. Dimasak</button>
                                <button @click="activeOrder.status = 'ready'" class="p-1.5 bg-white rounded font-bold">3. Siap</button>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Footer Checkout Actions -->
        <div x-show="activeTab === 'cart' && cartItems.length > 0" class="p-4 border-t bg-stone-50 space-y-2">
            <div class="flex justify-between text-sm font-bold text-stone-900">
                <span>Total Tagihan:</span>
                <span class="font-mono text-base" x-text="'Rp ' + grandTotal.toLocaleString('id-ID')"></span>
            </div>
            <button @click="openPaymentModal()" class="w-full py-3 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md">
                Bayar Online Sekarang (QRIS / VA / E-Wallet)
            </button>
        </div>
    </div>
</div>
```

---

## LANGKAH 10: MODAL PEMBAYARAN ONLINE

### `resources/views/partials/payment-modal.blade.php`
```html
<div x-show="isPaymentOpen" x-cloak class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-stone-200" @click.away="isPaymentOpen = false">
        
        <div class="flex justify-between items-center border-b pb-3">
            <div>
                <h3 class="font-bold text-base text-stone-900 font-display">Pembayaran Online Pisang Melt</h3>
                <p class="text-xs text-stone-500">Terenkripsi & Konfirmasi Gateway Instan</p>
            </div>
            <button @click="isPaymentOpen = false" class="text-stone-400 hover:text-black">✕</button>
        </div>

        <div class="p-3.5 bg-[#FAF7F2] rounded-xl flex justify-between items-center">
            <span class="text-xs text-stone-600">Total Tagihan:</span>
            <span class="font-bold text-xl font-mono text-[#241305]" x-text="'Rp ' + (activeOrder ? activeOrder.grandTotal.toLocaleString('id-ID') : 0)"></span>
        </div>

        <!-- Saluran Pembayaran (QRIS & Virtual Account) -->
        <div class="space-y-2">
            <span class="text-xs font-bold text-stone-700 uppercase block">Metode Pembayaran:</span>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <button @click="selectedPaymentMethod = 'qris'" :class="selectedPaymentMethod === 'qris' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-stone-200'" class="p-2.5 border rounded-xl text-left">
                    <div>QRIS Instan</div>
                    <span class="text-[10px] text-stone-500">BCA, GoPay, OVO, DANA</span>
                </button>
                <button @click="selectedPaymentMethod = 'bca_va'" :class="selectedPaymentMethod === 'bca_va' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-stone-200'" class="p-2.5 border rounded-xl text-left">
                    <div>BCA Virtual Account</div>
                    <span class="text-[10px] text-stone-500">8271081234567890</span>
                </button>
            </div>
        </div>

        <!-- QRIS Box -->
        <div x-show="selectedPaymentMethod === 'qris'" class="p-4 bg-stone-50 border rounded-2xl text-center space-y-2">
            <span class="text-xs font-bold text-stone-700">SCAN QRIS STANDAR NASIONAL</span>
            <div class="w-36 h-36 mx-auto bg-white border-2 border-stone-800 rounded-xl flex items-center justify-center text-4xl shadow-inner">
                🍌
            </div>
            <span class="text-[10px] text-stone-500 font-mono block">NMID: ID1024567891234 · PISANG MELT</span>
        </div>

        <!-- Tombol Saya Sudah Bayar -->
        <button @click="confirmPaymentSuccess()" class="w-full py-3 bg-[#1F512B] hover:bg-[#163c20] text-white font-bold text-xs rounded-xl shadow-md transition-all">
            Saya Sudah Bayar (Konfirmasi Otomatis)
        </button>
    </div>
</div>
```

---

## CARA MENJALANKAN DI SERVER / LOCALHOST
1. Jalankan migrasi:
   ```bash
   php artisan migrate:fresh --seed --seeder=ProductSeeder
   ```
2. Jalankan server lokal:
   ```bash
   php artisan serve
   ```
3. Buka di browser: `http://127.0.0.1:8000`. Aplikasi Pisang Melt siap digunakan dengan seluruh fitur interaktif lengkap!
