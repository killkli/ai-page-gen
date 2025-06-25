const JSONBIN_API = 'https://api.jsonbin.io/v3/b';
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_API_KEY; // 請在 .env 設定 VITE_JSONBIN_API_KEY

export async function saveLearningContent(content: any): Promise<string> {
  const response = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
      'X-Bin-Private': 'false', // 公開 bin 方便分享
    },
    body: JSON.stringify(content),
  });
  const result = await response.json();
  if (!result || !result.metadata || !result.metadata.id) {
    throw new Error('無法取得 jsonbin id');
  }
  return result.metadata.id; // binId
}

export async function getLearningContent(binId: string): Promise<any> {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    // 公開 bin 可不帶 X-Master-Key
    // headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const result = await response.json();
  if (!result || !result.record) {
    throw new Error('找不到對應的教學方案');
  }
  return result.record;
} 