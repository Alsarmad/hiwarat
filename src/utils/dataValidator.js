/**
 * @file dataValidator.js
 * @description يحتوي على فئة DataValidator التي تقوم بالتحقق من صحة البيانات المدخلة بناءً على إعدادات محددة.
 */

/**
 * فئة DataValidator للتحقق من صحة البيانات المدخلة.
 */
class DataValidator {
    /**
     * ينشئ كائن DataValidator مع إعدادات التحقق المدمجة.
     */
    constructor() {
        this.validations = {
            username: {
                maxLength: 25,
                minLength: 3,
                pattern: /^[a-zA-Z0-9_]+$/,
                // customValidation: (value) => (value.match(/[A-Z]/g) || []).length >= 2,
                messages: {
                    maxLength: 'اسم المستخدم يجب أن يكون أقل من 25 حرفًا.',
                    minLength: 'اسم المستخدم يجب أن يكون اطول من 3 حروف.',
                    pattern: 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة سفلية (_) فقط.',
                    // customValidation: 'اسم المستخدم يجب أن يحتوي على حرفين كبيرين (Uppercase) على الأقل.'
                }
            },
            full_name: {
                maxLength: 50,
                minLength: 3,
                messages: {
                    maxLength: 'الاسم الكامل يجب أن يكون أقل من 50 حرفًا.',
                    minLength: 'الاسم الكامل يجب أن يكون اطول من 3 حروف.'
                }
            },
            email: {
                maxLength: 255,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    maxLength: 'البريد الإلكتروني يجب أن يكون أقل من 255 حرفًا.',
                    pattern: 'البريد الإلكتروني غير صحيح.'
                }
            },
            password: {
                maxLength: 255,
                minLength: 6,
                messages: {
                    maxLength: 'كلمة المرور يجب أن تكون أقل من 255 حرفًا.',
                    minLength: 'كلمة المرور يجب أن تكون اطول من 6 حروف.'
                }
            },
            active: {
                allowedValues: [false, true],
                messages: {
                    allowedValues: 'حالة التفعيل يجب أن تكون إما false أو true.'
                }
            },
            is_banned: {
                allowedValues: [false, true],
                messages: {
                    allowedValues: 'حظر العضوية يجب ان تكون القيمة false أو true.'
                }
            },
            role: {
                allowedValues: ["admin", "moderator", "user", "guest", "banned"],
                messages: {
                    allowedValues: 'دور المستخدم يجب أن يكون أحد القيم التالية: "admin", "moderator", "user", "guest", "banned".'
                }
            },
            birthdate: {
                dateformat: 'YYYY-MM-DD',
                messages: {
                    dateformat: 'تاريخ الميلاد يجب أن يكون بتنسيق صحيح مثل "YYYY-MM-DD".'
                }
            },
            gender: {
                allowedValues: ["ذكر", "انثى"],
                messages: {
                    allowedValues: 'جنس المستخدم يجب أن يكون إما "ذكر" أو "انثى".'
                }
            },
            location: {
                maxLength: 50,
                minLength: 6,
                messages: {
                    maxLength: 'موقع المستخدم يجب أن يكون أقل من 50 حرفًا.',
                    minLength: 'موقع المستخدم يجب أن يكون اطول من 3 حروف.'
                }
            },
            bio: {
                maxLength: 1000,
                messages: {
                    maxLength: 'النبذة الشخصية يجب أن تكون أقل من 1000 حرف.'
                }
            },
            phone: {
                maxLength: 20,
                messages: {
                    maxLength: 'رقم الهاتف يجب أن يكون أقل من 20 رقم.'
                }
            },
            profile_picture: {
                type: 'blob',
                messages: {
                    type: 'صورة الملف الشخصي يجب أن تكون من نوع BLOB(Buffer).'
                }
            },
            post_title: {
                maxLength: 100,
                minLength: 20,
                messages: {
                    maxLength: 'عنوان المنشور طويل جدًا. الحد الأقصى لطول العنوان هو 100 حرف.',
                    minLength: 'عنوان المنشور قصير. الحد الأدنى لطول العنوان هو 20 حرف.',
                }
            },
            post_id: {
                maxLength: 50,
                minLength: 5,
                messages: {
                    maxLength: 'طول معرف المنشور يجب ألا يتجاوز 50 حرفًا.',
                    minLength: 'طول معرف المنشور يجب ألا يقل عن 5 حروف.',
                }
            },
            post_content: {
                maxLength: 10000,
                minLength: 150,
                messages: {
                    maxLength: 'محتوى المنشور طويل جدًا. الحد الأقصى لطول المحتوى هو 10000 حرف.',
                    minLength: 'محتوى المنشور قصير. الحد الأدنى لطول المحتوى هو 150 حرف.',
                }
            },
            hashtags: {
                type: 'array',
                messages: {
                    type: 'الرجاء توفير الهشتاقات في شكل مصفوفة ["tag1", "tag2", "tag3"].'
                }
            },
            comment_content: {
                maxLength: 10000,
                minLength: 150,
                messages: {
                    maxLength: 'محتوى التعليق طويل جدًا. الحد الأقصى لطول المحتوى هو 5000 حرف.',
                    minLength: 'طول التعليق قصير. الحد الأدنى لطول التعليق هو 150 حرف.',
                }
            },
        };
    }

    /**
     * يتحقق من صحة البيانات المدخلة بناءً على الإعدادات المحددة.
     * @param {object} userData - بيانات المستخدم المدخلة.
     * @returns {object} - كائن يحتوي على success و message في حالة النجاح أو فشل التحقق.
     */
    validate(userData) {
        for (const field in this.validations) {
            if (userData.hasOwnProperty(field)) {
                const { maxLength, minLength, pattern, type, allowedValues, dateformat, customValidation, messages } = this.validations[field];
                const value = userData[field];

                // تحقق من الحد الأقصى للطول
                if (maxLength !== undefined && value.length > maxLength) {
                    return this._createResponse(false, messages.maxLength || `${field} يجب أن يكون أقل من ${maxLength} حرفًا.`);
                }

                // تحقق من الحد الأدنى للطول
                if (minLength !== undefined && value.length < minLength) {
                    return this._createResponse(false, messages.minLength || `${field} يجب أن يكون على الأقل ${minLength} حرفًا.`);
                }

                // تحقق من النمط
                if (pattern && !pattern.test(value)) {
                    return this._createResponse(false, messages.pattern || `${field} غير صحيح.`);
                }

                // تحقق من القيم المسموح بها
                if (allowedValues && !allowedValues.includes(value)) {
                    return this._createResponse(false, messages.allowedValues || `${field} يحتوي على قيمة غير مسموح بها.`);
                }

                // تحقق من نوع البيانات
                if (type) {
                    if (type === 'string' && typeof value !== 'string') {
                        return this._createResponse(false, messages.type || `${field} يجب أن يكون نص.`);
                    }
                    if (type === 'integer' && !Number.isInteger(value)) {
                        return this._createResponse(false, messages.type || `${field} يجب أن يكون عدد صحيح.`);
                    }
                    if (type === 'float' && typeof value !== 'number') {
                        return this._createResponse(false, messages.type || `${field} يجب أن يكون عدد عشري.`);
                    }
                    if (type === 'boolean' && typeof value !== 'boolean') {
                        return this._createResponse(false, messages.type || `${field} يجب ان يكون نوع البيانات boolean`);
                    }
                    if (type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
                        return this._createResponse(false, messages.type || `${field} يجب أن يكون كائن.`);
                    }
                    if (type === 'array' && !Array.isArray(value)) {
                        return this._createResponse(false, messages.type || `${field} يجب أن يكون مصفوفة.`);
                    }
                    if (type === 'blob' && !(value instanceof Buffer)) {
                        return this._createResponse(false, messages.type || `${field} يجب أن يكون من نوع BLOB.`);
                    }
                    if (type === 'date') {
                        if (!(value instanceof Date) || isNaN(value.getTime())) {
                            return this._createResponse(false, messages.type || `${field} يجب أن يكون تاريخًا صالحًا.`);
                        }
                    }
                }

                // تحقق مخصص
                if (customValidation && !customValidation(value)) {
                    return this._createResponse(false, messages.customValidation || `${field} غير صالح.`);
                }

                // تحقق من التنسيق المناسب للتاريخ
                if (dateformat && !this._isValidDateFormat(value, dateformat)) {
                    return this._createResponse(false, messages.dateformat || `${field} يجب أن يكون بتنسيق صحيح مثل "${format}".`);
                }
            }
        }

        return this._createResponse(true, 'تم التحقق من جميع المدخلات');
    }

    /**
     * يتحقق مما إذا كانت سلسلة التاريخ المحددة تتطابق مع التنسيق 'YYYY-MM-DD'.
     * @param {string} dateString - سلسلة التاريخ للتحقق منها.
     * @returns {boolean} - true إذا كانت السلسلة تتوافق مع التنسيق المحدد، وإلا false.
     */
    _isValidDateFormat(dateString) {
        const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
        // التحقق من تطابق التنسيق المحدد 'YYYY-MM-DD'
        if (!regex.test(dateString)) return false;

        // استخراج المكونات من التاريخ
        const [, year, month, day] = regex.exec(dateString);
        // إنشاء كائن Date والتحقق من صحة التاريخ
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== parseInt(year, 10) ||
            date.getMonth() + 1 !== parseInt(month, 10) ||
            date.getDate() !== parseInt(day, 10)) {
            return false;
        }
        return true;
    }

    /**
     * ينشئ استجابة التحقق.
     * @param {boolean} success - حالة النجاح.
     * @param {string} message - رسالة التحقق.
     * @returns {object} - كائن يحتوي على success و message.
     * @private
     */
    _createResponse(success, message) {
        return { success, message };
    }
}

export default new DataValidator();