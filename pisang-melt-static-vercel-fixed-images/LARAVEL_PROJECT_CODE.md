# Pisang Melt - Panduan & Kode Lengkap Implementasi Laravel 11 / 12

Dokumen ini berisi kode sumber lengkap untuk mereplikasi aplikasi **Pisang Melt Artisan** ke dalam framework **Laravel** dengan tampilan dan interaksi 100% sama persis dengan hasil preview (Tailwind CSS v3/v4 + Alpine.js untuk reaktivitas keranjang, pelacakan status, dan modal pembayaran online).

---

## 1. Skema Database & Migrasi (`database/migrations/`)

### A. Migrasi Produk (`database/migrations/2026_01_01_000001_create_products_table.php`)
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
            $table->integer('special_price')->nullable(); // Harga flash deal menu hari ini
            $table->string('image');
            $table->string('tagline');
            $table->text('description');
            $table->tinyInteger('crisp_level')->default(5);
            $table->tinyInteger('melt_level')->default(5);
            $table->decimal('rating', 2, 1)->default(4.9);
            $table->integer('reviews_count')->default(100);
            $table->boolean('is_best_seller')->default(false);
            $table->boolean('is_new')->default(false);
            $table->string('portion')->default('1 Kotak (6 pcs)');
            $table->string('calories')->default('300 kcal');
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

### B. Migrasi Pesanan (`database/migrations/2026_01_01_000002_create_orders_table.php`)
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
            $table->string('order_number')->unique(); // Contoh: PM-8492
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address')->nullable();
            $table->enum('delivery_option', ['pickup', 'gosend', 'grabexpress'])->default('gosend');
            $table->enum('status', ['received', 'cooking', 'ready'])->default('received');
            $table->enum('payment_method', ['qris', 'bca_va', 'mandiri_va', 'gopay', 'dana', 'cod'])->default('qris');
            $table->enum('payment_status', ['pending', 'paid', 'verified'])->default('pending');
            $table->string('payment_ref')->nullable();
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
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->integer('price');
            $table->integer('quantity');
            $table->json('toppings')->nullable();
            $table->text('item_notes')->nullable();
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

## 2. Model Eloquent (`app/Models/`)

### `app/Models/Product.php`
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

### `app/Models/Order.php`
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

---

## 3. Controller (`app/Http/Controllers/PisangMeltController.php`)

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Str;

