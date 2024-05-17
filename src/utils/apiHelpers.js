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
    const { email, password, hashedPassword, apiUsername, apiKey, ...rest } = opj;
    return rest;
}

/**
 * يقوم بالتحقق من صحة الرؤوس API Key و API Username في الطلب.
 * @param {{user, config}} options - الخيارات
 * @param {object} headers - الرؤوس المرسلة في الطلب.
 * @returns {boolean} - true إذا كانت API Key و API Username صحيحة، وإلا فإنه يعيد false.
 */
function validateAPIKeys(options, headers) {
    if (options.user && !options.config) {
        const isAuthorized = process.env.APIUSERNAME === headers["api-username"] && process.env.APIKEY === headers["api-key"];
        if (isAuthorized) {
            return isAuthorized
        } else {
            return options.user.apiUsername === headers["api-username"] && options.user.apiKey === headers["api-key"];
        }
    } else {
        return options?.config?.APIUSERNAME === headers["api-username"] && options?.config?.APIKEY === headers["api-key"];
    }
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



export {
    sendUnauthorizedResponse,
    getMissingFields,
    stripSensitiveFields,
    sendMissingFieldsResponse,
    validateAPIKeys,
    tryParseJSON
};