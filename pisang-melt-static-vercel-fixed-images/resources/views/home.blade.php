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

                    <button @click="addToCart({{ json_encode($dailySpecial) }}, {{ $dailySpecial->special_price ?? $dailySpecial['special_price'] }})" class="px-6 py-3 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer">
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

                    <button @click="addToCart({{ json_encode($product) }})" class="px-4 py-2 bg-[#3A1E08] hover:bg-black group-hover:bg-[#241305] text-white text-xs font-bold rounded-xl shadow-sm transform group-hover:scale-105 transition-all cursor-pointer">
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
            <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                    <span class="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Hemat 22%</span>
                    <h3 class="text-lg font-bold text-[#241305] mt-2 font-display">Paket Duo Lumer</h3>
                    <p class="text-xs text-stone-600 mt-1">1x Pisang Crispy Cokelat + 1x Pisang Crispy Keju</p>
                </div>
                <div class="flex justify-between items-center pt-3 border-t">
                    <span class="text-lg font-black text-[#241305]">Rp 31.000</span>
                    <button @click="addToCart({ id: 'bundle-duo', name: 'Paket Duo Lumer', price: 31000 })" class="px-3.5 py-1.5 bg-[#3A1E08] text-white text-xs font-bold rounded-lg cursor-pointer">+ Ambil</button>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                    <span class="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Paling Populer</span>
                    <h3 class="text-lg font-bold text-[#241305] mt-2 font-display">Paket Nobar Best Seller</h3>
                    <p class="text-xs text-stone-600 mt-1">2x Pisang Crispy Cokelat Keju + 1x Pisang Nugget</p>
                </div>
                <div class="flex justify-between items-center pt-3 border-t">
                    <span class="text-lg font-black text-[#241305]">Rp 52.000</span>
                    <button @click="addToCart({ id: 'bundle-trio', name: 'Paket Nobar Best Seller', price: 52000 })" class="px-3.5 py-1.5 bg-[#3A1E08] text-white text-xs font-bold rounded-lg cursor-pointer">+ Ambil</button>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                    <span class="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Free Ongkir</span>
                    <h3 class="text-lg font-bold text-[#241305] mt-2 font-display">Paket Sultan Party Box</h3>
                    <p class="text-xs text-stone-600 mt-1">Semua 5 Varian Lengkap + 2x Extra Dip Saus</p>
                </div>
                <div class="flex justify-between items-center pt-3 border-t">
                    <span class="text-lg font-black text-[#241305]">Rp 88.000</span>
                    <button @click="addToCart({ id: 'bundle-pesta', name: 'Paket Sultan Party Box', price: 88000 })" class="px-3.5 py-1.5 bg-[#3A1E08] text-white text-xs font-bold rounded-lg cursor-pointer">+ Ambil</button>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
