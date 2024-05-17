import passwordHandler from '../../../utils/passwordHandler.js';

export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {
        const {
            sendUnauthorizedResponse,
            getMissingFields,
            stripSensitiveFields,
            sendMissingFieldsResponse,
            validateAPIKeys,
            generateUniqueId
        } = utils;
        const { usersDBManager } = DBManager;
        usersDBManager.openDatabase();

        // الحصول على كل المستخدمين
        router.get('/users', (req, res) => {
            try {
                const { headers } = req;

                if (!validateAPIKeys({ config }, headers)) {
                    return sendUnauthorizedResponse(res);
                }

                const users = usersDBManager.getRecordsAll("users");

                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
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

                const existingUser = usersDBManager.findRecord("users", { username: body.username });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: `اسم المستخدم محجوز ❌`
                    });
                }

                const existingEmail = usersDBManager.findRecord("users", { email: body.email });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: `البريد الإلكتروني مستخدم بالفعل ❌`
                    });
                }

                const user_id = generateUniqueId(35);
                const apiKey = generateUniqueId(45);
                const { hashedPassword } = await passwordHandler(body.password, 'hash');
                // الوقت الحالي
                const currentTime = new Date().toISOString();

                usersDBManager.insertRecord("users", {
                    ...body,
                    user_id,
                    hashedPassword,
                    apiUsername: body.username,
                    apiKey,
                    active: false,
                    created_at: currentTime,
                    updated_at: currentTime,
                });

                res.status(200).json({
                    success: true,
                    user_id,
                    message: `تم إنشاء المستخدم @${body.username} ✔️`
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
                const user = usersDBManager.findRecord("users", { username: username });

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${username}. ❌`
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

                const user = usersDBManager.findRecord("users", { username: username });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${username}. ❌`
                    });
                }

                if (!validateAPIKeys({ user }, headers)) {
                    return sendUnauthorizedResponse(res);
                }

                const existingUsername = usersDBManager.findRecord("users", { username: body.username });
                if (existingUsername && existingUsername.username !== user.username) {
                    return res.status(400).json({
                        success: false,
                        message: `اسم المستخدم محجوز ❌`
                    });
                }

                const existingEmail = usersDBManager.findRecord("users", { email: body.email });
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
                const user = usersDBManager.findRecord("users", { username: username });

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${username}. ❌`
                    });
                }

                if (!validateAPIKeys({ user }, headers)) {
                    return sendUnauthorizedResponse(res);
                }

                usersDBManager.deleteRecord("users", { username: username });

                res.status(200).json({
                    success: true,
                    message: `تم حذف المستخدم بالمعرف ${username} ✔️`
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