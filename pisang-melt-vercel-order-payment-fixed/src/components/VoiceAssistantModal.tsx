import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  X,
  Mic,
  Volume2,
  Sparkles,
  Send,
  RefreshCw,
  AlertCircle,
  Headphones,
} from 'lucide-react';

import {
  float32ToPcmBase64,
  LiveAudioPlayer,
} from '../utils/audioLive';

import {
  PRODUCTS,
  PROMO_BUNDLES,
} from '../data/products';

// ============================================================
// TYPES
// ============================================================

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Customer dapat meminta AI menambahkan produk
  onQuickAddProduct?: (
    productName: string,
    quantity?: number
  ) => void;

  // Customer dapat meminta AI mengurangi produk
  onQuickRemoveProduct?: (
    productName: string,
    quantity?: number
  ) => void;

  // Customer dapat meminta AI menambahkan paket
  onQuickAddBundle?: (
    bundleName: string,
    quantity?: number
  ) => void;

  // Customer dapat meminta AI mengurangi/menghapus paket
  onQuickRemoveBundle?: (
    bundleName: string,
    quantity?: number,
    removeAll?: boolean
  ) => void;
}

interface MessageLog {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// ============================================================
// HELPERS
// ============================================================

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const findProduct = (
  productName: string
) => {
  const normalized = normalizeText(
    productName
  );

  return PRODUCTS.find(
    (product) =>
      normalizeText(product.name) ===
        normalized ||
      normalizeText(product.id) ===
        normalized
  );
};

const findBundle = (
  bundleName: string
) => {
  const normalized = normalizeText(
    bundleName
  );

  return PROMO_BUNDLES.find(
    (bundle) =>
      normalizeText(bundle.name) ===
        normalized ||
      normalizeText(bundle.id) ===
        normalized
  );
};

// ============================================================
// COMPONENT
// ============================================================

export const VoiceAssistantModal: React.FC<
  VoiceAssistantModalProps
> = ({
  isOpen,
  onClose,
  onQuickAddProduct,
  onQuickRemoveProduct,
  onQuickAddBundle,
  onQuickRemoveBundle,
}) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [isConnected, setIsConnected] =
    useState(false);

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [isMicActive, setIsMicActive] =
    useState(false);

