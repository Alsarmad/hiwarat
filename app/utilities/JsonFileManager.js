import fs from 'fs-extra';
import path from 'path';

/**
 * @classdesc كائن يدير عمليات القراءة والكتابة لملفات JSON.
 */
export default class JsonFileManager {
    /**
     * كائن يدير عمليات القراءة والكتابة لملفات JSON.
     * @constructor
     * @param {string} filePath مسار ملف ال JSON الذي يتعامل معه الكائن.
     */
    constructor(filePath) {
        this.filePath = filePath;
    }

    /**
     * @description قراءة بيانات الملف JSON.
     * @returns {object|null} بيانات الملف JSON كـ object، أو null في حالة وجود خطأ.
     */
    readJson() {
        try {
            const jsonData = fs.readJsonSync(this.filePath);
            return jsonData;
        } catch (error) {
            console.error(`حدث خطأ أثناء قراءة ${this.filePath}:`, error);
            return null;
        }
    }

    /**
     * @description كتابة بيانات إلى ملف JSON.
     * @param {object} jsonData بيانات JSON التي سيتم كتابتها.
     */
    writeJson(jsonData) {
        try {
            fs.writeJsonSync(this.filePath, jsonData, { spaces: 2 });
            console.log(`${this.filePath} تم تحديث.`);
        } catch (error) {
            console.error(`حدث خطأ أثناء كتابة ${this.filePath}:`, error);
        }
    }
}


/*

// مثال على الاستخدام:
const serverConfigManager = new JsonFileManager('/path/to/serverConfig.json');
const emailConfigManager = new JsonFileManager('/path/to/emailConfig.json');

// قراءة تكوين الخادم:
const serverConfig = serverConfigManager.readJson();
if (serverConfig) {
    console.log('تكوين الخادم:', serverConfig);
}

// لتحديث تكوين البريد الإلكتروني:
const newEmailConfig = {  بيانات تكوين البريد الجديدة  };
emailConfigManager.writeJson(newEmailConfig);

*/