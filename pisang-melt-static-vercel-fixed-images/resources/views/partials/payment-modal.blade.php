<div x-show="isPaymentOpen" x-cloak class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-stone-200" @click.away="isPaymentOpen = false">
        
        <div class="flex justify-between items-center border-b pb-3">
            <div>
                <h3 class="font-bold text-base text-stone-900 font-display">Pembayaran Online Pisang Melt</h3>
                <p class="text-xs text-stone-500">Terenkripsi & Konfirmasi Gateway Instan</p>
            </div>
            <button @click="isPaymentOpen = false" class="text-stone-400 hover:text-black cursor-pointer">✕</button>
        </div>

        <div class="p-3.5 bg-[#FAF7F2] rounded-xl flex justify-between items-center">
            <span class="text-xs text-stone-600">Total Tagihan:</span>
            <span class="font-bold text-xl font-mono text-[#241305]" x-text="'Rp ' + (activeOrder ? activeOrder.grandTotal.toLocaleString('id-ID') : 0)"></span>
        </div>

        <!-- Pilihan Saluran Bayar -->
        <div class="space-y-2">
            <span class="text-xs font-bold text-stone-700 uppercase block">Metode Pembayaran:</span>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <button @click="selectedPaymentMethod = 'qris'" :class="selectedPaymentMethod === 'qris' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-stone-200'" class="p-2.5 border rounded-xl text-left cursor-pointer transition-colors">
                    <div>QRIS Instan</div>
                    <span class="text-[10px] text-stone-500">BCA, GoPay, OVO, DANA</span>
                </button>
                <button @click="selectedPaymentMethod = 'bca_va'" :class="selectedPaymentMethod === 'bca_va' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-stone-200'" class="p-2.5 border rounded-xl text-left cursor-pointer transition-colors">
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

        <!-- Tombol Konfirmasi Bayar -->
        <button @click="confirmPaymentSuccess()" class="w-full py-3 bg-[#1F512B] hover:bg-[#163c20] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
            Saya Sudah Bayar (Konfirmasi Otomatis)
        </button>
    </div>
</div>
