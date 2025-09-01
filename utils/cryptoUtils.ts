// Web Crypto API utilities for encrypting/decrypting API keys
// Used for securely sharing API keys in URLs

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM

/**
 * 生成一個密碼派生的密鑰
 * @param password 用於派生密鑰的密碼
 * @param salt 鹽值，用於增強安全性
 * @returns CryptoKey
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密 API Key
 * @param apiKey 要加密的 API Key
 * @param password 用於加密的密碼（可以是固定的應用密碼）
 * @returns 包含加密數據和必要參數的對象
 */
export async function encryptApiKey(apiKey: string, password: string = 'ai-page-gen-2024'): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    
    // 生成隨機鹽值和IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // 派生密鑰
    const key = await deriveKey(password, salt);
    
    // 加密數據
    const encryptedData = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv },
      key,
      data
    );
    
    // 組合所有數據：salt + iv + encryptedData
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    // 轉換為 Base64 URL-safe 字符串
    return arrayBufferToBase64Url(combined);
  } catch (error) {
    console.error('加密 API Key 失敗:', error);
    throw new Error('加密失敗');
  }
}

/**
 * 解密 API Key
 * @param encryptedData Base64 編碼的加密數據
 * @param password 用於解密的密碼
 * @returns 解密後的 API Key
 */
export async function decryptApiKey(encryptedData: string, password: string = 'ai-page-gen-2024'): Promise<string> {
  try {
    // 從 Base64 URL-safe 字符串轉換回 ArrayBuffer
    const combined = base64UrlToArrayBuffer(encryptedData);
    
    // 提取各個部分
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 16 + IV_LENGTH);
    const encrypted = combined.slice(16 + IV_LENGTH);
    
    // 派生密鑰
    const key = await deriveKey(password, salt);
    
    // 解密數據
    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      encrypted
    );
    
    // 轉換回字符串
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('解密 API Key 失敗:', error);
    throw new Error('解密失敗或數據已損壞');
  }
}

/**
 * ArrayBuffer 轉 Base64 URL-safe 字符串
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL-safe 字符串轉 ArrayBuffer
 */
function base64UrlToArrayBuffer(base64Url: string): Uint8Array {
  // 補全 padding
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  const base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/') + padding;
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * 檢查瀏覽器是否支援 Web Crypto API
 */
export function isWebCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.encrypt === 'function';
}

/**
 * 為 URL 生成加密的 API Key 參數
 * @param apiKey API Key
 * @returns URL 參數字符串
 */
export async function generateEncryptedApiKeyParam(apiKey: string): Promise<string> {
  if (!isWebCryptoSupported()) {
    console.warn('Web Crypto API 不支援，將使用明文傳輸（不建議）');
    return `apikey=${encodeURIComponent(apiKey)}`;
  }
  
  const encrypted = await encryptApiKey(apiKey);
  return `enckey=${encodeURIComponent(encrypted)}`;
}

/**
 * 從 URL 參數中提取並解密 API Key
 * @param urlParams URLSearchParams 對象
 * @returns API Key 或 null
 */
export async function extractApiKeyFromParams(urlParams: URLSearchParams): Promise<string | null> {
  // 優先檢查加密的 API Key
  const encryptedKey = urlParams.get('enckey');
  if (encryptedKey && isWebCryptoSupported()) {
    try {
      return await decryptApiKey(decodeURIComponent(encryptedKey));
    } catch (error) {
      console.error('解密 API Key 失敗，嘗試使用明文參數:', error);
    }
  }
  
  // 回退到明文 API Key（向後兼容）
  const plainKey = urlParams.get('apikey');
  return plainKey ? decodeURIComponent(plainKey) : null;
}