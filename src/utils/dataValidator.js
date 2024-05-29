/**
 * @file dataValidator.js
 * @description يحتوي على وظيفة dataValidator التي تقوم بالتحقق من صحة البيانات المدخلة بناءً على إعدادات محددة.
 */

/**
 * وظيفة dataValidator للتحقق من صحة البيانات المدخلة.
 * @param {object} userData - بيانات المستخدم المدخلة.
 * @param {object} translationManager - مدير الترجمة للحصول على الرسائل المترجمة.
 * @param {string} lang - لغة الترجمة.
 * @returns {object} - كائن يحتوي على success و message في حالة النجاح أو فشل التحقق.
 */
function dataValidator(userData, translationManager, lang) {
    const validations = {
        username: {
            maxLength: 50,
            minLength: 3,
            pattern: /^[a-zA-Z0-9_]+$/,
            messages: {
                maxLength: translationManager.translate('username_maxLength', { length: 50 }, lang),
                minLength: translationManager.translate('username_minLength', { length: 3 }, lang),
                pattern: translationManager.translate('username_pattern', {}, lang)
            }
        },
        full_name: {
            maxLength: 50,
            minLength: 3,
            messages: {
                maxLength: translationManager.translate('full_name_maxLength', { length: 50 }, lang),
                minLength: translationManager.translate('full_name_minLength', { length: 3 }, lang)
            }
        },
        email: {
            maxLength: 60,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            messages: {
                maxLength: translationManager.translate('email_maxLength', { length: 60 }, lang),
                pattern: translationManager.translate('email_pattern', {}, lang)
            }
        },
        password: {
            maxLength: 100,
            minLength: 6,
            messages: {
                maxLength: translationManager.translate('password_maxLength', { length: 100 }, lang),
                minLength: translationManager.translate('password_minLength', { length: 6 }, lang)
            }
        },
        active: {
            allowedValues: [false, true],
            messages: {
                allowedValues: translationManager.translate('active_allowedValues', {}, lang)
            }
        },
        is_banned: {
            allowedValues: [false, true],
            messages: {
                allowedValues: translationManager.translate('is_banned_allowedValues', {}, lang)
            }
        },
        role: {
            allowedValues: ["admin", "moderator", "user"],
            messages: {
                allowedValues: translationManager.translate('role_allowedValues', {}, lang)
            }
        },
        birthdate: {
            dateformat: 'YYYY-MM-DD',
            messages: {
                dateformat: translationManager.translate('birthdate_dateformat', {}, lang)
            }
        },
        gender: {
            allowedValues: ["ذكر", "انثى", "male", "female"],
            messages: {
                allowedValues: translationManager.translate('gender_allowedValues', {}, lang)
            }
        },
        location: {
            maxLength: 30,
            minLength: 3,
            messages: {
                maxLength: translationManager.translate('location_maxLength', { length: 30 }, lang),
                minLength: translationManager.translate('location_minLength', { length: 3 }, lang)
            }
        },
        bio: {
            maxLength: 1000,
            messages: {
                maxLength: translationManager.translate('bio_maxLength', { length: 1000 }, lang)
            }
        },
        phone: {
            maxLength: 20,
            messages: {
                maxLength: translationManager.translate('phone_maxLength', { length: 20 }, lang)
            }
        },
        profile_picture: {
            type: 'blob',
            messages: {
                type: translationManager.translate('profile_picture_type', {}, lang)
            }
        },
        post_title: {
            maxLength: 100,
            minLength: 20,
            messages: {
                maxLength: translationManager.translate('post_title_maxLength', { length: 100 }, lang),
                minLength: translationManager.translate('post_title_minLength', { length: 20 }, lang)
            }
        },
        post_id: {
            maxLength: 50,
            minLength: 5,
            messages: {
                maxLength: translationManager.translate('post_id_maxLength', { length: 50 }, lang),
                minLength: translationManager.translate('post_id_minLength', { length: 5 }, lang)
            }
        },
        post_content: {
            maxLength: 10000,
            minLength: 50,
            messages: {
                maxLength: translationManager.translate('post_content_maxLength', { length: 10000 }, lang),
                minLength: translationManager.translate('post_content_minLength', { length: 50 }, lang)
            }
        },
        hashtags: {
            type: 'array',
            messages: {
                type: translationManager.translate('hashtags_type', {}, lang)
            }
        },
        comment_content: {
            maxLength: 5000,
            minLength: 10,
            messages: {
                maxLength: translationManager.translate('comment_content_maxLength', { length: 5000 }, lang),
                minLength: translationManager.translate('comment_content_minLength', { length: 10 }, lang)
            }
        },
        reported_item_type: {
            allowedValues: ["post", "comment"],
            messages: {
                allowedValues: translationManager.translate('reported_item_type_allowedValues', {}, lang)
            }
        },
        reported_item_id: {
            maxLength: 50,
            minLength: 5,
            messages: {
                maxLength: translationManager.translate('report_id_maxLength', { length: 50 }, lang),
                minLength: translationManager.translate('report_id_minLength', { length: 5 }, lang)
            }
        },
        report_type: {
            allowedValues: ["abuse", "harassment", "spam", "hate speech", "violence", "copyright infringement", "inappropriate content", "other"],
            messages: {
                allowedValues: translationManager.translate('report_type_allowedValues', {}, lang)
            }
        },
        report_description: {
            maxLength: 200,
            minLength: 5,
            messages: {
                maxLength: translationManager.translate('report_description_maxLength', { length: 200 }, lang),
                minLength: translationManager.translate('report_description_minLength', { length: 5 }, lang)
            }
        }
    };

    for (const field in validations) {
        if (userData.hasOwnProperty(field)) {
            const { maxLength, minLength, pattern, type, allowedValues, dateformat, customValidation, messages } = validations[field];
            const value = userData[field];

            // تحقق من الحد الأقصى للطول
            if (maxLength !== undefined && value.length > maxLength) {
                return createResponse(false, messages.maxLength || `${field} must be less than ${maxLength} characters.`);
            }

            // تحقق من الحد الأدنى للطول
            if (minLength !== undefined && value.length < minLength) {
                return createResponse(false, messages.minLength || `${field} must be at least ${minLength} characters long.`);
            }

            // تحقق من النمط
            if (pattern && !pattern.test(value)) {
                return createResponse(false, messages.pattern || `${field} is invalid.`);
            }

            // تحقق من القيم المسموح بها
            if (allowedValues && !allowedValues.includes(value)) {
                return createResponse(false, messages.allowedValues || `${field} contains an invalid value.`);
            }

            // تحقق من نوع البيانات
            if (type) {
                if (type === 'string' && typeof value !== 'string') {
                    return createResponse(false, messages.type || `${field} must be a text.`);
                }
                if (type === 'integer' && !Number.isInteger(value)) {
                    return createResponse(false, messages.type || `${field} must be an integer.`);
                }
                if (type === 'float' && typeof value !== 'number') {
                    return createResponse(false, messages.type || `${field} must be a decimal number.`);
                }
                if (type === 'boolean' && typeof value !== 'boolean') {
                    return createResponse(false, messages.type || `${field} must be of boolean data type.`);
                }
                if (type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
                    return createResponse(false, messages.type || `${field} must be an object.`);
                }
                if (type === 'array' && !Array.isArray(value)) {
                    return createResponse(false, messages.type || `${field} must be an array.`);
                }
                if (type === 'blob' && !(value instanceof Buffer)) {
                    return createResponse(false, messages.type || `${field} must be of type BLOB.`);
                }
                if (type === 'date') {
                    if (!(value instanceof Date) || isNaN(value.getTime())) {
                        return createResponse(false, messages.type || `${field} must be a valid date.`);
                    }
                }
            }

            // تحقق مخصص
            if (customValidation && !customValidation(value)) {
                return createResponse(false, messages.customValidation || `${field} is invalid.`);
            }

            // تحقق من التنسيق المناسب للتاريخ
            if (dateformat && !isValidDateFormat(value, dateformat)) {
                return createResponse(false, messages.dateformat || `${field} must be in a valid format like "${format}".`);
            }
        }
    }

    return createResponse(true, 'All entries have been verified');
}

/**
 * يتحقق مما إذا كانت سلسلة التاريخ المحددة تتطابق مع التنسيق 'YYYY-MM-DD'.
 * @param {string} dateString - سلسلة التاريخ للتحقق منها.
 * @returns {boolean} - true إذا كانت السلسلة تتوافق مع التنسيق المحدد، وإلا false.
 */
function isValidDateFormat(dateString) {
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
 */
function createResponse(success, message) {
    return { success, message };
}

export default dataValidator;