  const [isAiSpeaking, setIsAiSpeaking] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState(
      'Tekan tombol mikrofon untuk mulai berbicara'
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<MessageLog[]>([
      {
        id: 'welcome',
        sender: 'ai',
        text:
          'Halo! Saya MeltVoice, asisten cerdas Pisang Melt. Ada yang bisa saya bantu tentang varian menu, rekomendasi rasa, atau promo hari ini?',
        timestamp: 'Baru saja',
      },
    ]);

  const [textInput, setTextInput] =
    useState('');

  const [audioLevel, setAudioLevel] =
    useState(0);

  // ==========================================================
  // REFERENCES
  // ==========================================================

  const wsRef =
    useRef<WebSocket | null>(null);

  const audioPlayerRef =
    useRef<LiveAudioPlayer | null>(null);

  const micStreamRef =
    useRef<MediaStream | null>(null);

  const inputAudioCtxRef =
    useRef<AudioContext | null>(null);

  const processorRef =
    useRef<ScriptProcessorNode | null>(null);

  const sourceRef =
    useRef<MediaStreamAudioSourceNode | null>(
      null
    );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================================
  // TIME FORMAT
  // ==========================================================

  const getCurrentTime = useCallback(
    () =>
      new Date().toLocaleTimeString(
        'id-ID',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
    []
  );

  // ==========================================================
  // ADD AI MESSAGE
  // ==========================================================

  const addAiMessage = useCallback(
    (
      text: string
    ) => {
      const cleanText =
        text.trim();

      if (!cleanText) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id:
            `ai-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 7)}`,
          sender: 'ai',
          text: cleanText,
          timestamp:
            getCurrentTime(),
        },
      ]);
    },
    [getCurrentTime]
  );

  // ==========================================================
  // STOP MICROPHONE
  // ==========================================================

  const stopMicCapture =
    useCallback(() => {
      // ------------------------------------------------------
      // Stop processor
      // ------------------------------------------------------

      if (
        processorRef.current
      ) {
        processorRef.current.onaudioprocess =
          null;

        try {
          processorRef.current.disconnect();
        } catch {
          // Ignore
        }

        processorRef.current =
          null;
      }

      // ------------------------------------------------------
      // Disconnect source
      // ------------------------------------------------------

      if (
        sourceRef.current
      ) {
        try {
          sourceRef.current.disconnect();
        } catch {
          // Ignore
        }

        sourceRef.current =
          null;
      }

      // ------------------------------------------------------
      // Close AudioContext
      // ------------------------------------------------------

      if (
        inputAudioCtxRef.current
      ) {
        const audioContext =
          inputAudioCtxRef.current;

        inputAudioCtxRef.current =
          null;

        if (
          audioContext.state !==
          'closed'
        ) {
          void audioContext
            .close()
            .catch(() => {
              // Ignore
            });
        }
      }

      // ------------------------------------------------------
      // Stop microphone tracks
      // ------------------------------------------------------

      if (
        micStreamRef.current
      ) {
        micStreamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch {
              // Ignore
            }
          });

        micStreamRef.current =
          null;
      }

      setIsMicActive(false);
      setAudioLevel(0);
    }, []);

  // ==========================================================
  // DISCONNECT SESSION
  // ==========================================================

  const disconnectSession =
    useCallback(() => {
      stopMicCapture();

      // ------------------------------------------------------
      // Stop AI audio
      // ------------------------------------------------------

      if (
        audioPlayerRef.current
      ) {
        audioPlayerRef.current.stopAll();
      }

      // ------------------------------------------------------
      // Close WebSocket
      // ------------------------------------------------------

      const ws =
        wsRef.current;

      wsRef.current =
        null;

      if (ws) {
        try {
          ws.close();
        } catch {
          // Ignore
        }
      }

      setIsConnected(false);
      setIsConnecting(false);
      setIsMicActive(false);
      setIsAiSpeaking(false);
      setAudioLevel(0);

      setStatusMessage(
        'Tekan tombol mikrofon untuk mulai berbicara'
      );
    }, [
      stopMicCapture,
    ]);

  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [
    messages,
    isAiSpeaking,
  ]);

  // ==========================================================
  // CLOSE SESSION WHEN MODAL CLOSES
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      disconnectSession();
    }
  }, [
    isOpen,
    disconnectSession,
  ]);

  // ==========================================================
  // COMPONENT UNMOUNT CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      stopMicCapture();

      if (
        audioPlayerRef.current
      ) {
        audioPlayerRef.current.close();
        audioPlayerRef.current =
          null;
      }

      if (
        wsRef.current
      ) {
        try {
          wsRef.current.close();
        } catch {
          // Ignore
        }

        wsRef.current =
          null;
      }
    };
  }, [
    stopMicCapture,
  ]);

  // ==========================================================
  // START MICROPHONE
  // ==========================================================

  const startMicCapture =
    async () => {
      try {
        // ----------------------------------------------------
        // Browser microphone support
        // ----------------------------------------------------

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            'Browser tidak mendukung akses mikrofon atau halaman tidak menggunakan HTTPS.'
          );
        }

        // ----------------------------------------------------
        // Request microphone
        // ----------------------------------------------------

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            }
          );

        micStreamRef.current =
          stream;

        // ----------------------------------------------------
        // AudioContext
        // ----------------------------------------------------

        const AudioCtxClass =
          window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext:
                typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioCtxClass) {
          throw new Error(
            'Browser tidak mendukung Web Audio API.'
          );
        }

        const inputAudioCtx =
          new AudioCtxClass({
            sampleRate: 16000,
          });

        inputAudioCtxRef.current =
          inputAudioCtx;

        if (
          inputAudioCtx.state ===
          'suspended'
        ) {
          await inputAudioCtx.resume();
        }

        // ----------------------------------------------------
        // Media stream source
        // ----------------------------------------------------

        const source =
          inputAudioCtx.createMediaStreamSource(
            stream
          );

        sourceRef.current =
          source;

        // ----------------------------------------------------
        // ScriptProcessor
        // ----------------------------------------------------

        const processor =
          inputAudioCtx.createScriptProcessor(
            4096,
            1,
            1
          );

        processorRef.current =
          processor;

        source.connect(
          processor
        );

        processor.connect(
          inputAudioCtx.destination
        );

        // ----------------------------------------------------
        // Process microphone audio
        // ----------------------------------------------------

        processor.onaudioprocess =
          (event) => {
            const inputData =
              event.inputBuffer.getChannelData(
                0
              );

            if (
              !inputData ||
              inputData.length === 0
            ) {
              return;
            }

            // ------------------------------------------------
            // Audio level
            // ------------------------------------------------

            let sum = 0;

            for (
              let i = 0;
              i <
              inputData.length;
              i++
            ) {
              sum += Math.abs(
                inputData[i]
              );
            }

            const average =
              sum /
              inputData.length;

            setAudioLevel(
              Math.min(
                1,
                average * 8
              )
            );

            // ------------------------------------------------
            // Send PCM to WebSocket
            // ------------------------------------------------

            const ws =
              wsRef.current;

            if (
              ws &&
              ws.readyState ===
                WebSocket.OPEN
            ) {
              try {
                const base64Pcm =
                  float32ToPcmBase64(
                    inputData
                  );

                ws.send(
                  JSON.stringify({
                    audio:
                      base64Pcm,
                  })
                );
              } catch (error) {
                console.error(
                  'Gagal mengirim audio microphone:',
                  error
                );
              }
            }
          };

        setIsMicActive(true);
        setErrorMessage(null);

        setStatusMessage(
          'Mendengarkan... Silakan tanyakan menu Pisang Melt!'
        );
      } catch (micErr: unknown) {
        console.error(
          'MIC ERROR:',
          micErr
        );

        const errorName =
          micErr instanceof DOMException
            ? micErr.name
            : 'UnknownError';

        const errorText =
          micErr instanceof Error
            ? micErr.message
            : 'Penyebab tidak diketahui';

        setErrorMessage(
          `Mic gagal: ${errorName} - ${errorText}`
        );

        setStatusMessage(
          'Mikrofon gagal diaktifkan.'
        );

        setIsMicActive(false);

        // ----------------------------------------------------
        // Bersihkan microphone
        // ----------------------------------------------------

        stopMicCapture();

        // ----------------------------------------------------
        // Tutup WebSocket jika mic gagal
        // ----------------------------------------------------

        const ws =
          wsRef.current;

        wsRef.current =
          null;

        if (ws) {
          try {
            ws.close();
          } catch {
            // Ignore
          }
        }

        setIsConnected(false);
        setIsConnecting(false);
      }
    };

  // ==========================================================
  // CONNECT GEMINI LIVE SESSION
  // ==========================================================

  const connectLiveSession =
    async () => {
      if (
        isConnecting ||
        isConnected
      ) {
        return;
      }

      setIsConnecting(true);
      setErrorMessage(null);

      setStatusMessage(
        'Menghubungkan ke Live Voice AI...'
      );

      try {
        // ----------------------------------------------------
        // Create audio player
        // ----------------------------------------------------

        if (
          !audioPlayerRef.current
        ) {
          audioPlayerRef.current =
            new LiveAudioPlayer(
              24000
            );
        }

        await audioPlayerRef.current.resume();

        // ----------------------------------------------------
        // WebSocket protocol
        // ----------------------------------------------------

        const protocol =
          window.location.protocol ===
          'https:'
            ? 'wss:'
            : 'ws:';

        /*
         * API key TIDAK disimpan di frontend.
         *
         * Frontend hanya terhubung ke:
         *
         * /live
         *
         * Gemini API dipanggil oleh server.ts.
         */

        const wsUrl =
          `${protocol}//${window.location.host}/live`;

        console.log(
          'Connecting Live WebSocket:',
          wsUrl
        );

        const ws =
          new WebSocket(
            wsUrl
          );

        wsRef.current =
          ws;

        // ----------------------------------------------------
        // WebSocket OPEN
        // ----------------------------------------------------

        ws.onopen =
          async () => {
            console.log(
              'Live WebSocket connected'
            );

            setIsConnected(true);
            setIsConnecting(false);
            setErrorMessage(null);

            setStatusMessage(
              'Terhubung! Menyiapkan mikrofon...'
            );

            await startMicCapture();
          };

        // ----------------------------------------------------
        // WebSocket MESSAGE
        // ----------------------------------------------------

        ws.onmessage =
          (event) => {
            try {
              const data =
                JSON.parse(
                  event.data
                );

              console.log(
                'Live message:',
                data
              );

              // ==============================================
              // ADD PRODUCT
              // ==============================================

              if (
                data.type ===
                'add_to_cart'
              ) {
                const requestedName =
                  typeof data.product ===
                  'string'
                    ? data.product.trim()
                    : '';

                const product =
                  findProduct(
                    requestedName
                  );

                const quantity =
                  Math.max(
                    1,
                    Math.floor(
                      Number(
                        data.quantity
                      ) || 1
                    )
                  );

                if (
                  !product
                ) {
                  setErrorMessage(
                    `Produk "${requestedName}" tidak ditemukan di menu.`
                  );

                  addAiMessage(
                    `Maaf, produk "${requestedName}" tidak ditemukan di menu Pisang Melt.`
                  );

                  return;
                }

                if (
                  onQuickAddProduct
                ) {
                  onQuickAddProduct(
                    product.name,
                    quantity
                  );
                }

                addAiMessage(
                  `${product.name} sebanyak ${quantity} berhasil ditambahkan ke keranjang.`
                );

                setStatusMessage(
                  `${product.name} x${quantity} ditambahkan ke keranjang`
                );
              }

              // ==============================================
              // ADD BUNDLE
              // ==============================================

              if (
                data.type ===
                'add_bundle_to_cart'
              ) {
                const requestedName =
                  typeof data.bundle ===
                  'string'
                    ? data.bundle.trim()
                    : '';

                const bundle =
                  findBundle(
                    requestedName
                  );

                const quantity =
                  Math.max(
                    1,
                    Math.floor(
                      Number(
                        data.quantity
                      ) || 1
                    )
                  );

                if (
                  !bundle
                ) {
                  setErrorMessage(
                    `Paket "${requestedName}" tidak ditemukan.`
                  );

                  addAiMessage(
                    `Maaf, paket "${requestedName}" tidak ditemukan di daftar paket Pisang Melt.`
                  );

                  return;
                }

                if (
                  onQuickAddBundle
                ) {
                  onQuickAddBundle(
                    bundle.name,
                    quantity
                  );
                }

                addAiMessage(
                  `${bundle.name} sebanyak ${quantity} berhasil ditambahkan ke keranjang.`
                );

                setStatusMessage(
                  `${bundle.name} x${quantity} ditambahkan ke keranjang`
                );
              }

              // ==============================================
              // REMOVE PRODUCT
              // ==============================================

              if (
                data.type ===
                'remove_from_cart'
              ) {
                const requestedName =
                  typeof data.product ===
                  'string'
                    ? data.product.trim()
                    : '';

                const product =
                  findProduct(
                    requestedName
                  );

                const quantity =
                  Math.max(
                    1,
                    Math.floor(
                      Number(
                        data.quantity
                      ) || 1
                    )
                  );

                if (
                  !product
                ) {
                  setErrorMessage(
                    `Produk "${requestedName}" tidak ditemukan di menu.`
                  );

                  addAiMessage(
                    `Maaf, produk "${requestedName}" tidak ditemukan di menu Pisang Melt.`
                  );

                  return;
                }

                if (
                  onQuickRemoveProduct
                ) {
                  onQuickRemoveProduct(
                    product.name,
                    quantity
                  );
                }

                addAiMessage(
                  `${product.name} sebanyak ${quantity} dikurangi dari keranjang.`
                );

                setStatusMessage(
                  `${product.name} x${quantity} dikurangi dari keranjang`
                );
              }

              // ==============================================
              // REMOVE BUNDLE
              // ==============================================

              if (
                data.type ===
                'remove_bundle_from_cart'
              ) {
                const requestedName =
                  typeof data.bundle ===
                  'string'
                    ? data.bundle.trim()
                    : '';

                const bundle =
                  findBundle(
                    requestedName
                  );

                const quantity =
                  Math.max(
                    1,
                    Math.floor(
                      Number(
                        data.quantity
                      ) || 1
                    )
                  );

                const removeAll =
                  data.removeAll ===
                  true;

                if (
                  !bundle
                ) {
                  setErrorMessage(
                    `Paket "${requestedName}" tidak ditemukan.`
                  );

                  addAiMessage(
                    `Maaf, paket "${requestedName}" tidak ditemukan di daftar paket Pisang Melt.`
                  );

                  return;
                }

                if (
                  onQuickRemoveBundle
                ) {
                  onQuickRemoveBundle(
                    bundle.name,
                    quantity,
                    removeAll
                  );
                }

                addAiMessage(
                  removeAll
                    ? `Semua ${bundle.name} dihapus dari keranjang.`
                    : `${bundle.name} sebanyak ${quantity} dikurangi dari keranjang.`
                );

                setStatusMessage(
                  removeAll
                    ? `Semua ${bundle.name} dihapus dari keranjang`
                    : `${bundle.name} x${quantity} dikurangi dari keranjang`
                );
              }

              // ==============================================
              // CART ERROR
              // ==============================================

              if (
                data.type ===
                'cart_error'
              ) {
                const message =
                  typeof data.message ===
                  'string'
                    ? data.message
                    : 'Produk gagal diproses di keranjang.';

                console.error(
                  'Cart error:',
                  message
                );

                setErrorMessage(
                  message
                );

                addAiMessage(
                  message
                );

                setStatusMessage(
                  'Terjadi masalah pada keranjang.'
                );
              }

              // ==============================================
              // AUDIO RESPONSE
              // ==============================================

              if (
                data.type ===
                  'audio' &&
                typeof data.audio ===
                  'string' &&
                data.audio
              ) {
                setIsAiSpeaking(
                  true
                );

                setStatusMessage(
                  'MeltVoice sedang berbicara...'
                );

                void audioPlayerRef.current?.playChunk(
                  data.audio
                );
              }

              // ==============================================
              // AI TRANSCRIPT
              // ==============================================

              if (
                data.type ===
                  'transcript' &&
                typeof data.text ===
                  'string'
              ) {
                const transcript =
                  data.text.trim();

                if (
                  transcript
                ) {
                  setMessages(
                    (prev) => {
                      const lastMsg =
                        prev[
                          prev.length -
                            1
                        ];

                      /*
                       * Jika transcript AI datang bertahap,
                       * gabungkan ke pesan AI terakhir.
                       */

                      if (
                        lastMsg &&
                        lastMsg.sender ===
                          'ai'
                      ) {
                        return [
                          ...prev.slice(
                            0,
                            -1
                          ),
                          {
                            ...lastMsg,
                            text:
                              `${lastMsg.text} ${transcript}`.trim(),
                          },
                        ];
                      }

                      return [
                        ...prev,
                        {
                          id:
                            `ai-${Date.now()}-${Math.random()
                              .toString(36)
                              .slice(2, 7)}`,
                          sender: 'ai',
                          text:
                            transcript,
                          timestamp:
                            getCurrentTime(),
                        },
                      ];
                    }
                  );
                }
              }

              // ==============================================
              // INTERRUPTION
              // ==============================================

              if (
                data.type ===
                'interrupted'
              ) {
                audioPlayerRef.current?.stopAll();

                setIsAiSpeaking(
                  false
                );

                setStatusMessage(
                  'Mendengarkan suara Anda...'
                );
              }

              // ==============================================
              // TURN COMPLETE
              // ==============================================

              if (
                data.type ===
                'turnComplete'
              ) {
                setIsAiSpeaking(
                  false
                );

                setStatusMessage(
                  'Mendengarkan... Silakan berbicara'
                );
              }

              // ==============================================
              // SERVER ERROR
              // ==============================================

              if (
                data.type ===
                'error'
              ) {
                const message =
                  typeof data.message ===
                  'string'
                    ? data.message
                    : 'Terjadi kendala pada koneksi audio.';

                console.error(
                  'Server error:',
                  message
                );

                setErrorMessage(
                  message
                );

                stopMicCapture();

                setIsConnecting(
                  false
                );

                setIsConnected(
                  false
                );

                setIsMicActive(
                  false
                );

                setIsAiSpeaking(
                  false
                );
              }
            } catch (error) {
              console.error(
                'Error handling WebSocket message:',
                error
              );
            }
          };

        // ----------------------------------------------------
        // WebSocket ERROR
        // ----------------------------------------------------

        ws.onerror =
          (error) => {
            console.error(
              'WebSocket connection error:',
              error
            );

            setErrorMessage(
              'Gagal menyambung ke server suara Live API. Silakan coba lagi.'
            );

            setIsConnecting(
              false
            );

            setIsConnected(
              false
            );

            stopMicCapture();
          };

        // ----------------------------------------------------
        // WebSocket CLOSE
        // ----------------------------------------------------

        ws.onclose =
          () => {
            console.log(
              'Live WebSocket closed'
            );

            stopMicCapture();

            if (
              wsRef.current ===
              ws
            ) {
              wsRef.current =
                null;
            }

            setIsConnected(
              false
            );

            setIsConnecting(
              false
            );

            setIsMicActive(
              false
            );

            setIsAiSpeaking(
              false
            );

            setStatusMessage(
              'Sesi audio selesai'
            );
          };
      } catch (error: unknown) {
        console.error(
          'Connection init error:',
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memulai sesi suara.';

        setErrorMessage(
          message
        );

        setIsConnecting(
          false
        );

        setIsConnected(
          false
        );

        stopMicCapture();

        if (
          wsRef.current
        ) {
          try {
            wsRef.current.close();
          } catch {
            // Ignore
          }

          wsRef.current =
            null;
        }
      }
    };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const handleClose =
    () => {
      disconnectSession();
      onClose();
    };

  // ==========================================================
  // TOGGLE VOICE SESSION
  // ==========================================================

  const toggleMic =
    () => {
      if (
        isConnected ||
        isConnecting
      ) {
        disconnectSession();
        return;
      }

      setErrorMessage(null);

      void connectLiveSession();
    };

  // ==========================================================
  // TEXT INPUT
  // ==========================================================

  const handleSendPromptText =
    async (
      promptText: string
    ) => {
      const cleanPrompt =
        promptText.trim();

      if (
        !cleanPrompt
      ) {
        return;
      }

      // ------------------------------------------------------
      // Add user message
      // ------------------------------------------------------

      const userMsg: MessageLog =
        {
          id:
            `user-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 7)}`,
          sender: 'user',
          text:
            cleanPrompt,
          timestamp:
            getCurrentTime(),
        };

      setMessages(
        (prev) => [
          ...prev,
          userMsg,
        ]
      );

      setTextInput('');
      setErrorMessage(null);

      // ------------------------------------------------------
      // Send through Live WebSocket
      // ------------------------------------------------------

      if (
        wsRef.current &&
        wsRef.current.readyState ===
          WebSocket.OPEN
      ) {
        try {
          wsRef.current.send(
            JSON.stringify({
              text:
                cleanPrompt,
            })
          );

          setStatusMessage(
            'Mengirim pertanyaan ke Live Voice AI...'
          );

          return;
        } catch (error) {
          console.error(
            'WebSocket text error:',
            error
          );
        }
      }

      // ------------------------------------------------------
      // HTTP fallback
      // ------------------------------------------------------

      setStatusMessage(
        'Memproses respon...'
      );

      try {
        const response =
          await fetch(
            '/api/gemini/assistant',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  prompt:
                    cleanPrompt,

                  conversationHistory:
                    messages.slice(
                      -4
                    ),
                }),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Server mengembalikan status ${response.status}.`
          );
        }

        const data =
          await response.json();

        if (
          data &&
          typeof data.text ===
            'string' &&
          data.text.trim()
        ) {
          setMessages(
            (prev) => [
              ...prev,
              {
                id:
                  `ai-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,
                sender: 'ai',
                text:
                  data.text.trim(),
                timestamp:
                  getCurrentTime(),
              },
            ]
          );

          setStatusMessage(
            'Respon siap'
          );
        } else {
          throw new Error(
            data?.error ||
              'Gagal menerima respon dari asisten.'
          );
        }
      } catch (error: unknown) {
        console.error(
          'HTTP assistant error:',
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menghubungkan ke asisten.';

        setErrorMessage(
          `Kendala menghubungkan ke asisten: ${message}`
        );

        setStatusMessage(
          'Asisten tidak dapat memberikan respon.'
        );
      }
    };

  // ==========================================================
  // QUICK PROMPTS
  // ==========================================================

  const quickPrompts = [
    'Rekomendasi varian pisang paling hits?',
    'Berapa harga Pisang Crispy Cokelat Keju?',
    'Gimana cara dapat 1 Box Gratis?',
    'Bedanya Pisang Crispy vs Nugget apa?',
    'Ada kode promo apa hari ini?',
  ];

  // ==========================================================
  // MENU DATA
  // ==========================================================

  const menuItems =
    PRODUCTS.map(
      (product) => ({
        name:
          product.name,
        price:
          product.price,
      })
    );

  // ==========================================================
  // BUNDLE DATA
  // ==========================================================

  const promoBundles =
    PROMO_BUNDLES.map(
      (bundle) => ({
        name:
          bundle.name,
        price:
          bundle.price,
        description:
          bundle.description,
      })
    );

  // ==========================================================
  // CLOSED
  // ==========================================================

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex items-center justify-center
        bg-black/70 backdrop-blur-sm
        animate-in fade-in duration-200
        p-0
        sm:p-4
        lg:p-6
      "
      role="dialog"
      aria-modal="true"
      aria-label="MeltVoice Live Assistant"
      onClick={handleClose}
    >
      <div
        className="
          relative
          w-full
          h-full
          sm:h-[94vh]
          lg:h-[92vh]

          max-w-none
          sm:max-w-3xl
          lg:max-w-5xl
          xl:max-w-6xl

          bg-white
          sm:rounded-3xl

          shadow-2xl
          overflow-hidden

          flex flex-col

          border-0
          sm:border
          border-stone-200
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            shrink-0
            px-3
            py-3

            sm:px-5
            sm:py-4

            lg:px-6
            lg:py-5

            bg-[#241305]
            text-white
            flex
            items-center
            justify-between

            border-b
            border-stone-800
          "
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="
                w-9 h-9
                sm:w-10 sm:h-10
                lg:w-11 lg:h-11

                shrink-0
                rounded-xl
                sm:rounded-2xl

                bg-amber-500/20
                text-amber-400

                flex
                items-center
                justify-center

                border
                border-amber-500/30
              "
            >
              <Headphones
                className="
                  w-4 h-4
                  sm:w-5 sm:h-5
                  lg:w-5 lg:h-5
                "
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="
                    text-sm
                    sm:text-base
                    lg:text-lg

                    font-bold
                    font-display
                    text-white
                    truncate
                  "
                >
                  MeltVoice Live Assistant
                </h3>

                <span
                  className="
                    hidden
                    sm:inline-block

                    text-[10px]
                    font-mono
                    font-bold

                    text-amber-300
                    bg-amber-950/60

                    px-2
                    py-0.5

                    rounded
                    border
                    border-amber-500/40

                    shrink-0
                  "
                >
                  LIVE VOICE AI
                </span>
              </div>

              <p
                className="
                  text-[10px]
                  sm:text-xs

                  text-stone-300

                  flex
                  items-center
                  gap-1.5

                  mt-0.5
                "
              >
                <span
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 rounded-full ${
                    isConnected
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-stone-500'
                  }`}
                  aria-hidden="true"
                />

                <span className="truncate">
                  {isConnected
                    ? 'Sesi Suara Aktif (Real-time)'
                    : 'Offline (Klik Mulai Sesi)'}
                </span>
              </p>
            </div>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup asisten suara"
            className="
              relative
              z-[300]

              shrink-0

              w-9 h-9
              sm:w-10 sm:h-10
              lg:w-11 lg:h-11

              ml-2
              sm:ml-3

              rounded-full

              bg-stone-800
              hover:bg-stone-700

              text-stone-300
              hover:text-white

              flex
              items-center
              justify-center

              transition-all
              cursor-pointer

              border
              border-stone-600
              hover:border-stone-400

              shadow-lg
            "
          >
            <X
              className="
                w-4 h-4
                sm:w-5 sm:h-5
              "
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ====================================================
            DESKTOP CONTENT
        ==================================================== */}

        <div
          className="
            hidden
            lg:flex
            flex-1
            min-h-0
          "
        >
          {/* LEFT SIDE */}

          <div
            className="
              w-[38%]
              shrink-0

              flex
              flex-col

              border-r
              border-stone-200
              bg-[#FAF7F2]
            "
          >
            {/* VOICE VISUALIZER */}

            <div
              className="
                shrink-0
                px-6
                py-7

                text-center
                border-b
                border-stone-200
              "
            >
              <div className="relative inline-flex items-center justify-center">
                {(isAiSpeaking ||
                  (isConnected &&
                    isMicActive)) && (
                  <>
                    <div
                      className="
                        absolute
                        w-36
                        h-36
                        rounded-full
                        bg-amber-400/20
                        animate-ping
                        pointer-events-none
                      "
                      style={{
                        animationDuration:
                          '2s',
                      }}
                    />

                    <div
                      className="
                        absolute
                        w-32
                        h-32
                        rounded-full
                        bg-amber-500/30
                        pointer-events-none
                        transition-all
                        duration-100
                      "
                      style={{
                        transform:
                          `scale(${
                            1 +
                            audioLevel *
                              0.4
                          })`,
                      }}
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={
                    isConnecting
                  }
                  aria-label={
                    isConnected
                      ? 'Hentikan sesi suara'
                      : 'Mulai sesi suara'
                  }
                  className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl active:scale-95 ${
                    isConnecting
                      ? 'bg-stone-300 text-stone-600 animate-pulse'
                      : isConnected
                      ? isAiSpeaking
                        ? 'bg-amber-600 text-white shadow-amber-600/40'
                        : 'bg-emerald-600 text-white shadow-emerald-600/40'
                      : 'bg-[#3A1E08] text-white hover:bg-black shadow-stone-900/30'
                  }`}
                >
                  {isConnecting ? (
                    <RefreshCw
                      className="w-9 h-9 animate-spin"
                      aria-hidden="true"
                    />
                  ) : isConnected ? (
                    isAiSpeaking ? (
                      <Volume2
                        className="w-10 h-10 animate-bounce"
                        aria-hidden="true"
                      />
                    ) : (
                      <Mic
                        className="w-10 h-10"
                        aria-hidden="true"
                      />
                    )
                  ) : (
                    <Mic
                      className="w-10 h-10"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-[#241305]">
                  {statusMessage}
                </p>

                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {isConnected
                    ? 'Bicaralah secara bebas ke mikrofon, AI akan merespons langsung dengan suara!'
                    : 'Klik lingkaran di atas untuk mengaktifkan percakapan suara langsung'}
                </p>
              </div>

              {errorMessage && (
                <div
                  className="
                    mt-4
                    p-3

                    bg-red-50
                    border
                    border-red-200

                    rounded-xl

                    text-xs
                    text-red-700

                    flex
                    items-center
                    justify-center
                    gap-1.5
                  "
                  role="alert"
                >
                  <AlertCircle
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span>
                    {errorMessage}
                  </span>
                </div>
              )}
            </div>

            {/* MENU DESKTOP */}

            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto

                p-5

                overscroll-contain
              "
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-[#241305]">
                    🍌 Menu Pisang Melt
                  </h4>

                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Pilihan menu tersedia
                  </p>
                </div>

                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                  MENU
                </span>
              </div>

              <div className="space-y-2">
                {menuItems.map(
                  (item) => (
                    <div
                      key={item.name}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3

                        bg-white
                        border
                        border-stone-200

                        rounded-xl

                        px-3
                        py-3
                      "
                    >
                      <span className="text-[11px] font-medium text-stone-800 leading-tight">
                        {item.name}
                      </span>

                      <span className="text-[11px] font-bold text-amber-700 whitespace-nowrap">
                        {formatRupiah(
                          item.price
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">
                    🎁
                  </span>

                  <h4 className="text-sm font-bold text-[#241305]">
                    Paket Hemat
                  </h4>

                  <span className="text-[9px] font-bold text-white bg-amber-600 px-2 py-0.5 rounded-full">
                    PROMO
                  </span>
                </div>

                <div className="space-y-2">
                  {promoBundles.map(
                    (bundle) => (
                      <div
                        key={bundle.name}
                        className="
                          bg-gradient-to-r
                          from-amber-50
                          to-orange-50

                          border
                          border-amber-200

                          rounded-xl

                          px-3
                          py-3
                        "
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[#241305]">
                              {bundle.name}
                            </p>

                            <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                              {bundle.description}
                            </p>
                          </div>

                          <span className="text-[11px] font-bold text-amber-700 whitespace-nowrap">
                            {formatRupiah(
                              bundle.price
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-4 text-center bg-[#241305] text-white rounded-xl px-3 py-3">
                <p className="text-[10px] font-medium">
                  🎙️ Tinggal bilang:
                </p>

                <p className="text-[10px] text-amber-300 font-bold mt-1">
                  "Pesan Paket Duo Lumer Puas satu"
                </p>

                <p className="text-[10px] text-amber-300 font-bold mt-1">
                  "Hapus Paket Duo Lumer Puas satu"
                </p>

                <p className="text-[10px] text-amber-300 font-bold mt-1">
                  "Hapus semua Paket Duo Lumer Puas"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div
            className="
              flex-1
              min-w-0
              min-h-0

              flex
              flex-col

              bg-white
            "
          >
            {/* TRANSCRIPT */}

            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto

                overscroll-contain

                p-6

                space-y-3
              "
            >
              <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider text-center mb-3">
                Transkrip Percakapan Real-Time
              </div>

              {messages.map(
                (msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender ===
                      'user'
                        ? 'items-end'
                        : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender ===
                        'user'
                          ? 'bg-[#3A1E08] text-white rounded-br-xs'
                          : 'bg-[#FAF7F2] text-stone-800 border border-stone-200/90 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <span className="text-[10px] text-stone-400 px-1 mt-0.5 tabular-nums">
                      {msg.timestamp}
                    </span>
                  </div>
                )
              )}

              {isAiSpeaking && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl self-start">
                  <Sparkles
                    className="w-3.5 h-3.5 animate-spin"
                    aria-hidden="true"
                  />

                  <span>
                    MeltVoice sedang berbicara...
                  </span>
                </div>
              )}

              <div
                ref={
                  messagesEndRef
                }
                className="h-px"
              />
            </div>

            {/* QUICK PROMPTS */}

            <div className="shrink-0 p-4 bg-stone-50 border-t border-stone-200">
              <div className="text-[11px] text-stone-500 font-medium mb-2">
                Pertanyaan Populer:
              </div>

              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map(
                  (
                    prompt,
                    idx
                  ) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() =>
                        void handleSendPromptText(
                          prompt
                        )
                      }
                      className="
                        text-[11px]

                        bg-white
                        hover:bg-amber-100

                        text-stone-700
                        hover:text-amber-950

                        px-2.5
                        py-1.5

                        rounded-lg

                        border
                        border-stone-200

                        transition-colors
                        cursor-pointer
                      "
                    >
                      {prompt}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* TEXT INPUT */}

            <div className="shrink-0 p-4 bg-white border-t border-stone-200">
              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  void handleSendPromptText(
                    textInput
                  );
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Atau ketik pesan / pertanyaan di sini..."
                  value={textInput}
                  onChange={(event) =>
                    setTextInput(
                      event.target.value
                    )
                  }
                  maxLength={500}
                  className="
                    flex-1
                    min-w-0

                    text-xs

                    px-3.5
                    py-3

                    rounded-xl

                    border
                    border-stone-300

                    focus:outline-none
                    focus:ring-1
                    focus:ring-amber-500

                    bg-stone-50/50
                  "
                  aria-label="Pesan untuk MeltVoice"
                />

                <button
                  type="submit"
                  disabled={
                    !textInput.trim()
                  }
                  className="
                    shrink-0

                    p-3

                    rounded-xl

                    bg-[#3A1E08]
                    text-white

                    hover:bg-black

                    disabled:opacity-40
                    disabled:cursor-not-allowed

                    transition-colors
                    cursor-pointer
                  "
                  aria-label="Kirim pesan"
                >
                  <Send
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ====================================================
            TABLET / MOBILE CONTENT
        ==================================================== */}

        <div
          className="
            flex
            lg:hidden

            flex-1
            min-h-0

            flex-col
          "
        >
          {/* VOICE AREA */}

          <div
            className="
              shrink-0

              bg-[#FAF7F2]

              px-4
              py-4

              sm:px-5
              sm:py-5

              text-center

              border-b
              border-stone-200
            "
          >
            <div className="relative inline-flex items-center justify-center">
              {(isAiSpeaking ||
                (isConnected &&
                  isMicActive)) && (
                <>
                  <div
                    className="
                      absolute

                      w-28
                      h-28

                      sm:w-32
                      sm:h-32

                      rounded-full

                      bg-amber-400/20

                      animate-ping

                      pointer-events-none
                    "
                    style={{
                      animationDuration:
                        '2s',
                    }}
                  />

                  <div
                    className="
                      absolute

                      w-24
                      h-24

                      sm:w-28
                      sm:h-28

                      rounded-full

                      bg-amber-500/30

                      pointer-events-none

                      transition-all
                      duration-100
                    "
                    style={{
                      transform:
                        `scale(${
                          1 +
                          audioLevel *
                            0.4
                        })`,
                    }}
                  />
                </>
              )}

              <button
                type="button"
                onClick={toggleMic}
                disabled={
                  isConnecting
                }
                aria-label={
                  isConnected
                    ? 'Hentikan sesi suara'
                    : 'Mulai sesi suara'
                }
                className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isConnecting
                    ? 'bg-stone-300 text-stone-600 animate-pulse'
                    : isConnected
                    ? isAiSpeaking
                      ? 'bg-amber-600 text-white shadow-amber-600/40'
                      : 'bg-emerald-600 text-white shadow-emerald-600/40'
                    : 'bg-[#3A1E08] text-white hover:bg-black shadow-stone-900/30'
                }`}
              >
                {isConnecting ? (
                  <RefreshCw
                    className="w-7 h-7 sm:w-8 sm:h-8 animate-spin"
                    aria-hidden="true"
                  />
                ) : isConnected ? (
                  isAiSpeaking ? (
                    <Volume2
                      className="w-8 h-8 sm:w-9 sm:h-9 animate-bounce"
                      aria-hidden="true"
                    />
                  ) : (
                    <Mic
                      className="w-8 h-8 sm:w-9 sm:h-9"
                      aria-hidden="true"
                    />
                  )
                ) : (
                  <Mic
                    className="w-8 h-8 sm:w-9 sm:h-9"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            <div className="mt-3">
              <p className="text-xs sm:text-sm font-bold text-[#241305]">
                {statusMessage}
              </p>

              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                {isConnected
                  ? 'Bicaralah secara bebas ke mikrofon, AI akan merespons langsung dengan suara!'
                  : 'Klik lingkaran di atas untuk mengaktifkan percakapan suara langsung'}
              </p>
            </div>

            {errorMessage && (
              <div
                className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10px] sm:text-xs text-red-700 flex items-center justify-center gap-1.5"
                role="alert"
              >
                <AlertCircle
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                />

                <span>
                  {errorMessage}
                </span>
              </div>
            )}
          </div>

          {/* MOBILE MENU */}

          <div
            className="
              shrink-0

              bg-white

              px-4
              py-3

              border-b
              border-stone-200
            "
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#241305]">
                  🍌 Menu & Paket
                </h4>

                <p className="text-[9px] text-stone-500 mt-0.5">
                  Geser untuk melihat pilihan
                </p>
              </div>

              <span className="text-[8px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                MENU
              </span>
            </div>

            {/* MENU HORIZONTAL */}

            <div
              className="
                flex
                gap-2

                overflow-x-auto
                overscroll-contain

                pb-1

                scrollbar-thin
              "
            >
              {menuItems.map(
                (item) => (
                  <div
                    key={item.name}
                    className="
                      shrink-0

                      w-[190px]
                      sm:w-[210px]

                      bg-[#FAF7F2]

                      border
                      border-stone-200

                      rounded-xl

                      px-3
                      py-2.5
                    "
                  >
                    <p className="text-[10px] sm:text-[11px] font-semibold text-stone-800 leading-tight">
                      {item.name}
                    </p>

                    <p className="text-[10px] sm:text-[11px] font-bold text-amber-700 mt-1">
                      {formatRupiah(
                        item.price
                      )}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* PROMO HORIZONTAL */}

            <div className="flex items-center gap-2 mt-3 mb-2">
              <span className="text-sm">
                🎁
              </span>

              <h4 className="text-xs sm:text-sm font-bold text-[#241305]">
                Paket Hemat
              </h4>

              <span className="text-[8px] font-bold text-white bg-amber-600 px-2 py-0.5 rounded-full">
                PROMO
              </span>
            </div>

            <div
              className="
                flex
                gap-2

                overflow-x-auto
                overscroll-contain

                pb-1

                scrollbar-thin
              "
            >
              {promoBundles.map(
                (bundle) => (
                  <div
                    key={bundle.name}
                    className="
                      shrink-0

                      w-[220px]
                      sm:w-[250px]

                      bg-gradient-to-r
                      from-amber-50
                      to-orange-50

                      border
                      border-amber-200

                      rounded-xl

                      px-3
                      py-2.5
                    "
                  >
                    <p className="text-[10px] sm:text-[11px] font-bold text-[#241305]">
                      {bundle.name}
                    </p>

                    <p className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5 leading-tight">
                      {bundle.description}
                    </p>

                    <p className="text-[10px] sm:text-[11px] font-bold text-amber-700 mt-1">
                      {formatRupiah(
                        bundle.price
                      )}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-2.5 text-center bg-[#241305] text-white rounded-xl px-3 py-2">
              <p className="text-[9px] font-medium">
                🎙️ Tinggal bilang:
              </p>

              <p className="text-[9px] sm:text-[10px] text-amber-300 font-bold mt-0.5">
                "Pesan Paket Duo Lumer Puas satu"
              </p>

              <p className="text-[9px] sm:text-[10px] text-amber-300 font-bold mt-0.5">
                "Hapus Paket Duo Lumer Puas satu"
              </p>

              <p className="text-[9px] sm:text-[10px] text-amber-300 font-bold mt-0.5">
                "Hapus semua Paket Duo Lumer Puas"
              </p>
            </div>
          </div>

          {/* MOBILE TRANSCRIPT */}

          <div
            className="
              flex-1
              min-h-0

              overflow-y-auto

              overscroll-contain

              p-3
              sm:p-4

              space-y-2.5

              bg-white
            "
          >
            <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider text-center mb-2">
              Transkrip Percakapan Real-Time
            </div>

            {messages.map(
              (msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender ===
                    'user'
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[11px] sm:text-xs leading-relaxed ${
                      msg.sender ===
                      'user'
                        ? 'bg-[#3A1E08] text-white rounded-br-xs'
                        : 'bg-[#FAF7F2] text-stone-800 border border-stone-200/90 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <span className="text-[9px] text-stone-400 px-1 mt-0.5 tabular-nums">
                    {msg.timestamp}
                  </span>
                </div>
              )
            )}

            {isAiSpeaking && (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl self-start">
                <Sparkles
                  className="w-3.5 h-3.5 animate-spin"
                  aria-hidden="true"
                />

                <span>
                  MeltVoice sedang berbicara...
                </span>
              </div>
            )}

            <div
              ref={
                messagesEndRef
              }
              className="h-px"
            />
          </div>

          {/* MOBILE QUICK PROMPTS */}

          <div
            className="
              shrink-0

              p-2.5
              sm:p-3

              bg-stone-50

              border-t
              border-stone-200
            "
          >
            <div className="text-[10px] text-stone-500 font-medium mb-1.5">
              Pertanyaan Populer:
            </div>

            <div
              className="
                flex
                gap-1.5

                overflow-x-auto

                pb-0.5

                scrollbar-thin
              "
            >
              {quickPrompts.map(
                (
                  prompt,
                  idx
                ) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() =>
                      void handleSendPromptText(
                        prompt
                      )
                    }
                    className="
                      shrink-0

                      text-[10px]

                      bg-white
                      hover:bg-amber-100

                      text-stone-700
                      hover:text-amber-950

                      px-2.5
                      py-1.5

                      rounded-lg

                      border
                      border-stone-200

                      transition-colors
                      cursor-pointer
                    "
                  >
                    {prompt}
                  </button>
                )
              )}
            </div>
          </div>

          {/* MOBILE TEXT INPUT */}

          <div
            className="
              shrink-0

              p-2.5
              sm:p-3

              bg-white

              border-t
              border-stone-200
            "
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();

                void handleSendPromptText(
                  textInput
                );
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={textInput}
                onChange={(event) =>
                  setTextInput(
                    event.target.value
                  )
                }
                maxLength={500}
                className="
                  flex-1
                  min-w-0

                  text-[11px]
                  sm:text-xs

                  px-3
                  py-2.5

                  rounded-xl

                  border
                  border-stone-300

                  focus:outline-none
                  focus:ring-1
                  focus:ring-amber-500

                  bg-stone-50/50
                "
                aria-label="Pesan untuk MeltVoice"
              />

              <button
                type="submit"
                disabled={
                  !textInput.trim()
                }
                className="
                  shrink-0

                  p-2.5

                  rounded-xl

                  bg-[#3A1E08]
                  text-white

                  hover:bg-black

                  disabled:opacity-40
                  disabled:cursor-not-allowed

                  transition-colors
                  cursor-pointer
                "
                aria-label="Kirim pesan"
              >
                <Send
                  className="w-4 h-4"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};