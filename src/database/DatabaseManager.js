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
            const columns = Object.keys(data);
            const placeholders = columns.map(() => '?').join(', ');

            // تحويل القيم إلى تنسيقات مدعومة
            const values = Object.values(data).map(value => {
                if (value === null || value === undefined) {
                    return null;
                } else if (Array.isArray(value) || typeof value === 'object') {
                    return JSON.stringify(value);
                }
                return value;
            });

            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            const statement = this.db.prepare(query);

            const result = statement.run(values);
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
      * @description تحديث بيانات سجل في جدول معين بناءً على معايير متعددة.
      * @param {string} tableName اسم الجدول.
      * @param {object} criteria كائن يحتوي على الأعمدة والقيم التي تريد تحديد السجل بناءً عليها.
      * @param {object} newData البيانات الجديدة التي تريد تحديث السجل بها.
      * 
      * @example
      * dbManager.updateRecord("users", { id: "1", status: "active" }, { columnName: "newData" });
      */
    updateRecord(tableName, criteria, newData) {
        try {
            // التحقق من أن newData غير فارغة
            if (!newData || Object.keys(newData).length === 0) {
                logError(`لا يمكن تحديث السجل في الجدول ${tableName}، حيث أن البيانات الجديدة غير محددة أو فارغة. يُرجى تقديم بيانات جديدة صالحة في شكل كائن.`);
                return false;
            }

            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return false;
            }

            // بناء شرط البحث
            const columns = this.getColumnNames(tableName);
            const conditions = [];
            const values = [];
            for (const [column, value] of Object.entries(criteria)) {
                if (!columns.includes(column)) {
                    logError(`العمود ${column} غير موجود في جدول ${tableName}.`);
                    return false;
                }
                conditions.push(`${column} = ?`);
                values.push(value);
            }
            const whereClause = conditions.join(' AND ');

            // بناء القيم الجديدة للتحديث
            const setClauses = [];
            const setValues = [];
            for (const [key, value] of Object.entries(newData)) {
                if (value === null || value === undefined) {
                    setClauses.push(`${key} = NULL`);
                } else if (Array.isArray(value) || typeof value === 'object') {
                    setClauses.push(`${key} = ?`);
                    setValues.push(JSON.stringify(value));
                } else {
                    setClauses.push(`${key} = ?`);
                    setValues.push(value);
                }
            }

            // دمج قيم التحديث مع قيم البحث
            const finalValues = [...setValues, ...values];

            // تنفيذ تحديث السجل
            const statement = this.db.prepare(`UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereClause}`);
            statement.run(...finalValues);
            return true;
        } catch (error) {
            logError(`حدث خطأ أثناء تحديث السجل في جدول ${tableName}:`, error);
            throw error;
        }
    }


    /**
     * يقوم بحذف سجل من جدول في قاعدة البيانات باستخدام معايير متعددة.
     * @param {string} tableName اسم الجدول الذي يجب حذف السجل منه.
     * @param {object} criteria كائن يحتوي على الأعمدة والقيم التي يجب حذف السجل بناءً عليها.
     * @returns {void}
     * @throws {Error} إذا حدث خطأ أثناء عملية الحذف.
     * @example
     * dbManager.deleteRecord('users', { id: 1, status: 'inactive' });
     */
    deleteRecord(tableName, criteria) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return;
            }

            // بناء شرط البحث
            const columns = this.getColumnNames(tableName);
            const conditions = [];
            const values = [];
            for (const [column, value] of Object.entries(criteria)) {
                if (!columns.includes(column)) {
                    logError(`العمود ${column} غير موجود في جدول ${tableName}.`);
                    return;
                }
                conditions.push(`${column} = ?`);
                values.push(value);
            }
            const whereClause = conditions.join(' AND ');

            const statement = this.db.prepare(`DELETE FROM ${tableName} WHERE ${whereClause}`);
            statement.run(...values);
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
     * @param {object} criteria كائن يحتوي على الأعمدة والقيم التي تريد البحث عنها.
     * @returns {Array|null} مصفوفة تحتوي على جميع السجلات التي تتوافق مع القيمة المحددة في العمود.
     */
    findRecordAll(tableName, criteria) {
        try {
            // التحقق من وجود الجدول
            if (!this.tableExists(tableName)) {
                logError(`الجدول ${tableName} غير موجود.`);
                return [];
            }
            // بناء شرط البحث
            const columns = this.getColumnNames(tableName);
            const conditions = [];
            const values = [];
            for (const [column, value] of Object.entries(criteria)) {
                if (!columns.includes(column)) {
                    logError(`العمود ${column} غير موجود في جدول ${tableName}.`);
                    return null;
                }
                conditions.push(`${column} = ?`);
                values.push(value);
            }
            const whereClause = conditions.join(' AND ');
            // جلب السجلات التي تتوافق مع القيمة المعطاة في العمود
            const records = this.db.prepare(`SELECT * FROM ${tableName} WHERE ${whereClause} ORDER BY ROWID DESC`).all(...values);
            return records;
        } catch (error) {
            logError(`حدث خطأ أثناء جلب السجلات من جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * @description البحث عن سجل باستخدام معايير متعددة.
     * @param {string} tableName اسم الجدول.
     * @param {object} criteria كائن يحتوي على الأعمدة والقيم التي تريد البحث عنها.
     * @returns {object|null} سجل معين إذا وُجد، وإلا فإنه يعيد قيمة null.
     */
    findRecord(tableName, criteria) {
        try {
            // التحقق من وجود الجدول
            const tableExists = this.tableExists(tableName);
            if (!tableExists) {
                logError(`الجدول ${tableName} غير موجود.`);
                return null;
            }

            // بناء شرط البحث
            const columns = this.getColumnNames(tableName);
            const conditions = [];
            const values = [];
            for (const [column, value] of Object.entries(criteria)) {
                if (!columns.includes(column)) {
                    logError(`العمود ${column} غير موجود في جدول ${tableName}.`);
                    return null;
                }
                conditions.push(`${column} = ?`);
                values.push(value);
            }
            const whereClause = conditions.join(' AND ');

            const record = this.db.prepare(`SELECT * FROM ${tableName} WHERE ${whereClause}`).get(...values);
            if (record) {
                // logInfo(`السجل حيث ${whereClause} في جدول ${tableName}:`, record);
                return record;
            } else {
                // logInfo(`لا يوجد سجل حيث ${whereClause} في جدول ${tableName}.`);
                return null;
            }
        } catch (error) {
            logError(`حدث خطأ أثناء البحث عن سجل في جدول ${tableName}:`, error);
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

    /**
     * يسترجع السجلات في جدول معين مع التقسيم إلى صفحات.
     * @param {string} tableName اسم الجدول الذي يحتوي على البيانات.
     * @param {number} limit الحد الأقصى لعدد السجلات التي يجب استرجاعها.
     * @param {number} offset الفاصل الزمني لبدء استرجاع السجلات منه.
     * @returns {Array} مصفوفة تحتوي على السجلات المسترجعة مع التقسيم إلى صفحات.
     * @throws {Error} في حالة تجاوز قيمة الـ offset عدد السجلات الموجودة في الجدول.
     */
    getRecordsPaginated(tableName, limit, offset) {
        try {
            // التحقق من عدد السجلات الموجودة في الجدول
            const totalRecords = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;

            if (offset > totalRecords) {
                logInfo(`القيمة المحددة للـ offset (${offset}) تتجاوز عدد السجلات الموجودة في الجدول (${totalRecords}).`);
                return []
            }

            // استعلام قاعدة البيانات لاسترجاع النتائج المطلوبة مع ترتيب من الأحدث إلى الأقدم باستخدام ROWID
            const statement = this.db.prepare(`SELECT * FROM ${tableName} ORDER BY ROWID DESC LIMIT ? OFFSET ?`);
            return statement.all(limit, offset);
        } catch (error) {
            logError(`حدث خطأ أثناء استعراض الجدول ${tableName} بتقسيم الصفحات:`, error);
            throw error;
        }
    }

    /**
     * جلب جميع المنشورات المثبتة.
     * 
     * @returns {Array} قائمة المنشورات المثبتة مرتبة من الأحدث إلى الأقدم.
     * @throws {Error} في حالة حدوث خطأ أثناء جلب المنشورات المثبتة.
     */
    getPinnedPosts() {
        try {
            const statement = this.db.prepare(`SELECT * FROM posts WHERE is_pinned = 1 ORDER BY ROWID DESC`);
            return statement.all();
        } catch (error) {
            logError(`حدث خطأ أثناء جلب المنشورات المثبتة:`, error);
            throw error;
        }
    }

    /**
     * جلب المنشورات غير المثبتة مع تقسيم الصفحات.
     * 
     * @param {number} limit - عدد المنشورات التي يتم جلبها في الصفحة الواحدة.
     * @param {number} offset - النقطة التي يبدأ منها الاستعلام لجلب المنشورات.
     * @returns {Array} قائمة المنشورات غير المثبتة مرتبة من الأحدث إلى الأقدم مع تطبيق التصفية.
     * @throws {Error} في حالة حدوث خطأ أثناء جلب المنشورات غير المثبتة.
     */
    getNonPinnedPosts(limit, offset) {
        try {
            const statement = this.db.prepare(`SELECT * FROM posts WHERE is_pinned = 0 ORDER BY ROWID DESC LIMIT ? OFFSET ?`);
            return statement.all(limit, offset);
        } catch (error) {
            logError(`حدث خطأ أثناء جلب المنشورات غير المثبتة:`, error);
            throw error;
        }
    }

    /**
     * يحسب عدد السجلات في جدول معين بناءً على معايير محددة.
     *
     * @param {string} tableName - اسم الجدول في قاعدة البيانات.
     * @param {Object} criteria - كائن يحتوي على المعايير لتصفية السجلات. المفاتيح هي أسماء الأعمدة والقيم هي القيم المطلوبة.
     * @returns {number} - عدد السجلات التي تطابق المعايير المحددة.
     * @throws {Error} - في حال حدوث خطأ أثناء الاستعلام عن قاعدة البيانات.
     */
    countRecords(tableName, criteria) {
        try {
            // التحقق من وجود الجدول
            const tableExists = this.tableExists(tableName);
            if (!tableExists) {
                logError(`الجدول ${tableName} غير موجود.`);
                return 0;
            }

            // بناء شرط البحث
            const columns = this.getColumnNames(tableName);
            const conditions = [];
            const values = [];
            for (const [column, value] of Object.entries(criteria)) {
                if (!columns.includes(column)) {
                    logError(`العمود ${column} غير موجود في جدول ${tableName}.`);
                    return 0;
                }
                conditions.push(`${column} = ?`);
                values.push(value);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // استعلام قاعدة البيانات لجلب عدد السجلات
            const statement = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`);
            const result = statement.get(...values);
            return result.count;
        } catch (error) {
            logError(`حدث خطأ أثناء حساب عدد السجلات في جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * يحسب عدد جميع السجلات في جدول معين.
     *
     * @param {string} tableName - اسم الجدول في قاعدة البيانات.
     * @returns {number} - عدد جميع السجلات في الجدول.
     * @throws {Error} - في حال حدوث خطأ أثناء الاستعلام عن قاعدة البيانات.
     */
    countAllRecords(tableName) {
        try {
            // التحقق من وجود الجدول
            const tableExists = this.tableExists(tableName);
            if (!tableExists) {
                logError(`الجدول ${tableName} غير موجود.`);
                return 0;
            }

            // استعلام قاعدة البيانات لجلب عدد جميع السجلات
            const statement = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
            const result = statement.get();
            return result.count;
        } catch (error) {
            logError(`حدث خطأ أثناء حساب عدد جميع السجلات في جدول ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * زيادة عدد المشاهدات لمنشور معين.
     * @param {string} postId معرف المنشور.
     */
    incrementViewCount(postId) {
        try {
            // التحقق من وجود الجدول
            const tableExists = this.tableExists("views");
            if (!tableExists) {
                logError(`الجدول ${tableName} غير موجود.`);
                return 0;
            }
            const record = this.findRecord('views', { post_id: postId });
            if (record) {
                const newCount = parseInt(record.view_count) + 1;
                this.updateRecord('views', { post_id: postId }, { view_count: newCount });
            } else {
                this.insertRecord('views', { post_id: postId, view_count: 1 });
            }
            logInfo(`تمت زيادة عدد المشاهدات للمنشور ${postId}.`);
        } catch (error) {
            logError(`حدث خطأ أثناء زيادة عدد المشاهدات للمنشور ${postId}:`, error);
            throw error;
        }
    }
}