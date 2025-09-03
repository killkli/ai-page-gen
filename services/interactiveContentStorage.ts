// 互動教材版本管理服務

export interface TransformedVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModifiedAt: string;
  transformedData: { [stepId: string]: any } | {
    transformedData: { [stepId: string]: any };
    quizData?: { [stepId: string]: any };
  };
  selectedSteps: string[];
  publishedUrl?: string;
}

export interface InteractiveContentRecord {
  lessonPlanId: string;
  topic: string;
  versions: TransformedVersion[];
  lastAccessedAt: string;
}

class InteractiveContentStorage {
  private dbName = 'InteractiveContentDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        reject(new Error('Failed to open InteractiveContent database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 創建互動內容版本存儲
        if (!db.objectStoreNames.contains('interactiveContent')) {
          const store = db.createObjectStore('interactiveContent', { keyPath: 'lessonPlanId' });
          store.createIndex('topic', 'topic', { unique: false });
          store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // 保存新版本
  async saveVersion(
    lessonPlanId: string,
    topic: string,
    transformedData: { [stepId: string]: any } | {
      transformedData: { [stepId: string]: any };
      quizData?: { [stepId: string]: any };
    },
    selectedSteps: string[],
    versionName?: string,
    description?: string
  ): Promise<string> {
    console.log('=== interactiveContentStorage.saveVersion 開始 ===');
    console.log('參數:', { lessonPlanId, topic, transformedData, selectedSteps, versionName, description });
    
    try {
      const db = this.ensureDB();
      console.log('✅ 獲取資料庫連接成功');
      
      const versionId = `version_${Date.now()}`;
      const now = new Date().toISOString();
      console.log('生成版本ID:', versionId);

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['interactiveContent'], 'readwrite');
        const store = transaction.objectStore('interactiveContent');
        console.log('✅ 開始資料庫事務');

        // 先嘗試獲取現有記錄
        const getRequest = store.get(lessonPlanId);
        console.log('查詢現有記錄:', lessonPlanId);
        
        getRequest.onsuccess = () => {
          console.log('✅ 查詢現有記錄成功');
          const existingRecord: InteractiveContentRecord | undefined = getRequest.result;
          console.log('現有記錄:', existingRecord ? `存在，包含 ${existingRecord.versions.length} 個版本` : '不存在');
          
          const newVersion: TransformedVersion = {
            id: versionId,
            name: versionName || `版本 ${now.slice(0, 19).replace('T', ' ')}`,
            description: description,
            createdAt: now,
            lastModifiedAt: now,
            transformedData: transformedData,
            selectedSteps: selectedSteps
          };
          console.log('新版本物件:', newVersion);

          const record: InteractiveContentRecord = {
            lessonPlanId: lessonPlanId,
            topic: topic,
            versions: existingRecord ? [...existingRecord.versions, newVersion] : [newVersion],
            lastAccessedAt: now
          };
          console.log('準備保存記錄:', record);

          const putRequest = store.put(record);
          
          putRequest.onsuccess = () => {
            console.log('✅ 版本保存成功');
            resolve(versionId);
          };
          
          putRequest.onerror = (event) => {
            console.error('❌ 保存版本失敗:', event);
            console.error('putRequest.error:', putRequest.error);
            reject(new Error(`Failed to save interactive content version: ${putRequest.error?.message || 'Unknown error'}`));
          };
        };

        getRequest.onerror = (event) => {
          console.error('❌ 查詢現有記錄失敗:', event);
          console.error('getRequest.error:', getRequest.error);
          reject(new Error(`Failed to get existing interactive content: ${getRequest.error?.message || 'Unknown error'}`));
        };

        transaction.onerror = (event) => {
          console.error('❌ 資料庫事務失敗:', event);
          reject(new Error(`Database transaction failed: ${transaction.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      console.error('❌ interactiveContentStorage.saveVersion 異常:', error);
      throw error;
    }
  }

  // 獲取教案的所有版本
  async getVersions(lessonPlanId: string): Promise<TransformedVersion[]> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['interactiveContent'], 'readonly');
      const store = transaction.objectStore('interactiveContent');
      const request = store.get(lessonPlanId);
      
      request.onsuccess = () => {
        const record: InteractiveContentRecord | undefined = request.result;
        resolve(record ? record.versions : []);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get interactive content versions'));
      };
    });
  }

  // 獲取特定版本
  async getVersion(lessonPlanId: string, versionId: string): Promise<TransformedVersion | null> {
    const versions = await this.getVersions(lessonPlanId);
    return versions.find(v => v.id === versionId) || null;
  }

  // 更新版本（如添加發布URL）
  async updateVersion(
    lessonPlanId: string, 
    versionId: string, 
    updates: Partial<TransformedVersion>
  ): Promise<void> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['interactiveContent'], 'readwrite');
      const store = transaction.objectStore('interactiveContent');
      const getRequest = store.get(lessonPlanId);
      
      getRequest.onsuccess = () => {
        const record: InteractiveContentRecord | undefined = getRequest.result;
        
        if (!record) {
          reject(new Error('Interactive content record not found'));
          return;
        }

        const versionIndex = record.versions.findIndex(v => v.id === versionId);
        if (versionIndex === -1) {
          reject(new Error('Version not found'));
          return;
        }

        record.versions[versionIndex] = {
          ...record.versions[versionIndex],
          ...updates,
          lastModifiedAt: new Date().toISOString()
        };

        const putRequest = store.put(record);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update version'));
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get interactive content'));
      };
    });
  }

  // 刪除版本
  async deleteVersion(lessonPlanId: string, versionId: string): Promise<void> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['interactiveContent'], 'readwrite');
      const store = transaction.objectStore('interactiveContent');
      const getRequest = store.get(lessonPlanId);
      
      getRequest.onsuccess = () => {
        const record: InteractiveContentRecord | undefined = getRequest.result;
        
        if (!record) {
          reject(new Error('Interactive content record not found'));
          return;
        }

        record.versions = record.versions.filter(v => v.id !== versionId);
        
        if (record.versions.length === 0) {
          // 如果沒有版本了，刪除整個記錄
          const deleteRequest = store.delete(lessonPlanId);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(new Error('Failed to delete record'));
        } else {
          // 更新記錄
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to update record'));
        }
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get interactive content'));
      };
    });
  }

  // 獲取所有有版本的教案記錄
  async getAllRecords(): Promise<InteractiveContentRecord[]> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['interactiveContent'], 'readonly');
      const store = transaction.objectStore('interactiveContent');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get all interactive content records'));
      };
    });
  }

  // 更新最後訪問時間
  async updateLastAccessed(lessonPlanId: string): Promise<void> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['interactiveContent'], 'readwrite');
      const store = transaction.objectStore('interactiveContent');
      const getRequest = store.get(lessonPlanId);
      
      getRequest.onsuccess = () => {
        const record: InteractiveContentRecord | undefined = getRequest.result;
        
        if (record) {
          record.lastAccessedAt = new Date().toISOString();
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to update last accessed time'));
        } else {
          resolve(); // 記錄不存在時不做任何事
        }
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get interactive content'));
      };
    });
  }
}

export const interactiveContentStorage = new InteractiveContentStorage();