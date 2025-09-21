// 加密服務 - 用於加密分享的 Provider 配置
export class EncryptionService {

  // 使用 Web Crypto API 進行 AES-GCM 加密
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      // 生成隨機鹽值
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // 從密碼派生加密金鑰
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // 生成隨機初始向量
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // 加密數據
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        new TextEncoder().encode(data)
      );

      // 組合所有數據：鹽值 + IV + 加密數據
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // 轉換為 Base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('加密失敗:', error);
      throw new Error('加密數據失敗');
    }
  }

  // 解密數據
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // 從 Base64 解碼
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // 提取鹽值、IV 和加密數據
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);

      // 從密碼派生加密金鑰
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // 解密數據
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('解密失敗:', error);
      throw new Error('解密數據失敗 - 請檢查密碼是否正確');
    }
  }

  // 生成隨機密碼建議
  static generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 驗證密碼強度
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('密碼長度至少需要 8 個字符');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('需要包含小寫字母');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('需要包含大寫字母');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('需要包含數字');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('建議包含特殊字符');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 3,
      score,
      feedback
    };
  }
}

// 加密的 Provider 配置格式
export interface EncryptedProviderShare {
  id: string;
  name: string;
  description?: string;
  encryptedData: string; // 加密的 provider 配置數據
  metadata: {
    version: string;
    createdAt: string;
    providerTypes: string[]; // 包含的 provider 類型，用於顯示
    providerCount: number;   // provider 數量
    hasEncryption: boolean;  // 標記為加密分享
  };
}

// 分享的原始數據格式（加密前）
export interface ProviderShareData {
  providers: Array<{
    type: string;
    name: string;
    model: string;
    apiKey: string;
    settings: any;
    description?: string;
  }>;
  sharedBy?: string;
  sharedAt: string;
}