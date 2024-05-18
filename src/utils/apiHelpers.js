/**
 * يقوم بإرسال استجابة 401 غير مصرح بها.
 * @param {object} res - كائن الاستجابة Express.
 * @returns {object} - كائن JSON يحتوي على رسالة الخطأ.
 */
function sendUnauthorizedResponse(res) {
    return res.status(401).json({
        success: false,
        message: `عذرًا، غير مصرح لك بالوصول. يرجى التحقق من صحة البيانات المقدمة والمحاولة مرة أخرى.`
    });
}

/**
 * يقوم بإرجاع الحقول المفقودة في الجسم من الحقول المطلوبة.
 * @param {object} body - الجسم المرسل في الطلب.
 * @param {string[]} requiredFields - مصفوفة تحتوي على الحقول المطلوبة.
 * @returns {string[]} - مصفوفة تحتوي على الحقول المفقودة.
 */
function getMissingFields(body, requiredFields) {
    return requiredFields.filter(field => !body[field]);
}

/**
 * إرسال رد استجابة في حالة عدم توفر الحقول المطلوبة.
 * @param {Object} res - كائن الاستجابة من Express.
 * @param {string[]} missingFields - قائمة بالحقول المفقودة.
 * @returns {Object} - كائن JSON يحتوي على رسالة استجابة.
 */
function sendMissingFieldsResponse(res, missingFields) {
    return res.status(401).json({
        success: false,
        message: `الرجاء توفير البيانات "${missingFields.join('", "')}`
    });
}

/**
 * يقوم بإزالة الحقول الحساسة من الكائن.
 * @param {object} opj - كائن.
 * @returns {object} - كائن بدون الحقول الحساسة.
 */
function stripSensitiveFields(opj) {
    const { email, password, hashedPassword, ...rest } = opj;
    return rest;
}

/**
 * التحقق من مصادقة المستخدم
 * يقوم بالتحقق من صحة الرؤوس Username و Password في الطلب باستخدام كائن مستخدم محدد.
 * @param {object} user - كائن المستخدم
 * @param {object} headers - الرؤوس المرسلة في الطلب.
 * @returns {boolean} 
 */
function checkUserAuthentication(user, headers) {
    if (!user || !headers) {
        return false; // تأكد من وجود متغيرات المستخدم والرؤوس
    }
    return user.username === headers["username"]?.toLowerCase() && user.password === headers["password"];
}

/**
 * يحاول تحويل سلسلة JSON إلى كائن JavaScript. إذا فشل التحويل،
 * يفترض أن السلسلة هي سلسلة مفصولة بفواصل ويقوم بتحويلها إلى مصفوفة.
 * إذا كانت السلسلة فارغة، ترجع مصفوفة فارغة.
 *
 * @param {string} jsonString - السلسلة النصية التي تحتوي على JSON أو سلسلة مفصولة بفواصل.
 * @returns {Array|Object} - الكائن الناتج من تحويل JSON أو مصفوفة من العناصر النصية. إذا كانت السلسلة فارغة، ترجع مصفوفة فارغة.
 *
 * @example
 * // مثال عند استخدام JSON صالح
 * const jsonStr = '{"key1": "value1", "key2": "value2"}';
 * const result = tryParseJSON(jsonStr);
 * console.log(result); // { key1: 'value1', key2: 'value2' }
 *
 * @example
 * // مثال عند استخدام سلسلة مفصولة بفواصل
 * const csvStr = "linux,windows,mac";
 * const result = tryParseJSON(csvStr);
 * console.log(result); // ['linux', 'windows', 'mac']
 *
 * @example
 * // مثال عند استخدام سلسلة فارغة
 * const emptyStr = "";
 * const result = tryParseJSON(emptyStr);
 * console.log(result); // []
 */
function tryParseJSON(jsonString) {
    if (!jsonString) {
        // إذا كانت السلسلة فارغة، أرجع مصفوفة فارغة
        return [];
    }

    try {
        // محاولة تحويل السلسلة النصية إلى كائن JSON
        return JSON.parse(jsonString);
    } catch (e) {
        // إذا فشل التحويل، افترض أنها سلسلة مفصولة بفواصل وقم بتحويلها إلى مصفوفة
        return jsonString.split(',').map(tag => tag.trim());
    }
}


/**
 * تحقق من صلاحيات المستخدم.
 * @param {object} user - كائن المستخدم.
 * @param {Array<string>} allowedRoles - قائمة الأدوار المسموح بها لتنفيذ الإجراء.
 * @returns {boolean} - إرجاع true إذا كان للمستخدم أحد الأدوار المسموح بها، وإلا false.
 */
function checkUserRole(user, allowedRoles) {
    const rolesHierarchy = {
        'guest': 0,
        'user': 1,
        'moderator': 2,
        'admin': 3
    };

    // تحويل دور المستخدم إلى أحرف صغيرة
    const userRoleLower = user.role.toLowerCase();
    // التحقق من أن دور المستخدم يوجد ضمن الأدوار المسموح بها
    return allowedRoles.map(role => role.toLowerCase()).some(role => rolesHierarchy[userRoleLower] >= rolesHierarchy[role]);
}

/**
 * تحويل قيمة إلى قيمة منطقية (boolean) استنادًا إلى نوعها وقيمتها.
 * @param {any} value - القيمة التي تُريد تحويلها إلى قيمة منطقية.
 * @returns {boolean} التمثيل المنطقي (boolean) للقيمة المحددة.
 * @example
 * // باستخدام رقم
 * let result = convertToBoolean(1); // سيكون الناتج true
 * let result2 = convertToBoolean(0); // سيكون الناتج false
 * 
 * // باستخدام نص
 * let result3 = convertToBoolean("true"); // سيكون الناتج true
 * let result4 = convertToBoolean("false"); // سيكون الناتج false
 * 
 * // باستخدام أرقام نصية
 * let result5 = convertToBoolean("1"); // سيكون الناتج true
 * let result6 = convertToBoolean("0"); // سيكون الناتج false
 * 
 * // باستخدام أنواع أخرى
 * let result7 = convertToBoolean(null); // سيكون الناتج false
 * let result8 = convertToBoolean(undefined); // سيكون الناتج false
 * let result9 = convertToBoolean({}); // سيكون الناتج true (كائن غير فارغ)
 */
function convertToBoolean(value) {
    if (typeof value === 'number') {
        return value === 1 ? true : false;
    } else if (typeof value === 'string') {
        // تحويل الأرقام النصية "1" و "0"
        if (value === "1") {
            return true;
        } else if (value === "0") {
            return false;
        } else {
            return value.toLowerCase() === 'true';
        }
    } else {
        return !!value; // نفي مزدوج لتحويل القيمة إلى منطقية
    }
}

export {
    sendUnauthorizedResponse,
    getMissingFields,
    stripSensitiveFields,
    sendMissingFieldsResponse,
    checkUserAuthentication,
    checkUserRole,
    convertToBoolean,
    tryParseJSON
};