// IndexedDB 服務用於本地存儲教案
export interface StoredLessonPlan {
  id: string; // 唯一標識符
  topic: string; // 教學主題
  createdAt: string; // 創建時間
  lastAccessedAt: string; // 最後訪問時間
  content: {
    learningObjectives?: any;
    contentBreakdown?: any;
    confusionPoints?: any;
    classroomActivities?: any;
    quiz?: any;
    writingPractice?: any;
  };
  metadata?: {
    totalSections?: number;
    hasQuiz?: boolean;
    hasWriting?: boolean;
  };
}

class LessonPlanStorage {
  private dbName = 'AILearningPageGenerator';
  private version = 1;
  private storeName = 'lessonPlans';
  private db: IDBDatabase | null = null;

  // 初始化 IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 如果 store 不存在則創建
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // 創建索引
          store.createIndex('topic', 'topic', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
        }
      };
    });
  }

  // 確保數據庫已初始化
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // 保存教案
  async saveLessonPlan(lessonPlan: StoredLessonPlan): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put(lessonPlan);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save lesson plan'));
    });
  }

  // 獲取所有教案（按最後訪問時間排序）
  async getAllLessonPlans(): Promise<StoredLessonPlan[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('lastAccessedAt');
      
      const request = index.openCursor(null, 'prev'); // 最新的在前面
      const results: StoredLessonPlan[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(new Error('Failed to get lesson plans'));
    });
  }

  // 根據 ID 獲取教案
  async getLessonPlan(id: string): Promise<StoredLessonPlan | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result || null);
      };
      
      request.onerror = () => reject(new Error('Failed to get lesson plan'));
    });
  }

  // 更新教案的最後訪問時間
  async updateLastAccessed(id: string): Promise<void> {
    const lessonPlan = await this.getLessonPlan(id);
    if (lessonPlan) {
      lessonPlan.lastAccessedAt = new Date().toISOString();
      await this.saveLessonPlan(lessonPlan);
    }
  }

  // 刪除教案
  async deleteLessonPlan(id: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete lesson plan'));
    });
  }

  // 搜索教案
  async searchLessonPlans(query: string): Promise<StoredLessonPlan[]> {
    const allPlans = await this.getAllLessonPlans();
    const lowerQuery = query.toLowerCase();
    
    return allPlans.filter(plan => 
      plan.topic.toLowerCase().includes(lowerQuery)
    );
  }

  // 清理舊教案（保留最近的 N 個）
  async cleanupOldLessonPlans(keepCount = 50): Promise<void> {
    const allPlans = await this.getAllLessonPlans();
    
    if (allPlans.length > keepCount) {
      const toDelete = allPlans.slice(keepCount);
      
      for (const plan of toDelete) {
        await this.deleteLessonPlan(plan.id);
      }
    }
  }

  // 獲取存儲統計信息
  async getStorageStats(): Promise<{
    totalCount: number;
    totalSizeEstimate: number;
    oldestPlan?: string;
    newestPlan?: string;
  }> {
    const allPlans = await this.getAllLessonPlans();
    
    return {
      totalCount: allPlans.length,
      totalSizeEstimate: JSON.stringify(allPlans).length,
      oldestPlan: allPlans[allPlans.length - 1]?.topic,
      newestPlan: allPlans[0]?.topic
    };
  }
}

// 創建單例實例
export const lessonPlanStorage = new LessonPlanStorage();

// 輔助函數：生成教案 ID
export const generateLessonPlanId = (topic: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `lesson_${timestamp}_${randomSuffix}`;
};

// 輔助函數：從完整內容創建存儲格式
export const createStoredLessonPlan = (
  topic: string,
  content: any
): StoredLessonPlan => {
  const now = new Date().toISOString();
  
  return {
    id: generateLessonPlanId(topic),
    topic,
    createdAt: now,
    lastAccessedAt: now,
    content,
    metadata: {
      totalSections: [
        content.learningObjectives,
        content.contentBreakdown,
        content.confusionPoints,
        content.classroomActivities,
        content.quiz,
        content.writingPractice
      ].filter(Boolean).length,
      hasQuiz: !!content.quiz,
      hasWriting: !!content.writingPractice
    }
  };
};