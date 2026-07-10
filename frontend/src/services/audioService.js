export async function getMicStream() {
  try {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
    return null;
  } catch (error) {
    console.error('Mikrofon akışı alınamadı:', error);
    return null;
  }
}

export function stopMicStream(stream) {
  try {
    stream?.getTracks?.().forEach((track) => track.stop());
  } catch (error) {
    console.error('Mikrofon durdurulamadı:', error);
  }
}