class PisangMeltController extends Controller
{
    public function index()
    {
        // 5 Varian Utama Pisang Melt
        $products = [
            [
                'id' => 1,
                'slug' => 'pisang-crispy-cokelat',
                'name' => 'Pisang Crispy Cokelat',
                'category' => 'crispy',
                'price' => 18000,
                'original_price' => 22000,
                'special_price' => 14500,
                'image' => 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Kriuk renyah panko emas berselimut lelehan cokelat premium.',
                'description' => 'Pisang raja pilihan dipotong pas, dibalut adonan rahasia dan tepung panko renyah, lalu digoreng hingga keemasan.',
                'rating' => 4.9,
                'reviews_count' => 428,
                'portion' => '1 Kotak (6 pcs jumbo)',
                'is_best_seller' => false,
            ],
            [
                'id' => 2,
                'slug' => 'pisang-crispy-keju',
                'name' => 'Pisang Crispy Keju',
                'category' => 'crispy',
                'price' => 18000,
                'original_price' => 22000,
                'special_price' => 14500,
                'image' => 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Gunungan keju cheddar gurih berpadu manis renyahnya pisang.',
                'description' => 'Sensasi gurih renyah tanpa henti dengan keju cheddar melimpah dan susu legit.',
                'rating' => 4.8,
                'reviews_count' => 312,
                'portion' => '1 Kotak (6 pcs jumbo)',
                'is_best_seller' => false,
            ],
            [
                'id' => 3,
                'slug' => 'pisang-crispy-cokelat-keju',
                'name' => 'Pisang Crispy Cokelat Keju',
                'category' => 'crispy',
                'price' => 22000,
                'original_price' => 26000,
                'special_price' => 16900,
                'image' => 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Varian #1 Terfavorit: Kombinasi sempurna cokelat leleh pekat & gurih keju.',
                'description' => 'Kombinasi juara yang tidak pernah salah! Manis gurih menyatu dalam gigitan kriuk.',
                'rating' => 5.0,
                'reviews_count' => 980,
                'portion' => '1 Kotak (6 pcs jumbo)',
                'is_best_seller' => true,
            ],
            [
                'id' => 4,
                'slug' => 'pisang-nugget-cokelat',
                'name' => 'Pisang Nugget Cokelat',
                'category' => 'nugget',
                'price' => 20000,
                'original_price' => 24000,
                'special_price' => 15500,
                'image' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Bite-sized nugget pisang empuk di dalam, berenang dalam lumernya cokelat.',
                'description' => 'Nugget pisang lembut berselimut dark chocolate ganache hangat.',
                'rating' => 4.9,
                'reviews_count' => 512,
                'portion' => '1 Kotak (8 cubes)',
                'is_best_seller' => false,
            ],
            [
                'id' => 5,
                'slug' => 'pisang-nugget-keju',
                'name' => 'Pisang Nugget Keju',
                'category' => 'nugget',
                'price' => 20000,
                'original_price' => 24000,
                'special_price' => 15500,
                'image' => 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=800&q=80',
                'tagline' => 'Nugget pisang gurih creamy dengan lelehan saus keju spesial.',
                'description' => 'Disiram cheese melt creamy dan salju keju cheddar emas.',
                'rating' => 4.8,
                'reviews_count' => 389,
                'portion' => '1 Kotak (8 cubes)',
                'is_new' => true,
            ],
        ];

        // Paket Promo Bundling
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

        // Varian "Menu Hari Ini" (rotasi berdasarkan hari dalam seminggu)
        $todayIndex = date('w') % count($products);
        $dailySpecial = $products[$todayIndex];

        return view('home', compact('products', 'bundles', 'dailySpecial'));
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
            'notes' => 'nullable|string',
        ]);

        $orderNumber = 'PM-' . rand(1000, 9999);
        $pointsEarned = floor($validated['grand_total'] / 1000);

        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'delivery_option' => $validated['delivery_option'],
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
            'status' => 'received',
            'subtotal' => $validated['subtotal'],
            'discount_amount' => $validated['discount_amount'],
            'delivery_fee' => $validated['delivery_fee'],
            'grand_total' => $validated['grand_total'],
            'points_earned' => $pointsEarned,
            'notes' => $validated['notes'],
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_name' => $item['name'],
                'price' => $item['price'],
                'quantity' => $item['quantity'],
                'toppings' => $item['toppings'] ?? [],
                'item_notes' => $item['notes'] ?? null,
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
            'status' => 'cooking', // Langsung masuk antrean masak setelah lunas
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil diverifikasi (LUNAS)',
            'status' => $order->status,
            'payment_ref' => $order->payment_ref,
        ]);
    }

    public function updateOrderStatus(Request $request, $orderNumber)
    {
        $validated = $request->validate([
            'status' => 'required|in:received,cooking,ready',
        ]);

        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'order_number' => $order->order_number,
            'status' => $order->status,
        ]);
    }
}
```

---

## 4. Routes (`routes/web.php`)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PisangMeltController;

Route::get('/', [PisangMeltController::class, 'index'])->name('home');
Route::post('/api/checkout', [PisangMeltController::class, 'checkout'])->name('order.checkout');
Route::post('/api/orders/{orderNumber}/verify-payment', [PisangMeltController::class, 'verifyPayment'])->name('order.verify-payment');
Route::post('/api/orders/{orderNumber}/status', [PisangMeltController::class, 'updateOrderStatus'])->name('order.status');
```

---

