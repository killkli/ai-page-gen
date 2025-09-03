// 互動教材版本管理服務

export interface TransformedVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModifiedAt: string;
  transformedData: { [stepId: string]: any };
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
    transformedData: { [stepId: string]: any },
    selectedSteps: string[],
    versionName?: string,
    description?: string
  ): Promise<string> {
    const db = this.ensureDB();
    const versionId = `version_${Date.now()}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['interactiveContent'], 'readwrite');
      const store = transaction.objectStore('interactiveContent');

      // 先嘗試獲取現有記錄
      const getRequest = store.get(lessonPlanId);
      
      getRequest.onsuccess = () => {
        const existingRecord: InteractiveContentRecord | undefined = getRequest.result;
        
        const newVersion: TransformedVersion = {
          id: versionId,
          name: versionName || `版本 ${now.slice(0, 19).replace('T', ' ')}`,
          description: description,
          createdAt: now,
          lastModifiedAt: now,
          transformedData: transformedData,
          selectedSteps: selectedSteps
        };

        const record: InteractiveContentRecord = {
          lessonPlanId: lessonPlanId,
          topic: topic,
          versions: existingRecord ? [...existingRecord.versions, newVersion] : [newVersion],
          lastAccessedAt: now
        };

        const putRequest = store.put(record);
        
        putRequest.onsuccess = () => {
          resolve(versionId);
        };
        
        putRequest.onerror = () => {
          reject(new Error('Failed to save interactive content version'));
        };
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get existing interactive content'));
      };
    });
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