import passwordHandler from '../../../utils/passwordHandler.js';

export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {
        const {
            sendUnauthorizedResponse,
            getMissingFields,
            stripSensitiveFields,
            sendMissingFieldsResponse,
            checkUserAuthentication,
            checkUserRole,
            generateUniqueId
        } = utils;
        const { usersDBManager } = DBManager;
        usersDBManager.openDatabase();

        // الحصول على كل المستخدمين
        router.get('/users', (req, res) => {
            try {
                const MAX_USERS_PER_PAGE = 20;
                const { headers, body, query } = req;
                // تحديد عدد المستخدمين في كل صفحة
                let limit = parseInt(query.limit) || MAX_USERS_PER_PAGE;
                limit = Math.min(limit, MAX_USERS_PER_PAGE);

                if (parseInt(query.limit) > MAX_USERS_PER_PAGE) {
                    return res.status(400).json({
                        success: false,
                        message: `تجاوزت الحد الأقصى لعدد المستخدمين المسموح بعرضه في كل صفحة (${MAX_USERS_PER_PAGE}).`,
                    });
                }

                const page = parseInt(query.page) || 1; // رقم الصفحة المطلوبة
                const offset = (page - 1) * limit; // حساب النقطة التي يبدأ منها الاستعلام
                const users = usersDBManager.getRecordsPaginated("users", limit, offset);

                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        users: [],
                        message: `لايوجد سجلات (قاعدة البيانات فارغة) ❌`
                    });
                }

                return res.status(200).json({
                    success: true,
                    users: users.map(user => stripSensitiveFields(user))
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // إنشاء مستخدم جديد
        router.post('/create-user', async (req, res) => {
            try {
                const { body } = req;
                const missingFields = getMissingFields(body, ["username", "full_name", "email", "password"]);
                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields);
                }
                const existingUser = usersDBManager.findRecord("users", { username: body.username.toLowerCase() });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: `اسم المستخدم محجوز ❌`
                    });
                }
                const existingEmail = usersDBManager.findRecord("users", { email: body.email.toLowerCase() });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: `البريد الإلكتروني مستخدم بالفعل ❌`
                    });
                }
                const user_id = generateUniqueId(35);
                const { hashedPassword } = await passwordHandler(body.password, 'hash');
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                usersDBManager.insertRecord("users", {
                    ...body,
                    username: body.username.toLowerCase(),
                    email: body.email.toLowerCase(),
                    user_id,
                    hashedPassword,
                    active: false,
                    role: "user",
                    created_at: currentTime,
                    updated_at: currentTime,
                });
                res.status(200).json({
                    success: true,
                    user_id,
                    message: `تم إنشاء المستخدم @${body.username.toLowerCase()} ✔️`
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على مستخدم بواسطة المعرف
        router.get('/users/:username', (req, res) => {
            try {
                const { username } = req.params;
                const user = usersDBManager.findRecord("users", { username: username.toLowerCase() });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${username.toLowerCase()}. ❌`
                    });
                }
                return res.status(200).json({
                    success: true,
                    ...stripSensitiveFields(user)
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // تحديث مستخدم بواسطة المعرف
        router.put('/users/:username', async (req, res) => {
            try {
                const { headers, body, params } = req;
                const { username } = params;
                const user = usersDBManager.findRecord("users", { username: username.toLowerCase() });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${username.toLowerCase()}. ❌`
                    });
                }
                if (!checkUserAuthentication(user, headers)) {
                    return sendUnauthorizedResponse(res);
                }
                if (!checkUserRole(user, ["admin", "moderator", "user"])) {
                    return res.status(403).json({
                        success: false,
                        message: 'غير مصرح لك بتنفيذ هذا الإجراء. ❌'
                    });
                }
                const existingUsername = usersDBManager.findRecord("users", { username: body.username.toLowerCase() });
                if (existingUsername && existingUsername.username !== user.username) {
                    return res.status(400).json({
                        success: false,
                        message: `اسم المستخدم محجوز ❌`
                    });
                }

                const existingEmail = usersDBManager.findRecord("users", { email: body.email.toLowerCase() });
                if (existingEmail && existingEmail.email !== user.email) {
                    return res.status(400).json({
                        success: false,
                        message: `البريد الإلكتروني مستخدم بالفعل ❌`
                    });
                }

                let newPassHash
                if (body?.password) {
                    const { hashedPassword } = await passwordHandler(body.password, 'hash');
                    newPassHash = hashedPassword;
                }
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                usersDBManager.updateRecord("users", "username", username, {
                    ...body,
                    user_id: user?.user_id,
                    hashedPassword: newPassHash ? newPassHash : user?.hashedPassword,
                    username: body?.username ? body?.username.toLowerCase() : user?.username,
                    email: body?.email ? body?.email.toLowerCase() : user?.email,
                    active: user?.active,
                    role: body?.role && (user.role === "admin" || user.role === "moderator") ? body.role : user.role,
                    created_at: user?.created_at,
                    updated_at: currentTime
                });

                res.status(200).json({
                    success: true,
                    message: `تم تحديث المستخدم id:${username} ✔️`
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // حذف مستخدم بواسطة المعرف
        router.delete('/users/:username', (req, res) => {
            try {
                const { headers, params } = req;
                const { username } = params;
                const user = usersDBManager.findRecord("users", { username: username.toLowerCase() });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${username.toLowerCase()}. ❌`
                    });
                }
                const existingUser = usersDBManager.findRecord("users", { username: config.ADMIN_USERNAME });
                if (!checkUserAuthentication(existingUser, headers)) {
                    return sendUnauthorizedResponse(res);
                }
                usersDBManager.deleteRecord("users", { username: username.toLowerCase() });
                res.status(200).json({
                    success: true,
                    message: `تم حذف المستخدم بالمعرف ${username.toLowerCase()} ✔️`
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

    } catch (error) {
        logError(error);
    }
};