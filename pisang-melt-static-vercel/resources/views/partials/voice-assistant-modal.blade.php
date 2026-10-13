<div x-show="isAiModalOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
    <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200" @click.away="isAiModalOpen = false">
        
        <!-- Header -->
        <div class="p-5 bg-[#241305] text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    🎤
                </div>
                <div>
                    <h3 class="text-base font-bold font-display">Tanya Suara AI (MeltVoice)</h3>
                    <p class="text-xs text-stone-300">Asisten Barista Kuliner Resmi Pisang Melt</p>
                </div>
            </div>
            <button @click="isAiModalOpen = false" class="text-stone-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <!-- Body & Chat Transcript -->
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-stone-50">
            
            <!-- Gelombang Suara Animasi -->
            <div class="p-6 bg-white rounded-2xl border border-stone-200 text-center space-y-3 shadow-xs">
                <div class="flex items-center justify-center gap-1.5 h-10">
                    <span :class="isAiSpeaking ? 'animate-bounce h-8' : 'h-3'" class="w-1.5 bg-amber-500 rounded-full transition-all duration-150"></span>
                    <span :class="isAiSpeaking ? 'animate-bounce h-10 delay-75' : 'h-4'" class="w-1.5 bg-amber-600 rounded-full transition-all duration-150"></span>
                    <span :class="isAiSpeaking ? 'animate-bounce h-6 delay-150' : 'h-3'" class="w-1.5 bg-[#3A1E08] rounded-full transition-all duration-150"></span>
                    <span :class="isAiSpeaking ? 'animate-bounce h-9 delay-100' : 'h-4'" class="w-1.5 bg-amber-600 rounded-full transition-all duration-150"></span>
                    <span :class="isAiSpeaking ? 'animate-bounce h-7 delay-200' : 'h-3'" class="w-1.5 bg-amber-500 rounded-full transition-all duration-150"></span>
                </div>
                <p class="text-xs font-semibold text-stone-700" x-text="aiStatusText"></p>
            </div>

            <!-- Riwayat Percakapan -->
            <div class="space-y-2 text-xs">
                <template x-for="(chat, idx) in chatHistory" :key="idx">
                    <div :class="chat.role === 'user' ? 'text-right' : 'text-left'">
                        <div :class="chat.role === 'user' ? 'bg-[#3A1E08] text-white' : 'bg-white text-stone-800 border border-stone-200'" class="inline-block p-3 rounded-2xl max-w-[85%] text-left shadow-xs">
                            <span class="block text-[10px] font-bold opacity-75 mb-0.5" x-text="chat.role === 'user' ? 'Anda' : 'MeltVoice AI'"></span>
                            <span x-text="chat.text"></span>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Rekomendasi Pertanyaan Cepat -->
            <div class="pt-2">
                <span class="text-[11px] font-bold text-stone-500 uppercase block mb-1.5">Contoh Pertanyaan Cepat:</span>
                <div class="flex flex-wrap gap-1.5">
                    <button @click="sendAiQuery('Menu mana yang paling lumer dan best seller?')" class="px-2.5 py-1 text-[11px] bg-white hover:bg-amber-100 border rounded-lg text-stone-700 transition-colors cursor-pointer">
                        🍌 Varian paling lumer?
                    </button>
                    <button @click="sendAiQuery('Ada promo diskon dan gratis ongkir hari ini?')" class="px-2.5 py-1 text-[11px] bg-white hover:bg-amber-100 border rounded-lg text-stone-700 transition-colors cursor-pointer">
                        🎟️ Promo & voucher aktif?
                    </button>
                    <button @click="sendAiQuery('Berapa poin untuk dapat 1 box gratis?')" class="px-2.5 py-1 text-[11px] bg-white hover:bg-amber-100 border rounded-lg text-stone-700 transition-colors cursor-pointer">
                        🎁 Cara dapat box gratis?
                    </button>
                </div>
            </div>
        </div>

        <!-- Input Bar & Tombol Mikrofon -->
        <div class="p-4 bg-white border-t border-stone-200 flex gap-2 items-center">
            <button @click="toggleSpeechRecognition()" :class="isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-900'" class="p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <span x-text="isListening ? '⏹ Stop' : '🎙 Bicara'"></span>
            </button>

            <input type="text" x-model="userQueryInput" @keydown.enter="sendAiQuery(userQueryInput)" placeholder="Ketik atau tekan tombol bicara..." class="flex-1 text-xs p-2.5 border rounded-xl focus:ring-1 focus:ring-amber-500">

            <button @click="sendAiQuery(userQueryInput)" class="px-4 py-2.5 bg-[#3A1E08] hover:bg-black text-white text-xs font-bold rounded-xl shadow cursor-pointer">
                Kirim
            </button>
        </div>
    </div>
</div>
