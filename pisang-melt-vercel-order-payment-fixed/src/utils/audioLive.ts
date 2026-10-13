/**
 * Audio processing utilities for Gemini Live API
 * real-time voice streaming.
 *
 * Customer-side only:
 * - Microphone Float32 -> PCM 16-bit Base64
 * - Gemini PCM 24 kHz Base64 -> AudioBuffer
 * - Queued low-latency audio playback
 */

// ======================================================
// FLOAT32 -> PCM 16-BIT BASE64
// ======================================================

/**
 * Mengubah audio Float32Array dari microphone browser
 * menjadi PCM signed 16-bit little-endian dalam Base64.
 *
 * Input:
 *   Float32Array dengan range -1.0 sampai 1.0
 *
 * Output:
 *   Base64 PCM 16-bit little-endian
 */
export function float32ToPcmBase64(
  float32Array: Float32Array
): string {
  const int16Array =
    new Int16Array(
      float32Array.length
    );

  for (
    let i = 0;
    i < float32Array.length;
    i++
  ) {
    const sample = Math.max(
      -1,
      Math.min(
        1,
        float32Array[i]
      )
    );

    int16Array[i] =
      sample < 0
        ? sample * 0x8000
        : sample * 0x7fff;
  }

  // ----------------------------------------------------
  // Int16Array -> Uint8Array
  // ----------------------------------------------------

  const uint8 =
    new Uint8Array(
      int16Array.buffer
    );

  let binary = '';

  // Gunakan chunk agar tidak membuat call stack / memory
  // terlalu besar ketika audio buffer cukup panjang.
  const CHUNK_SIZE = 0x8000;

  for (
    let offset = 0;
    offset < uint8.length;
    offset += CHUNK_SIZE
  ) {
    const chunk =
      uint8.subarray(
        offset,
        Math.min(
          offset + CHUNK_SIZE,
          uint8.length
        )
      );

    binary += String.fromCharCode(
      ...chunk
    );
  }

  return btoa(binary);
}

// ======================================================
// BASE64 PCM -> AUDIO BUFFER
// ======================================================

/**
 * Mengubah Base64 PCM 16-bit little-endian
 * menjadi AudioBuffer browser.
 *
 * Default output Gemini Live:
 *   24.000 Hz
 */
export function pcmBase64ToAudioBuffer(
  base64Data: string,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  if (!base64Data) {
    throw new Error(
      'PCM audio data kosong.'
    );
  }

  const binaryString =
    atob(base64Data);

  const byteLength =
    binaryString.length;

  // PCM 16-bit membutuhkan 2 byte
  // untuk setiap sample.
  if (
    byteLength === 0
  ) {
    throw new Error(
      'PCM audio data kosong.'
    );
  }

  if (
    byteLength % 2 !== 0
  ) {
    throw new Error(
      'PCM audio data tidak valid: jumlah byte harus genap.'
    );
  }

  const bytes =
    new Uint8Array(
      byteLength
    );

  for (
    let i = 0;
    i < byteLength;
    i++
  ) {
    bytes[i] =
      binaryString.charCodeAt(i);
  }

  // ----------------------------------------------------
  // Pastikan pembacaan little-endian
  // ----------------------------------------------------

  const dataView =
    new DataView(
      bytes.buffer
    );

  const sampleCount =
    byteLength / 2;

  const audioBuffer =
    audioContext.createBuffer(
      1,
      sampleCount,
      sampleRate
    );

  const channelData =
    audioBuffer.getChannelData(0);

  for (
    let i = 0;
    i < sampleCount;
    i++
  ) {
    const sample =
      dataView.getInt16(
        i * 2,
        true
      );

    channelData[i] =
      sample / 32768;
  }

  return audioBuffer;
}

// ======================================================
// LIVE AUDIO PLAYER
// ======================================================

/**
 * Audio player untuk Gemini Live API.
 *
 * Fungsi utama:
 * - menerima potongan PCM dari server
 * - memasukkannya ke queue
 * - memainkan audio secara berurutan
 * - menghentikan seluruh audio ketika user menutup modal
 */
export class LiveAudioPlayer {
  private audioContext: AudioContext;

  private nextPlayTime = 0;

  private activeSourceNodes: AudioBufferSourceNode[] =
    [];

  private isClosed = false;

  constructor(
    sampleRate: number = 24000
  ) {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext:
            typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error(
        'Browser tidak mendukung Web Audio API.'
      );
    }

    this.audioContext =
      new AudioContextClass({
        sampleRate,
      });
  }

  // ====================================================
  // RESUME AUDIO CONTEXT
  // ====================================================

  public async resume(): Promise<void> {
    if (this.isClosed) {
      return;
    }

    if (
      this.audioContext.state ===
      'suspended'
    ) {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error(
          'Gagal menjalankan AudioContext:',
          error
        );
      }
    }
  }

  // ====================================================
  // PLAY AUDIO CHUNK
  // ====================================================

  public async playChunk(
    base64Pcm: string
  ): Promise<void> {
    if (
      this.isClosed ||
      !base64Pcm
    ) {
      return;
    }

    try {
      // Pastikan AudioContext aktif
      await this.resume();

      if (this.isClosed) {
        return;
      }

      const audioBuffer =
        pcmBase64ToAudioBuffer(
          base64Pcm,
          this.audioContext,
          24000
        );

      const source =
        this.audioContext.createBufferSource();

      source.buffer =
        audioBuffer;

      source.connect(
        this.audioContext.destination
      );

      // ------------------------------------------------
      // QUEUE AUDIO
      // ------------------------------------------------

      const currentTime =
        this.audioContext.currentTime;

      const startTime =
        Math.max(
          currentTime,
          this.nextPlayTime
        );

      source.start(
        startTime
      );

      this.nextPlayTime =
        startTime +
        audioBuffer.duration;

      this.activeSourceNodes.push(
        source
      );

      // ------------------------------------------------
      // CLEANUP SETELAH SELESAI
      // ------------------------------------------------

      source.onended = () => {
        const index =
          this.activeSourceNodes.indexOf(
            source
          );

        if (index !== -1) {
          this.activeSourceNodes.splice(
            index,
            1
          );
        }

        try {
          source.disconnect();
        } catch {
          // Ignore
        }
      };
    } catch (error) {
      console.error(
        'Error playing Gemini audio chunk:',
        error
      );
    }
  }

  // ====================================================
  // STOP ALL AUDIO
  // ====================================================

  public stopAll(): void {
    for (
      const source of [
        ...this.activeSourceNodes,
      ]
    ) {
      try {
        source.onended = null;
        source.stop();
      } catch {
        // Audio source mungkin sudah selesai.
      }

      try {
        source.disconnect();
      } catch {
        // Ignore
      }
    }

    this.activeSourceNodes = [];

    this.nextPlayTime = 0;
  }

  // ====================================================
  // CLOSE AUDIO PLAYER
  // ====================================================

  public close(): void {
    if (this.isClosed) {
      return;
    }

    this.isClosed = true;

    this.stopAll();

    try {
      if (
        this.audioContext.state !==
        'closed'
      ) {
        void this.audioContext.close();
      }
    } catch {
      // Ignore
    }
  }
}