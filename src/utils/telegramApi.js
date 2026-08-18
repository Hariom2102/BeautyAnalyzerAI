/**
 * Telegram Bot API Photo Exporter Utility
 */

export async function uploadToTelegram({ botToken, chatId, imageDataUrl, caption }, onProgress) {
  if (!botToken || !chatId) {
    throw new Error('Telegram Bot Token and Chat ID must be configured in Settings first.');
  }

  if (onProgress) onProgress('Preparing image...');

  // Convert Base64 Data URL to Blob
  const res = await fetch(imageDataUrl);
  const blob = await res.blob();

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', blob, 'beauty_analyzer_photo.jpg');
  formData.append('caption', caption || '✨ Beauty Analyzer AI Report');

  if (onProgress) onProgress('Sending photo to Telegram Bot...');

  const endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'Telegram upload failed. Check Bot Token and Chat ID.');
  }

  return data.result;
}
