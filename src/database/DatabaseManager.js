import Database from 'better-sqlite3';
import { logError, logInfo } from "./../utils/logger.js";

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
            logInfo(`تم فتح قاعدة البيانات: ${this.dbFilePath}`);
        } catch (error) {
            logError(`حدث خطأ أثناء فتح قاعدة البيانات ${this.dbFilePath}:`, error);
            throw error; // يمكنك رمي الخطأ للأعلى ليتم التعامل معه في الشيفرة المستدعية
        }
    }

    /**
     * @description إغلاق قاعدة البيانات.
     */
    closeDatabase() {
        if (this.db) {
            this.db.close();
            // console.log('تم إغلاق قاعدة البيانات.');
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
                logError(`الجدول ${tableName} موجود بالفعل.`);
                return;
            }

            const columnDefinitions = Object.entries(columns).map(([name, type]) => `${name} ${type}`).join(', ');
            this.db.exec(`CREATE TABLE ${tableName} (${columnDefinitions})`);
            logInfo(`تم إنشاء جدول ${tableName}.`);
        } catch (error) {
            logError(`حدث خطأ أثناء إنشاء جدول ${tableName}:`, error);
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
            // const existingRecord = this.db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(data.id);
            // if (existingRecord) {
            //     logError(`السجل بالمعرف ${data.id} موجود بالفعل في الجدول ${tableName}.`);
            //     return null;
            // }

            const columns = Object.keys(data).join(', ');
            const values = Object.values(data).map(value => `'${value}'`).join(', ');
            const result = this.db.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${values})`).run();
            logInfo(`تمت إضافة سجل جديد إلى جدول ${tableName}.`);
            return result.lastInsertRowid;
        } catch (error) {
            logError(`حدث خطأ أثناء إضافة سجل إلى جدول ${tableName}:`, error);
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
     * @description تحديث بيانات سجل في جدول معين.
     * @param {string} tableName اسم الجدول.
     * @param {string} primaryKey اسم العمود الرئيسي الذي يحدد السجل المراد تحديثه.
     * @param {any} primaryKeyValue قيمة العمود الرئيسي للسجل المراد تحديثه.
     * @param {object} newData البيانات الجديدة التي تريد تحديث السجل بها.
     * 
     * @example
     * dbManager.updateRecord("users", "id", "1", { columnName: "newData" });
     */
    updateRecord(tableName, primaryKey, primaryKeyValue, newData) {
        try {

            // التحقق من أن newData غير فارغة
            if (!newData || Object.keys(newData).length === 0) {
                logError(`لا يمكن تحديث السجل في الجدول ${tableName}، حيث أن البيانات الجديدة غير محددة أو فارغة. يُرجى تقديم بيانات جديدة صالحة في شكل كائن.`);
                return false;
            }

            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return;
            }

            // التحقق من وجود العمود الرئيسي
            const columns = this.getColumnNames(tableName);
            if (!columns.includes(primaryKey)) {
                logError(`العمود الرئيسي ${primaryKey} غير موجود في جدول ${tableName}.`);
                return;
            }

            const setValues = Object.entries(newData).map(([key, value]) => `${key} = '${value}'`).join(', ');
            const statement = this.db.prepare(`UPDATE ${tableName} SET ${setValues} WHERE ${primaryKey} = ?`);
            statement.run(primaryKeyValue);
        } catch (error) {
            logError(`حدث خطأ أثناء تحديث السجل في جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * يقوم بحذف سجل من جدول في قاعدة البيانات.
     * @param {string} tableName اسم الجدول الذي يجب حذف السجل منه.
     * @param {string} primaryKey اسم العمود الرئيسي في الجدول.
     * @param {any} primaryKeyValue قيمة العمود الرئيسي للسجل الذي يجب حذفه.
     * @returns {void}
     * @throws {Error} إذا حدث خطأ أثناء عملية الحذف.
     * @example
     * dbManager.deleteRecord('users', 'id', 1);
     */
    deleteRecord(tableName, primaryKey, primaryKeyValue) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return;
            }

            // التحقق من وجود العمود الرئيسي
            const columns = this.getColumnNames(tableName);
            if (!columns.includes(primaryKey)) {
                logError(`العمود الرئيسي ${primaryKey} غير موجود في جدول ${tableName}.`);
                return;
            }

            const statement = this.db.prepare(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`);
            statement.run(primaryKeyValue);
        } catch (error) {
            logError(`حدث خطأ أثناء حذف السجل من جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description إضافة عمود جديد إلى جدول معين.
     * @param {string} tableName اسم الجدول الذي يجب إضافة العمود إليه.
     * @param {string} columnName اسم العمود الجديد.
     * @param {string} columnType نوع البيانات الذي يتم تخزينه في العمود الجديد.
     * 
     * @example
     * dbManager.addNewColumn('your_table_name', 'new_column', dbManager.DataTypes.INTEGER);
     */
    addNewColumn(tableName, columnName, columnType) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return;
            }

            // التحقق من عدم وجود العمود بالفعل
            const columns = this.getColumnNames(tableName);
            if (columns.includes(columnName)) {
                logError(`العمود ${columnName} موجود بالفعل في جدول ${tableName}.`);
                return;
            }

            // إنشاء العمود الجديد
            this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
            logInfo(`تمت إضافة العمود ${columnName} إلى جدول ${tableName}.`);
        } catch (error) {
            logError(`حدث خطأ أثناء إضافة العمود ${columnName} إلى جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description حذف عمود من جدول معين.
     * @param {string} tableName اسم الجدول الذي يحتوي على العمود الذي يجب حذفه.
     * @param {string} columnName اسم العمود الذي يجب حذفه.
     * 
     * @example
     * dbManager.deleteColumn('your_table_name', 'column_to_delete');
     */
    deleteColumn(tableName, columnName) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return;
            }

            // التحقق من وجود العمود
            const columns = this.getColumnNames(tableName);
            if (!columns.includes(columnName)) {
                logError(`العمود ${columnName} غير موجود في جدول ${tableName}.`);
                return;
            }

            // حذف العمود
            this.db.exec(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
            logInfo(`تم حذف العمود ${columnName} من جدول ${tableName}.`);
        } catch (error) {
            console.error(`حدث خطأ أثناء حذف العمود ${columnName} من جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description حذف جدول من قاعدة البيانات.
     * @param {string} tableName اسم الجدول الذي يجب حذفه.
     * 
     * @example
     * dbManager.deleteTable('your_table_name');
     */
    deleteTable(tableName) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return;
            }

            // حذف الجدول
            this.db.exec(`DROP TABLE ${tableName}`);
            logInfo(`تم حذف الجدول ${tableName} من قاعدة البيانات.`);
        } catch (error) {
            logError(`حدث خطأ أثناء حذف الجدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description جلب جميع السجلات في جدول معين استنادًا إلى قيمة محددة في عمود معين.
     * @param {string} tableName اسم الجدول الذي يحتوي على البيانات.
     * @param {string} columnName اسم العمود الذي يجب فحصه.
     * @param {any} columnValue القيمة التي يجب أن تتوافق مع العمود.
     * @returns {Array} مصفوفة تحتوي على جميع السجلات التي تتوافق مع القيمة المحددة في العمود.
     */
    findRecordAll(tableName, columnName, columnValue) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return [];
            }

            // التحقق من وجود العمود
            const columns = this.getColumnNames(tableName);
            if (!columns.includes(columnName)) {
                logError(`العمود ${columnName} غير موجود في جدول ${tableName}.`);
                return [];
            }

            // جلب السجلات التي تتوافق مع القيمة المعطاة في العمود
            const records = this.db.prepare(`SELECT * FROM ${tableName} WHERE ${columnName} = ?`).all(columnValue);
            logInfo(`السجلات في جدول ${tableName} حيث ${columnName} تساوي ${columnValue}:`, records?.length || 0);
            return records;
        } catch (error) {
            logError(`حدث خطأ أثناء جلب السجلات من جدول ${tableName} حيث ${columnName} تساوي ${columnValue}:`, error);
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
                logError(`الجدول ${tableName} غير موجود.`);
                return null;
            }

            // التحقق من وجود العمود
            const columns = this.getColumnNames(tableName);
            if (!columns.includes(column)) {
                logError(`العمود ${column} غير موجود في جدول ${tableName}.`);
                return null;
            }

            const record = this.db.prepare(`SELECT * FROM ${tableName} WHERE ${column} = ?`).get(value);
            if (record) {
                // logInfo(`السجل حيث ${column} يساوي ${value} في جدول ${tableName}:`, record);
                return record;
            } else {
                // logInfo(`لا يوجد سجل حيث ${column} يساوي ${value} في جدول ${tableName}.`);
                return null;
            }
        } catch (error) {
            logError(`حدث خطأ أثناء البحث عن سجل حيث ${column} يساوي ${value} في جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description استعراض كل السجلات في جدول معين.
     * @param {string} tableName اسم الجدول.
     * @returns {array} مصفوفة تحتوي على كل السجلات في الجدول، أو مصفوفة فارغة إذا لم يتم العثور على سجلات.
     */
    getRecordsAll(tableName) {
        try {
            const records = this.db.prepare(`SELECT * FROM ${tableName}`).all();
            // logInfo(`السجلات في جدول ${tableName}:`, records);
            return records;
        } catch (error) {
            logError(`حدث خطأ أثناء استعراض الجدول ${tableName}:`, error);
            throw error;
        }
    }

}