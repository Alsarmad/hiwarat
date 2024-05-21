import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(process.cwd()); // project root directory (./)

/**
 * @class TranslationManager
 * @classdesc فئة لإدارة الترجمات في التطبيق
 */
class TranslationManager {
    /**
     * @constructor
     * @param {string} defaultLang - اللغة الافتراضية
     */
    constructor(defaultLang = 'en') {
        this.defaultLang = defaultLang;
        this.translationsDir = path.join(root, 'src', './translations');
        this.translations = {};
        this.loadAllTranslations();
    }

    /**
     * تحميل جميع الترجمات من ملفات JSON في المجلد
     */
    async loadAllTranslations() {
        try {
            const files = await fs.promises.readdir(this.translationsDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            for (const file of jsonFiles) {
                const lang = path.basename(file, '.json');
                await this.loadTranslations(lang);
            }
        } catch (error) {
            console.error(`Error loading translation files: ${error.message}`);
        }
    }

    /**
     * تحميل الترجمات من ملف JSON
     * @param {string} lang - كود اللغة
     * @returns {Promise<void>}
     */
    async loadTranslations(lang) {
        try {
            const filePath = path.join(this.translationsDir, `${lang}.json`);
            const data = await fs.promises.readFile(filePath, 'utf-8');
            this.translations[lang] = JSON.parse(data);
        } catch (error) {
            throw new Error(`فشل في تحميل ملف الترجمة للغة: ${lang}`);
        }
    }

    /**
     * الحصول على النص المترجم مع استبدال المتغيرات
     * @param {string} key - مفتاح النص
     * @param {Object} [variables={}] - المتغيرات المراد استبدالها في النص
     * @param {string} [lang=this.defaultLang] - كود اللغة
     * @returns {string} النص المترجم مع المتغيرات المستبدلة
     */
    translate(key, variables = {}, lang = this.defaultLang) {
        const translation = this.translations[lang] || {};
        let text = translation[key] || key;

        for (const [varKey, varValue] of Object.entries(variables)) {
            text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), varValue);
        }

        return text;
    }

    /**
     * تغيير اللغة الافتراضية
     * @param {string} lang - كود اللغة الجديدة
     */
    setDefaultLanguage(lang) {
        this.defaultLang = lang;
    }
}

export default TranslationManager;
