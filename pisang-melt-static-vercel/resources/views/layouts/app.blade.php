<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pisang Melt - Pisang Crispy & Nugget Lumer No. 1 Jakarta</title>
    <meta name="description" content="Pisang goreng krispi berbalut tepung panko renyah dengan siraman cokelat lumer premium dan keju melimpah. Pesan instan dengan pengiriman cepat!">
    <meta name="theme-color" content="#241305">

    <!-- Open Graph / Meta Sosial -->
    <meta property="og:title" content="Pisang Melt - Kriuknya Emas, Lumernya Pecah di Lidah">
    <meta property="og:description" content="Sensasi pisang crispy artisan dengan topping dark chocolate Belgia dan salju keju cheddar melimpah.">
    <meta property="og:type" content="website">

    <!-- Google Fonts: Playfair Display & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind CSS v3 via CDN -->
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

    <!-- Alpine.js untuk State Keranjang, Pelacakan Pesanan & Modal -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #FAF7F2; }
        ::-webkit-scrollbar-thumb { background: #D1C7BD; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #8C7A6B; }
    </style>
</head>
<body class="bg-[#FAF7F2] text-[#2C241E] font-sans antialiased selection:bg-amber-200 selection:text-stone-900" x-data="pisangMeltApp()" x-init="initApp()">

    <!-- Top Announcement Promo Banner -->
    <div class="bg-[#241305] text-[#F3EFEA] text-xs font-medium py-2.5 px-4 text-center border-b border-[#3A1E08] relative z-50">
        <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>🎉 Promo Peluncuran: Gunakan Voucher <strong>LUMER20</strong> untuk Diskon 20%!</span>
            <button @click="applyPromo('LUMER20')" class="underline hover:text-amber-400 font-bold ml-1 transition-colors cursor-pointer">
                Klaim Sekarang
            </button>
        </div>
    </div>

    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#2C241E]/10 transition-shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            
            <!-- Brand Logo -->
            <a href="#" class="flex items-center gap-2.5 group cursor-pointer">
                <span class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3A1E08] font-display">
                    Pisang Melt
                </span>
                <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            </a>

            <!-- Desktop Navigation Menu -->
            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-[#5C4A3E]">
                <a href="#menu-hari-ini" class="text-amber-950 font-bold hover:text-black transition-colors flex items-center gap-1.5">
                    <span>Menu Hari Ini</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                </a>
                <a href="#menu-varian" class="hover:text-[#3A1E08] transition-colors">Menu Varian</a>
                <a href="#paket-promo" class="hover:text-[#3A1E08] transition-colors">Paket Hemat</a>
                <a href="#poin-hadiah" class="hover:text-[#3A1E08] transition-colors flex items-center gap-1.5">
                    <span>Poin Hadiah</span>
                    <span class="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded font-mono" x-text="loyaltyPoints + ' Pts'"></span>
                </a>
                <a href="#kualitas" class="hover:text-[#3A1E08] transition-colors">Kualitas</a>
                <a href="#ulasan" class="hover:text-[#3A1E08] transition-colors">Ulasan</a>
            </nav>

            <!-- Actions (WhatsApp Direct & Cart Button) -->
            <div class="flex items-center gap-2.5">
                <a href="https://wa.me/6281330608974?text=Halo%20Pisang%20Melt%2C%20saya%20ingin%20pesan" target="_blank" rel="noopener noreferrer" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1F512B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors">
                    <span>Chat WA</span>
                </a>

                <button @click="isCartOpen = true" class="relative inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3A1E08] hover:bg-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">
                    <span>Pesanan</span>
                    <span x-show="cartTotalCount > 0" class="inline-flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold text-[#3A1E08] bg-amber-400 rounded-full tabular-nums" x-text="cartTotalCount"></span>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content Slot -->
    <main>
        @yield('content')
    </main>

    <!-- Toast Notification Popup -->
    <div x-show="toastMessage" x-cloak x-transition.opacity.duration.300ms class="fixed top-20 right-4 sm:right-8 z-50 bg-[#241305] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-2xl border border-amber-600/40 flex items-center gap-2">
        <span class="text-amber-400">✨</span>
        <span x-text="toastMessage"></span>
    </div>

    <!-- Complete Website Footer -->
    <footer class="bg-[#241305] text-[#F3EFEA] pt-16 pb-12 border-t border-stone-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
                
                <!-- Brand Column -->
                <div class="space-y-4 md:col-span-1">
                    <span class="text-2xl font-bold font-display text-white">Pisang Melt</span>
                    <p class="text-xs text-stone-400 leading-relaxed">
                        Pisang goreng crispy artisan dengan balutan tepung panko Jepang keemasan, lelehan dark chocolate murni, dan tumpukan keju cheddar gurih.
                    </p>
                    <div class="text-xs text-amber-400 font-semibold">
                        Perumahan Jati Permai Block C3 No 21, kec. Cikarang selatan, Bekasi, Jawa Barat 17530
                    </div>
                </div>

                <!-- Jam Operasional -->
                <div class="space-y-3">
                    <h4 class="text-sm font-bold text-white font-display uppercase tracking-wider">Jam Buka Dapur</h4>
                    <ul class="text-xs text-stone-400 space-y-1.5">
                        <li class="flex justify-between">
                            <span>Senin - Jumat:</span>
                            <strong class="text-stone-200">10:00 - 22:00 WIB</strong>
                        </li>
                        <li class="flex justify-between">
                            <span>Sabtu - Minggu:</span>
                            <strong class="text-stone-200">09:00 - 23:00 WIB</strong>
                        </li>
                        <li class="text-[11px] text-amber-400/90 pt-1">
                            🛵 Pengiriman via GoSend & GrabExpress Instan
                        </li>
                    </ul>
                </div>

                <!-- Menu Cepat -->
                <div class="space-y-3">
                    <h4 class="text-sm font-bold text-white font-display uppercase tracking-wider">Navigasi Cepat</h4>
                    <ul class="text-xs text-stone-400 space-y-2">
                        <li><a href="#menu-hari-ini" class="hover:text-amber-400 transition-colors">Menu Spesial Hari Ini</a></li>
                        <li><a href="#menu-varian" class="hover:text-amber-400 transition-colors">5 Varian Pisang Crispy</a></li>
                        <li><a href="#paket-promo" class="hover:text-amber-400 transition-colors">Paket Hemat Nobar & Pesta</a></li>
                        <li><a href="#poin-hadiah" class="hover:text-amber-400 transition-colors">Tukar 100 Poin Gratis 1 Box</a></li>
                    </ul>
                </div>

                <!-- Kontak & Pemesanan -->
                <div class="space-y-3">
                    <h4 class="text-sm font-bold text-white font-display uppercase tracking-wider">Layanan Pelanggan</h4>
                    <p class="text-xs text-stone-400">Pemesanan catering acara kantor, pesta ulang tahun, dan konsultasi kemitraan reseller.</p>
                    <a href="https://wa.me/6281330608974" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">
                        <span>WhatsApp: 0813-3060-8974</span>
                    </a>
                </div>

            </div>

            <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
                <p>© {{ date('Y') }} Pisang Melt Artisan Indonesia. Seluruh hak cipta dilindungi.</p>
                <div class="flex gap-6">
                    <span class="hover:text-stone-400">100% Halal Certified</span>
                    <span class="hover:text-stone-400">Higienis & Fresh Fried</span>
                    <span class="hover:text-stone-400">Kemasan Berventilasi Uap</span>
                </div>
            </div>
        </div>
    </footer>

    <!-- Partials: Drawer Keranjang & Pelacakan Status -->
    @include('partials.cart-drawer')

    <!-- Partials: Modal Gerbang Pembayaran Online (QRIS & VA) -->
    @include('partials.payment-modal')

    <!-- Partials: Modal Asisten Suara AI (Gemini) -->
    @include('partials.voice-assistant-modal')

    <!-- Floating Tracking Status Bar (Muncul Otomatis Saat Ada Pesanan Aktif) -->
    <div x-show="activeOrder" x-cloak class="fixed bottom-6 left-6 z-40">
        <button @click="isCartOpen = true; activeTab = 'tracking'" class="bg-[#241305] text-white py-2.5 px-4 rounded-2xl shadow-2xl border border-amber-800 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
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

    <!-- Floating Button Asisten Suara AI Gemini -->
    <button @click="isAiModalOpen = true" class="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer">
        <div class="w-7 h-7 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center text-sm">
            🎙️
        </div>
        <div class="text-left text-xs leading-tight">
            <div class="font-extrabold flex items-center gap-1">
                <span>Tanya Suara AI</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <span class="text-[10px] text-stone-900 opacity-90">gemini-2.5-flash</span>
        </div>
    </button>

    <!-- Alpine.js Store & State Logic -->
    <script>
        function pisangMeltApp() {
            return {
                isCartOpen: false,
                isPaymentOpen: false,
                isAiModalOpen: false,
                activeTab: 'cart',
                cartItems: [],
                loyaltyPoints: 60,
                activeOrder: null,
                selectedPaymentMethod: 'qris',
                toastMessage: null,
                orderInfo: {
                    name: 'Rian Pratama',
                    phone: '081234567890',
                    address: 'Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan',
                    deliveryOption: 'gosend',
                    paymentMethod: 'qris',
                },

                // State AI
                isListening: false,
                isAiSpeaking: false,
                aiStatusText: 'Tekan tombol bicara atau pilih pertanyaan di bawah',
                userQueryInput: '',
                chatHistory: [
                    { role: 'model', text: 'Halo! Saya MeltVoice. Mau rekomendasi pisang crispy yang manis leleh atau gurih keju hari ini?' }
                ],

                initApp() {
                    const saved = localStorage.getItem('pisang_melt_order');
                    if (saved) {
                        try { this.activeOrder = JSON.parse(saved); } catch(e){}
                    }
                },

                showToast(msg) {
                    this.toastMessage = msg;
                    setTimeout(() => { this.toastMessage = null; }, 3500);
                },

                get cartTotalCount() {
                    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
                },

                get subtotal() {
                    return this.cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
                },

                get discountAmount() {
                    return Math.round(this.subtotal * 0.2); // Voucher 20%
                },

                get deliveryFee() {
                    return (this.orderInfo.deliveryOption === 'pickup' || this.subtotal >= 60000 || this.subtotal === 0) ? 0 : 10000;
                },

                get grandTotal() {
                    return Math.max(0, this.subtotal - this.discountAmount + this.deliveryFee);
                },

                addToCart(product, customPrice = null) {
                    const price = customPrice || product.price;
                    const existing = this.cartItems.find(i => i.id === product.id);
                    if (existing) {
                        existing.quantity++;
                    } else {
                        this.cartItems.push({
                            id: product.id,
                            name: product.name,
                            price: price,
                            quantity: 1,
                            image: product.image
                        });
                    }
                    this.showToast(product.name + ' ditambahkan ke keranjang!');
                    this.isCartOpen = true;
                    this.activeTab = 'cart';
                },

                updateQty(id, qty) {
                    if (qty <= 0) {
                        this.cartItems = this.cartItems.filter(i => i.id !== id);
                    } else {
                        const item = this.cartItems.find(i => i.id === id);
                        if (item) item.quantity = qty;
                    }
                },

                applyPromo(code) {
                    this.showToast('Voucher ' + code + ' aktif! Diskon 20% otomatis diaplikasikan.');
                },

                openPaymentModal() {
                    if (!this.orderInfo.name || !this.orderInfo.phone) {
                        alert('Mohon lengkapi nama dan nomor WhatsApp Anda terlebih dahulu.');
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
                    this.showToast('✅ Pembayaran LUNAS! Dapur langsung menggoreng pesanan Anda.');
                },

                getOrderStatusLabel() {
                    if (!this.activeOrder) return '';
                    if (this.activeOrder.status === 'received') return 'Pesanan Diterima';
                    if (this.activeOrder.status === 'cooking') return 'Sedang Dimasak';
                    if (this.activeOrder.status === 'ready') return 'Siap Diantar';
                    return '';
                },

                // Logika Asisten AI Gemini
                sendAiQuery(query) {
                    if (!query || !query.trim()) return;
                    const userText = query.trim();
                    this.chatHistory.push({ role: 'user', text: userText });
                    this.userQueryInput = '';
                    this.aiStatusText = 'MeltVoice sedang berpikir...';

                    fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        },
                        body: JSON.stringify({
                            prompt: userText,
                            history: this.chatHistory.slice(-6)
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.reply) {
                            this.chatHistory.push({ role: 'model', text: data.reply });
                            this.speakText(data.reply);
                        }
                    })
                    .catch(() => {
                        this.aiStatusText = 'Maaf, terjadi kendala koneksi AI.';
                    });
                },

                speakText(text) {
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'id-ID';
                        utterance.rate = 1.05;
                        this.isAiSpeaking = true;
                        this.aiStatusText = 'MeltVoice sedang berbicara... 🔊';

                        utterance.onend = () => {
                            this.isAiSpeaking = false;
                            this.aiStatusText = 'Silakan tanyakan menu lainnya!';
                        };
                        window.speechSynthesis.speak(utterance);
                    }
                },

                toggleSpeechRecognition() {
                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                    if (!SpeechRecognition) {
                        alert('Browser Anda belum mendukung input suara mikrofon.');
                        return;
                    }

                    if (this.isListening) {
                        this.isListening = false;
                        return;
                    }

                    const recognition = new SpeechRecognition();
                    recognition.lang = 'id-ID';
                    recognition.interimResults = false;

                    this.isListening = true;
                    this.aiStatusText = 'Mendengarkan suara Anda... 🎙';

                    recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        this.isListening = false;
                        this.sendAiQuery(transcript);
                    };

                    recognition.onerror = () => {
                        this.isListening = false;
                        this.aiStatusText = 'Gagal mendengar, silakan coba lagi.';
                    };

                    recognition.start();
                }
            }
        }
    </script>
</body>
</html>
