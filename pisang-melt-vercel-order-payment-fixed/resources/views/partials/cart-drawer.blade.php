<div x-show="isCartOpen" x-cloak class="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
    <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between" @click.away="isCartOpen = false">
        
        <div>
            <div class="p-4 border-b flex justify-between bg-stone-50">
                <h3 class="font-bold text-stone-900 font-display">Pemesanan & Status Dapur</h3>
                <button @click="isCartOpen = false" class="text-stone-500 hover:text-black cursor-pointer">✕</button>
            </div>

            <!-- Tab Switcher -->
            <div class="flex border-b bg-stone-100 p-1 text-xs font-bold">
                <button @click="activeTab = 'cart'" :class="activeTab === 'cart' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'" class="flex-1 py-2 rounded-lg cursor-pointer">
                    Keranjang (<span x-text="cartTotalCount"></span>)
                </button>
                <button @click="activeTab = 'tracking'" :class="activeTab === 'tracking' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'" class="flex-1 py-2 rounded-lg relative cursor-pointer">
                    Status Dapur
                    <span x-show="activeOrder" class="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-2 right-4"></span>
                </button>
            </div>
        </div>

        <div class="p-4 flex-1 overflow-y-auto space-y-4">
            
            <!-- Tab Keranjang -->
            <div x-show="activeTab === 'cart'">
                <template x-if="cartItems.length === 0">
                    <p class="text-center py-16 text-xs text-stone-400">Keranjang belanja Anda masih kosong.</p>
                </template>

                <div class="space-y-2">
                    <template x-for="item in cartItems" :key="item.id">
                        <div class="p-3 bg-[#FAF7F2] rounded-xl border flex justify-between items-center">
                            <div>
                                <h4 class="text-xs font-bold text-stone-900" x-text="item.name"></h4>
                                <span class="text-xs text-amber-900 font-mono" x-text="'Rp ' + (item.price * item.quantity).toLocaleString('id-ID')"></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button @click="updateQty(item.id, item.quantity - 1)" class="w-6 h-6 border rounded bg-white text-xs font-bold cursor-pointer">-</button>
                                <span class="text-xs font-bold" x-text="item.quantity"></span>
                                <button @click="updateQty(item.id, item.quantity + 1)" class="w-6 h-6 border rounded bg-white text-xs font-bold cursor-pointer">+</button>
                            </div>
                        </div>
                    </template>
                </div>

                <div x-show="cartItems.length > 0" class="pt-4 border-t space-y-2 mt-4">
                    <span class="text-xs font-bold uppercase block text-stone-700">Data Pengiriman:</span>
                    <input type="text" x-model="orderInfo.name" placeholder="Nama Lengkap" class="w-full text-xs p-2.5 border rounded-lg focus:ring-1 focus:ring-amber-500">
                    <input type="tel" x-model="orderInfo.phone" placeholder="Nomor WhatsApp" class="w-full text-xs p-2.5 border rounded-lg focus:ring-1 focus:ring-amber-500">
                    <textarea x-model="orderInfo.address" placeholder="Alamat Pengiriman Lengkap" class="w-full text-xs p-2.5 border rounded-lg focus:ring-1 focus:ring-amber-500"></textarea>
                </div>
            </div>

            <!-- Tab Pelacakan Status Dapur (3 Tahap Visual) -->
            <div x-show="activeTab === 'tracking'" class="space-y-4">
                <template x-if="activeOrder">
                    <div>
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

                        <!-- Simulasi Perubahan Status -->
                        <div class="mt-8 p-3 bg-stone-100 rounded-xl space-y-2">
                            <span class="text-[10px] text-stone-500 font-bold uppercase block">Ubah Status Dapur (Simulasi):</span>
                            <div class="grid grid-cols-3 gap-1 text-[11px]">
                                <button @click="activeOrder.status = 'received'" class="p-1.5 bg-white rounded font-bold cursor-pointer hover:bg-stone-50">1. Diterima</button>
                                <button @click="activeOrder.status = 'cooking'" class="p-1.5 bg-white rounded font-bold cursor-pointer hover:bg-stone-50">2. Dimasak</button>
                                <button @click="activeOrder.status = 'ready'" class="p-1.5 bg-white rounded font-bold cursor-pointer hover:bg-stone-50">3. Siap</button>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div x-show="activeTab === 'cart' && cartItems.length > 0" class="p-4 border-t bg-stone-50 space-y-2">
            <div class="flex justify-between text-sm font-bold text-stone-900">
                <span>Total Tagihan:</span>
                <span class="font-mono text-base" x-text="'Rp ' + grandTotal.toLocaleString('id-ID')"></span>
            </div>
            <button @click="openPaymentModal()" class="w-full py-3 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors">
                Bayar Online Sekarang (QRIS / VA / E-Wallet)
            </button>
        </div>
    </div>
</div>