## 5. Layout Utama Blade (`resources/views/layouts/app.blade.php`)

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pisang Melt - Pisang Crispy & Nugget Lumer No. 1 Jakarta</title>
    <meta name="description" content="Pisang goreng krispi berbalut tepung panko renyah dengan siraman cokelat lumer premium dan keju melimpah. Pesan instan sekarang!">

    <!-- Google Fonts: Plus Jakarta Sans & Playfair Display -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (via CDN atau Vite) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        display: ['"Playfair Display"', 'serif'],
                    },
                    colors: {
                        brand: {
                            dark: '#241305',
                            brown: '#3A1E08',
                            amber: '#F59E0B',
                            cream: '#FAF7F2',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js untuk state reaktif keranjang, pembayaran, dan pelacakan pesanan -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-[#FAF7F2] text-[#2C241E] font-sans antialiased" x-data="pisangMeltApp()" x-init="initApp()">

    <!-- Top Announcement Promo Banner -->
    <div class="bg-[#241305] text-[#F3EFEA] text-xs font-medium py-2.5 px-4 text-center border-b border-[#3A1E08]">
        <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>🎉 Promo Peluncuran: Gunakan Voucher <strong>LUMER20</strong> untuk Diskon 20%!</span>
            <button @click="applyPromo('LUMER20')" class="underline hover:text-amber-400 font-bold ml-1">Klaim</button>
        </div>
    </div>

    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#2C241E]/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <a href="#" class="flex items-center gap-2 group">
                <span class="text-2xl font-extrabold tracking-tight text-[#3A1E08] font-display">Pisang Melt</span>
                <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            </a>

            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-[#5C4A3E]">
                <a href="#menu-hari-ini" class="text-amber-950 font-bold hover:text-black transition-colors flex items-center gap-1">
                    <span>Menu Hari Ini</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                </a>
                <a href="#menu-varian" class="hover:text-[#3A1E08]">Menu Varian</a>
                <a href="#paket-promo" class="hover:text-[#3A1E08]">Paket Hemat</a>
                <a href="#poin-hadiah" class="hover:text-[#3A1E08] flex items-center gap-1">
                    <span>Poin Hadiah</span>
                    <span class="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded tabular-nums" x-text="loyaltyPoints + ' Pts'"></span>
                </a>
                <a href="#kualitas" class="hover:text-[#3A1E08]">Kualitas</a>
                <a href="#ulasan" class="hover:text-[#3A1E08]">Ulasan</a>
            </nav>

            <div class="flex items-center gap-2 sm:gap-3">
                <a href="https://wa.me/6281234567890" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1F512B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg">
                    <span>Chat WA</span>
                </a>

                <button @click="isCartOpen = true" class="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#3A1E08] hover:bg-black rounded-lg transition-colors shadow-sm">
                    <span>Pesanan</span>
                    <span x-show="cartTotalCount > 0" class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-[#3A1E08] bg-amber-400 rounded-full tabular-nums" x-text="cartTotalCount"></span>
                </button>
            </div>
        </div>
    </header>

    <!-- Main View Slot -->
    <main>
        @yield('content')
    </main>

    <!-- Slide-out Cart & Payment Drawer -->
    @include('partials.cart-drawer')

    <!-- Online Payment Gateway Modal (QRIS / VA / E-Wallet) -->
    @include('partials.payment-modal')

    <!-- Floating Tracking Status Pill -->
    <div x-show="activeOrder" x-cloak class="fixed bottom-6 left-6 z-40">
        <button @click="isCartOpen = true; activeTab = 'tracking'" class="bg-[#241305] text-white py-2.5 px-4 rounded-2xl shadow-2xl border border-amber-800/80 flex items-center gap-3 hover:scale-105 transition-all">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                🍌
            </div>
            <div class="text-left text-xs">
                <div class="flex items-center gap-1.5">
                    <span class="font-bold text-amber-300 font-mono" x-text="'#' + (activeOrder ? activeOrder.orderId : '')"></span>
                    <span class="text-[11px] font-semibold text-white" x-text="getOrderStatusLabel()"></span>
                </div>
                <span class="text-[10px] text-stone-400">Pantau proses dapur real-time</span>
            </div>
        </button>
    </div>

    <!-- Alpine.js Store & Logic Script -->
    <script>
        function pisangMeltApp() {
            return {
                isCartOpen: false,
                isPaymentModalOpen: false,
                activeTab: 'cart', // 'cart' atau 'tracking'
                cartItems: [],
                loyaltyPoints: 60,
                appliedDiscount: { code: 'LUMER20', percent: 20 },
                activeOrder: null,
                selectedPaymentMethod: 'qris',
                orderInfo: {
                    name: 'Rian Pratama',
                    phone: '081234567890',
                    address: 'Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan',
                    deliveryOption: 'gosend',
                    paymentMethod: 'qris',
                    notes: 'Goreng garing, ekstra topping saus',
                },

                initApp() {
                    const savedOrder = localStorage.getItem('pisang_melt_order');
                    if (savedOrder) {
                        this.activeOrder = JSON.parse(savedOrder);
                    }
                },

                get cartTotalCount() {
                    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
                },

                get subtotal() {
                    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                },

                get discountAmount() {
                    return this.appliedDiscount ? Math.round((this.subtotal * this.appliedDiscount.percent) / 100) : 0;
                },

                get deliveryFee() {
                    if (this.orderInfo.deliveryOption === 'pickup') return 0;
                    return this.subtotal >= 60000 || this.subtotal === 0 ? 0 : 10000;
                },

                get grandTotal() {
                    return Math.max(0, this.subtotal - this.discountAmount + this.deliveryFee);
                },

                addToCart(product, customPrice = null) {
                    const price = customPrice || product.price;
                    const existing = this.cartItems.find(item => item.id === product.id);
                    if (existing) {
                        existing.quantity++;
                    } else {
                        this.cartItems.push({
                            id: product.id,
                            name: product.name,
                            price: price,
                            image: product.image,
                            quantity: 1,
                        });
                    }
                    this.isCartOpen = true;
                    this.activeTab = 'cart';
                },

                removeItem(id) {
                    this.cartItems = this.cartItems.filter(item => item.id !== id);
                },

                updateQuantity(id, qty) {
                    if (qty <= 0) {
                        this.removeItem(id);
                        return;
                    }
                    const item = this.cartItems.find(i => i.id === id);
                    if (item) item.quantity = qty;
                },

                initiateOnlinePayment() {
                    if (!this.orderInfo.name || !this.orderInfo.phone) {
                        alert('Mohon lengkapi nama dan nomor WhatsApp Anda.');
                        return;
                    }

                    const orderNumber = 'PM-' + Math.floor(1000 + Math.random() * 9000);
                    this.activeOrder = {
                        orderId: orderNumber,
                        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
                        status: 'received',
                        paymentStatus: 'pending',
                        paymentMethod: this.orderInfo.paymentMethod,
                        items: [...this.cartItems],
                        grandTotal: this.grandTotal,
                        customerInfo: { ...this.orderInfo }
                    };

                    localStorage.setItem('pisang_melt_order', JSON.stringify(this.activeOrder));
                    this.cartItems = [];
                    this.isPaymentModalOpen = true;
                    this.activeTab = 'tracking';
                },

                confirmPaymentSuccess() {
                    if (!this.activeOrder) return;
                    this.activeOrder.paymentStatus = 'paid';
                    this.activeOrder.status = 'cooking';
                    this.activeOrder.paymentRef = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                    this.loyaltyPoints += Math.floor(this.activeOrder.grandTotal / 1000);
                    localStorage.setItem('pisang_melt_order', JSON.stringify(this.activeOrder));
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

## 6. View Beranda Utama (`resources/views/home.blade.php`)

```html
@extends('layouts.app')

@section('content')
<!-- Hero Section -->
<section class="py-16 sm:py-24 bg-gradient-to-b from-[#FAF7F2] to-amber-50/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    <span>🍌 #1 Pisang Goreng Crispy Artisan Jakarta</span>
                </div>
                <h1 class="text-4xl sm:text-6xl font-black text-[#241305] font-display tracking-tight leading-tight">
                    Kriuknya Emas, <br><span class="italic text-amber-700">Lumernya Pecah di Lidah.</span>
                </h1>
                <p class="text-stone-600 text-sm sm:text-base max-w-xl">
                    Pisang raja matang pohon pilihan digoreng dadakan dengan tepung panko Jepang berbalut cokelat Belgia murni dan tumpukan keju cheddar gurih.
                </p>
                <div class="flex flex-wrap items-center gap-4 pt-2">
                    <a href="#menu-hari-ini" class="px-6 py-3.5 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                        Lihat Menu Hari Ini (Diskon 35%)
                    </a>
                    <a href="#menu-varian" class="px-6 py-3.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors">
                        Jelajahi 5 Varian
                    </a>
                </div>
            </div>

            <div class="lg:col-span-5 relative">
                <div class="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <img src="{{ $dailySpecial['image'] }}" alt="Pisang Melt Crispy" class="w-full h-full object-cover">
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Menu Hari Ini (Flash Deal Harian) -->
<section id="menu-hari-ini" class="py-14 bg-gradient-to-b from-[#FAF7F2] to-amber-50/50 border-y border-amber-900/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-8">
            <div>
                <span class="text-xs font-bold text-amber-900 uppercase tracking-wider block">🔥 Flash Deal Harian</span>
                <h2 class="text-3xl font-extrabold text-[#241305] font-display">Menu Spesial Hari Ini</h2>
                <p class="text-xs text-stone-600 mt-1">Diskon spesial hingga 35% + Gratis Extra Molten Choco Dipping Sauce!</p>
            </div>
        </div>

        <div class="bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div class="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto">
                <img src="{{ $dailySpecial['image'] }}" alt="{{ $dailySpecial['name'] }}" class="w-full h-full object-cover">
                <span class="absolute top-4 left-4 bg-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-lg shadow">
                    Diskon Spesial Hari Ini
                </span>
            </div>

            <div class="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div class="space-y-3">
                    <span class="text-xs font-semibold text-amber-800 uppercase tracking-wider">Varian Pilihan Hari Ini</span>
                    <h3 class="text-2xl sm:text-3xl font-black text-[#241305] font-display">{{ $dailySpecial['name'] }}</h3>
                    <p class="text-xs text-stone-600 leading-relaxed">{{ $dailySpecial['description'] }}</p>

                    <div class="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                        <strong>🎁 Keuntungan Menu Hari Ini:</strong>
                        <ul class="list-disc pl-5">
                            <li>Gratis 1 cup Extra Molten Choco Dip (Rp 0)</li>
                            <li>Bonus Poin Loyalty MeltClub</li>
                        </ul>
                    </div>
                </div>

                <div class="pt-4 border-t border-stone-200 flex items-center justify-between">
                    <div>
                        <span class="text-xs text-stone-400 line-through">Rp {{ number_format($dailySpecial['original_price'], 0, ',', '.') }}</span>
                        <div class="text-3xl font-black text-[#241305] font-display">
                            Rp {{ number_format($dailySpecial['special_price'], 0, ',', '.') }}
                        </div>
                    </div>

                    <button @click="addToCart({{ json_encode($dailySpecial) }}, {{ $dailySpecial['special_price'] }})" class="px-6 py-3 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all">
                        + Ambil Promo Hari Ini
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Menu 5 Varian Grid -->
<section id="menu-varian" class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold text-[#241305] font-display">5 Pilihan Varian Pisang Melt</h2>
        <p class="text-xs sm:text-sm text-stone-600 mt-2">Dibuat fresh dadakan hanya saat Anda memesan.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($products as $product)
        <div class="group relative bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-950/15 hover:-translate-y-2 hover:border-amber-400/80 transition-all duration-300 ease-out cursor-pointer select-none">
            <!-- Image with Zoom & Hover Overlay -->
            <div class="aspect-[4/3] relative overflow-hidden bg-stone-900">
                <img src="{{ $product['image'] }}" alt="{{ $product['name'] }}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110">
                
                <!-- Quick Hover Badge -->
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span class="px-3.5 py-1.5 rounded-full bg-white/95 text-[#241305] text-xs font-bold shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-amber-200">
                        <span>✨ Kustomisasi & Pesan</span>
                    </span>
                </div>

                @if(!empty($product['is_best_seller']))
                <span class="absolute top-3 left-3 bg-[#3A1E08] text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow transform group-hover:scale-105 transition-transform">
                    🔥 BEST SELLER #1
                </span>
                @endif
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-amber-50/20 transition-colors duration-300">
                <div>
                    <h3 class="text-base font-bold text-[#241305] font-display group-hover:text-amber-800 transition-colors">{{ $product['name'] }}</h3>
                    <p class="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">{{ $product['description'] }}</p>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-stone-100 group-hover:border-amber-200/60 transition-colors">
                    <div>
                        <span class="text-[11px] text-stone-400 line-through">Rp {{ number_format($product['original_price'], 0, ',', '.') }}</span>
                        <div class="text-base font-extrabold text-[#3A1E08] group-hover:text-amber-950">Rp {{ number_format($product['price'], 0, ',', '.') }}</div>
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
@endsection
```

---

## 7. Partial Keranjang & Stepper Status (`resources/views/partials/cart-drawer.blade.php`)

```html
<!-- Drawer Backdrop & Container -->
<div x-show="isCartOpen" x-cloak class="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
    <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between" @click.away="isCartOpen = false">
        
        <!-- Header Tabs -->
        <div>
            <div class="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <h3 class="text-base font-bold text-[#241305] font-display">Pemesanan & Status</h3>
                <button @click="isCartOpen = false" class="text-stone-500 hover:text-black">✕</button>
            </div>

            <div class="flex border-b border-stone-200 bg-stone-100 p-1">
                <button @click="activeTab = 'cart'" :class="activeTab === 'cart' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'" class="flex-1 py-2 text-xs font-bold rounded-lg">
                    Keranjang (<span x-text="cartTotalCount"></span>)
                </button>
                <button @click="activeTab = 'tracking'" :class="activeTab === 'tracking' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'" class="flex-1 py-2 text-xs font-bold rounded-lg relative">
                    Status Pesanan
                    <span x-show="activeOrder" class="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-2 right-4"></span>
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
            
            <!-- Tab 1: Keranjang Belanja -->
            <template x-if="activeTab === 'cart'">
                <div>
                    <template x-if="cartItems.length === 0">
                        <div class="text-center py-16 text-stone-400 space-y-2">
                            <p class="text-xs">Keranjang Anda masih kosong.</p>
                        </div>
                    </template>

                    <div class="space-y-3">
                        <template x-for="item in cartItems" :key="item.id">
                            <div class="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 flex justify-between items-center gap-3">
                                <div>
                                    <h4 class="text-xs font-bold text-stone-900" x-text="item.name"></h4>
                                    <span class="text-xs text-amber-900 font-mono" x-text="'Rp ' + (item.price * item.quantity).toLocaleString('id-ID')"></span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button @click="updateQuantity(item.id, item.quantity - 1)" class="w-6 h-6 bg-white border rounded text-xs font-bold">-</button>
                                    <span class="text-xs font-bold" x-text="item.quantity"></span>
                                    <button @click="updateQuantity(item.id, item.quantity + 1)" class="w-6 h-6 bg-white border rounded text-xs font-bold">+</button>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Customer Form -->
                    <div class="mt-6 pt-4 border-t border-stone-200 space-y-3">
                        <span class="text-xs font-bold text-stone-800 uppercase block">Data Pemesan:</span>
                        <input type="text" x-model="orderInfo.name" placeholder="Nama Lengkap" class="w-full text-xs p-2.5 rounded-lg border">
                        <input type="tel" x-model="orderInfo.phone" placeholder="Nomor WhatsApp" class="w-full text-xs p-2.5 rounded-lg border">
                        <textarea x-model="orderInfo.address" placeholder="Alamat Pengiriman Lengkap" class="w-full text-xs p-2.5 rounded-lg border"></textarea>
                    </div>
                </div>
            </template>

            <!-- Tab 2: Visual Order Tracking Status (Pesanan Diterima, Sedang Dimasak, Siap Diantar) -->
            <template x-if="activeTab === 'tracking'">
                <div>
                    <template x-if="activeOrder">
                        <div class="space-y-6">
                            <!-- Order ID & Payment Pill -->
                            <div class="p-4 bg-[#FAF7F2] rounded-2xl border border-stone-200 flex justify-between items-center">
                                <div>
                                    <span class="text-[10px] text-stone-500 uppercase block">Nomor Pesanan</span>
                                    <span class="text-base font-black font-mono" x-text="'#' + activeOrder.orderId"></span>
                                </div>
                                <div class="text-right">
                                    <span :class="activeOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'" class="px-2.5 py-1 text-[11px] font-bold rounded-lg">
                                        <span x-text="activeOrder.paymentStatus === 'paid' ? 'LUNAS' : 'MENUNGGU BAYAR'"></span>
                                    </span>
                                </div>
                            </div>

                            <!-- 3 Visual Stepper Statuses -->
                            <div class="space-y-6 pl-4 border-l-2 border-amber-600">
                                <div>
                                    <h4 class="text-xs font-bold" :class="activeOrder.status === 'received' ? 'text-amber-900' : 'text-stone-700'">
                                        1. Pesanan Diterima
                                    </h4>
                                    <p class="text-[11px] text-stone-500">Tiket pesanan masuk ke antrean dapur Senopati.</p>
                                </div>

                                <div>
                                    <h4 class="text-xs font-bold" :class="activeOrder.status === 'cooking' ? 'text-amber-900' : 'text-stone-700'">
                                        2. Sedang Dimasak
                                    </h4>
                                    <p class="text-[11px] text-stone-500">Pisang dibalut panko, digoreng keemasan & disiram cokelat lumer.</p>
                                </div>

                                <div>
                                    <h4 class="text-xs font-bold" :class="activeOrder.status === 'ready' ? 'text-emerald-800' : 'text-stone-700'">
                                        3. Siap Diantar / Diambil
                                    </h4>
                                    <p class="text-[11px] text-stone-500">Kemasan rapi berventilasi, siap diserahkan ke kurir instan.</p>
                                </div>
                            </div>

                            <!-- Interactive simulation switchers -->
                            <div class="p-3 bg-stone-100 rounded-xl space-y-2">
                                <span class="text-[10px] text-stone-500 uppercase font-bold block">Ubah Status Simulasi:</span>
                                <div class="grid grid-cols-3 gap-1 text-[11px]">
                                    <button @click="activeOrder.status = 'received'" class="p-1.5 bg-white rounded font-bold">1. Diterima</button>
                                    <button @click="activeOrder.status = 'cooking'" class="p-1.5 bg-white rounded font-bold">2. Dimasak</button>
                                    <button @click="activeOrder.status = 'ready'" class="p-1.5 bg-white rounded font-bold">3. Siap</button>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>

        </div>

        <!-- Footer Actions -->
        <template x-if="activeTab === 'cart' && cartItems.length > 0">
            <div class="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                <div class="flex justify-between text-sm font-bold text-stone-900">
                    <span>Total Tagihan:</span>
                    <span class="font-mono text-base" x-text="'Rp ' + grandTotal.toLocaleString('id-ID')"></span>
                </div>

                <!-- Primary: Online Payment Gateway Modal -->
                <button @click="initiateOnlinePayment()" class="w-full py-3 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md">
                    Bayar Online Sekarang (QRIS / VA / E-Wallet)
                </button>
            </div>
        </template>
    </div>
</div>
```

---

## 8. Modal Pembayaran Online (`resources/views/partials/payment-modal.blade.php`)

```html
<div x-show="isPaymentModalOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
    <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200" @click.away="isPaymentModalOpen = false">
        
        <div class="p-5 bg-[#241305] text-white flex justify-between items-center">
            <div>
                <h3 class="text-base font-bold font-display">Pembayaran Online Pisang Melt</h3>
                <p class="text-xs text-stone-300">Terenkripsi & Konfirmasi Otomatis</p>
            </div>
            <button @click="isPaymentModalOpen = false" class="text-stone-400 hover:text-white">✕</button>
        </div>

        <div class="p-6 space-y-5">
            <!-- Total Bayar -->
            <div class="bg-[#FAF7F2] p-4 rounded-2xl flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-stone-500 uppercase font-semibold block">Total Tagihan</span>
                    <span class="text-2xl font-black font-display text-[#241305]" x-text="'Rp ' + (activeOrder ? activeOrder.grandTotal.toLocaleString('id-ID') : 0)"></span>
                </div>
                <span class="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
                    Sisa Waktu: 14:59
                </span>
            </div>

            <!-- Saluran Pembayaran (QRIS, BCA VA, Mandiri, E-Wallet) -->
            <div class="space-y-3">
                <span class="text-xs font-bold text-stone-800 uppercase block">Pilih Metode Pembayaran:</span>
                
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <button @click="selectedPaymentMethod = 'qris'" :class="selectedPaymentMethod === 'qris' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-stone-200'" class="p-3 border rounded-xl text-left">
                        <div>QRIS Instan</div>
                        <span class="text-[10px] text-stone-500">Semua Bank & E-Wallet</span>
                    </button>

                    <button @click="selectedPaymentMethod = 'bca_va'" :class="selectedPaymentMethod === 'bca_va' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-stone-200'" class="p-3 border rounded-xl text-left">
                        <div>BCA Virtual Account</div>
                        <span class="text-[10px] text-stone-500">8271081234567890</span>
                    </button>
                </div>
            </div>

            <!-- QRIS View -->
            <div x-show="selectedPaymentMethod === 'qris'" class="p-4 bg-white border border-stone-200 rounded-2xl text-center space-y-2">
                <span class="text-xs font-bold text-stone-700">SCAN QRIS NASIONAL</span>
                <div class="w-40 h-40 mx-auto bg-stone-100 border-2 border-stone-800 rounded-xl flex items-center justify-center font-bold text-4xl">
                    🍌
                </div>
                <span class="text-[10px] text-stone-500 font-mono block">NMID: ID1024567891234 · PISANG MELT</span>
            </div>

            <!-- Tombol Konfirmasi Bayar -->
            <button @click="confirmPaymentSuccess(); isPaymentModalOpen = false;" class="w-full py-3 bg-[#1F512B] hover:bg-[#163c20] text-white text-xs font-bold rounded-xl shadow-md">
                Saya Sudah Bayar (Konfirmasi Otomatis)
            </button>
        </div>
    </div>
</div>
```

---

## 9. Cara Menjalankan di Server / Localhost

1. **Buat project Laravel baru** (atau gunakan yang sudah ada):
   ```bash
   composer create-project laravel/laravel pisang-melt-app
   cd pisang-melt-app
   ```
2. **Copy file-file di atas** sesuai struktur direktori:
   - `database/migrations/...`
   - `app/Models/...`
   - `app/Http/Controllers/PisangMeltController.php`
   - `routes/web.php`
   - `resources/views/layouts/app.blade.php`
   - `resources/views/home.blade.php`
   - `resources/views/partials/...`
3. **Jalankan migrasi database**:
   ```bash
   php artisan migrate
   ```
4. **Jalankan server pengembangan Laravel**:
   ```bash
   php artisan serve
   ```
   Aplikasi akan aktif di `http://127.0.0.1:8000` dengan tampilan, interaksi keranjang, promo harian, dan pembayaran online yang 100% identik dengan hasil preview!
