import Database from 'better-sqlite3';

/**
 * @classdesc كائن يدير عمليات قاعدة البيانات SQLite.
 */
export default class DatabaseManager {
    /**
     * @constructor
     * @param {string} dbFilePath مسار ملف قاعدة البيانات SQLite.
     */
    constructor(dbFilePath) {
        this.dbFilePath = dbFilePath;
        this.db = null;
        this.DataTypes = {
            INTEGER: 'INTEGER', // يُستخدم لتخزين الأعداد الصحيحة. | 71
            REAL: 'REAL', // يُستخدم لتخزين الأعداد العشرية (مثل الأرقام العائمة). | 50000.00
            TEXT: 'TEXT', // يُستخدم لتخزين النصوص. | "ryan"
            BLOB: 'BLOB', // يُستخدم لتخزين البيانات الثنائية (مثل الصور أو الملفات).
            BOOLEAN: 'INTEGER', // يُستخدم لتخزين القيم البولية (true/false)، على الرغم من أن SQLite لا يدعم هذا النوع مباشرة، لكن يمكن استخدامه كنص (INTEGER) وتفسير القيم كـ true أو false.
        };

    }

    /**
     * @description فتح قاعدة البيانات أو إنشاؤها إذا لم تكن موجودة.
     */
    openDatabase() {
        try {
            this.db = new Database(this.dbFilePath);
            console.log(`تم فتح قاعدة البيانات: ${this.dbFilePath}`);
        } catch (error) {
            console.error(`حدث خطأ أثناء فتح قاعدة البيانات ${this.dbFilePath}:`, error);
            throw error; // يمكنك رمي الخطأ للأعلى ليتم التعامل معه في الشيفرة المستدعية
        }
    }

    /**
     * @description إغلاق قاعدة البيانات.
     */
    closeDatabase() {
        if (this.db) {
            this.db.close();
            console.log('تم إغلاق قاعدة البيانات.');
        }
    }

    /**
     * @description إنشاء جدول في قاعدة البيانات.
     * @param {string} tableName اسم الجدول الذي سيتم إنشاؤه.
     * @param {object} columns تعريف الأعمدة في الجدول.
     */
    createTable(tableName, columns) {
        try {
            if (this.tableExists(tableName)) {
                console.error(`الجدول ${tableName} موجود بالفعل.`);
                return;
            }

            const columnDefinitions = Object.entries(columns).map(([name, type]) => `${name} ${type}`).join(', ');
            this.db.exec(`CREATE TABLE ${tableName} (${columnDefinitions})`);
            console.log(`تم إنشاء جدول ${tableName}.`);
        } catch (error) {
            console.error(`حدث خطأ أثناء إنشاء جدول ${tableName}:`, error);
            throw error; // يمكنك رمي الخطأ للأعلى ليتم التعامل معه في الشيفرة المستدعية
        }
    }

    /**
     * @description إضافة سجل إلى جدول معين.
     * @param {string} tableName اسم الجدول.
     * @param {object} data بيانات السجل التي سيتم إضافتها.
     * @returns {number|null} معرف السجل الجديد أو null في حالة فشل الإضافة.
     */
    insertRecord(tableName, data) {
        try {
            const existingRecord = this.db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(data.id);
            if (existingRecord) {
                console.error(`السجل بالمعرف ${data.id} موجود بالفعل في الجدول ${tableName}.`);
                return null;
            }

            const columns = Object.keys(data).join(', ');
            const values = Object.values(data).map(value => `'${value}'`).join(', ');
            const result = this.db.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${values})`).run();
            console.log(`تمت إضافة سجل جديد إلى جدول ${tableName}.`);
            return result.lastInsertRowid;
        } catch (error) {
            console.error(`حدث خطأ أثناء إضافة سجل إلى جدول ${tableName}:`, error);
            throw error; // يمكنك رمي الخطأ للأعلى ليتم التعامل معه في الشيفرة المستدعية
        }
    }

    /**
     * @description يحدد ما إذا كان الجدول موجودًا في قاعدة البيانات.
     * @param {string} tableName اسم الجدول.
     * @returns {boolean} true إذا كان الجدول موجودًا، وإلا فهو يعود بقيمة false.
     */
    tableExists(tableName) {
        const exists = this.db.prepare(`SELECT EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?)`).get(tableName);
        return !!exists['EXISTS (SELECT 1 FROM sqlite_master WHERE type = \'table\' AND name = ?)'];
    }

    /**
     * @description يسترجع أسماء الأعمدة في جدول معين.
     * @param {string} tableName اسم الجدول.
     * @returns {Array} مصفوفة تحتوي على أسماء الأعمدة في الجدول.
     */
    getColumnNames(tableName) {
        const tableInfo = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
        return tableInfo.map(column => column.name);
    }

    /**
     * @description استعراض كل السجلات في جدول معين.
     * @param {string} tableName اسم الجدول.
     * @returns {array} مصفوفة تحتوي على كل السجلات في الجدول، أو مصفوفة فارغة إذا لم يتم العثور على سجلات.
     */
    browseTable(tableName) {
        try {
            const records = this.db.prepare(`SELECT * FROM ${tableName}`).all();
            console.log(`السجلات في جدول ${tableName}:`, records);
            return records;
        } catch (error) {
            console.error(`حدث خطأ أثناء استعراض الجدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description البحث عن سجل باستخدام قيمة في عمود معين.
     * @param {string} tableName اسم الجدول.
     * @param {string} column اسم العمود الذي تريد البحث فيه.
     * @param {any} value القيمة التي تريد البحث عنها.
     * @returns {object|null} سجل معين إذا وُجد، وإلا فإنه يعيد قيمة null.
     */
    findRecord(tableName, column, value) {
        try {
            // التحقق من وجود الجدول
            const tableExists = this.tableExists(tableName);
            if (!tableExists) {
                console.log(`الجدول ${tableName} غير موجود.`);
                return null;
            }

            // التحقق من وجود العمود
            const columns = this.getColumnNames(tableName);
            if (!columns.includes(column)) {
                console.log(`العمود ${column} غير موجود في جدول ${tableName}.`);
                return null;
            }

            const record = this.db.prepare(`SELECT * FROM ${tableName} WHERE ${column} = ?`).get(value);
            if (record) {
                console.log(`السجل حيث ${column} يساوي ${value} في جدول ${tableName}:`, record);
                return record;
            } else {
                console.log(`لا يوجد سجل حيث ${column} يساوي ${value} في جدول ${tableName}.`);
                return null;
            }
        } catch (error) {
            console.error(`حدث خطأ أثناء البحث عن سجل حيث ${column} يساوي ${value} في جدول ${tableName}:`, error);
            throw error;
        }
    }

}