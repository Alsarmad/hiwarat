import passwordHandler from '../../../utils/passwordHandler.js';

export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {
        const {
            translationManager,
            rateLimit,
            getMissingFields,
            stripSensitiveFields,
            sendMissingFieldsResponse,
            checkUserAuthentication,
            checkUserRole,
            convertToBoolean,
            generateUniqueId,
            dataValidator,
        } = utils;
        const { usersDBManager, postsDBManager } = DBManager;
        const MAX_USERS_PER_PAGE = 20;
        const lang = config.defaultLang;

        // إعداد المحدد للطلبات مع رسالة مخصصة
        const createUserLimiter = rateLimit({
            windowMs: 24 * 60 * 60 * 1000, // 24 ساعة
            max: 5, // الحد الأقصى لعدد الطلبات لكل IP خلال نافذة الوقت المحددة
            handler: (req, res) => {
                const message = translationManager.translate('rate_limit_exceeded', {}, lang);
                res.status(429).json({
                    success: false,
                    message: message,
                });
            },
            headers: true,

        });

        // الحصول على كل المستخدمين
        router.get('/users', (req, res) => {
            try {
                const { query } = req;
                // تحديد عدد المستخدمين في كل صفحة
                let limit = parseInt(query.limit) || MAX_USERS_PER_PAGE;
                limit = Math.min(limit, MAX_USERS_PER_PAGE);

                if (parseInt(query.limit) > MAX_USERS_PER_PAGE) {
                    const message = translationManager.translate('max_users_per_page_exceeded', { max_users_per_page: MAX_USERS_PER_PAGE }, lang);
                    return res.status(400).json({
                        success: false,
                        message: message,
                    });
                }

                const page = parseInt(query.page) || 1; // رقم الصفحة المطلوبة
                const offset = (page - 1) * limit; // حساب النقطة التي يبدأ منها الاستعلام
                const users = usersDBManager.getRecordsPaginated("users", limit, offset);

                if (users.length === 0) {
                    const message = translationManager.translate('no_records_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        users: [],
                        message: message
                    });
                }

                return res.status(200).json({
                    success: true,
                    users: users.map(user => {
                        return {
                            ...stripSensitiveFields(user),
                            active: convertToBoolean(user.active),
                            is_banned: convertToBoolean(user.is_banned),
                        }
                    })
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // إنشاء مستخدم جديد
        router.post('/create-user', createUserLimiter, async (req, res) => {
            try {
                const { body } = req;
                const missingFields = getMissingFields(body, ["username", "full_name", "email", "password"]);
                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields);
                }

                // التحقق من البيانات المدخلة
                const validation = dataValidator.validate(body);
                if (!validation.success) {
                    return res.status(400).json({
                        success: false,
                        message: validation.message,
                    });
                }

                // إذا تم التحقق من جميع الشروط، يمكنك متابعة عملية إنشاء المستخدم

                // التحقق من البريد الإلكتروني واسم المستخدم غير محجوزين بالفعل
                const existingUser = usersDBManager.findRecord("users", { username: body.username.toLowerCase() });
                if (existingUser) {
                    const message = translationManager.translate('username_taken', {}, lang);
                    return res.status(400).json({
                        success: false,
                        message: message
                    });
                }
                const existingEmail = usersDBManager.findRecord("users", { email: body.email.toLowerCase() });
                if (existingEmail) {
                    const message = translationManager.translate('email_taken', {}, lang);
                    return res.status(400).json({
                        success: false,
                        message: message
                    });
                }

                // تشفير كلمة المرور
                const { hashedPassword } = await passwordHandler(body.password, 'hash');
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                const dataUser = {
                    user_id: generateUniqueId(35),
                    username: body?.username.toLowerCase(),
                    full_name: body?.full_name ? body.full_name : null,
                    email: body.email.toLowerCase(),
                    password: body.password,
                    hashedPassword: hashedPassword,
                    active: 0,
                    is_banned: 0,
                    role: "user",
                    birthdate: body?.birthdate ? body.birthdate : null,
                    gender: body?.gender ? body.gender : null,
                    location: body?.location ? body.location : null,
                    bio: body?.bio ? body.bio : null,
                    phone: body?.phone ? body.phone : null,
                    profile_picture: body?.profile_picture ? body.profile_picture : null,
                    created_at: currentTime,
                    updated_at: currentTime
                }
                usersDBManager.insertRecord("users", dataUser);
                const message = translationManager.translate('user_created', { username: body.username.toLowerCase() }, lang);
                res.status(200).json({
                    success: true,
                    user: {
                        ...stripSensitiveFields(dataUser),
                        active: convertToBoolean(dataUser.active),
                        is_banned: convertToBoolean(dataUser.active),
                    },
                    message: message
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على مستخدم بواسطة المعرف
        router.get('/users/:username', (req, res) => {
            try {
                const { username } = req.params;
                if (username && username.length > 50) {
                    const message = translationManager.translate('username_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }
                // البحث عن المستخدم بواسطة user_id
                let user = usersDBManager.findRecord("users", { user_id: username });

                // إذا لم يتم العثور، يبحث بواسطة username
                if (!user) {
                    user = usersDBManager.findRecord("users", { username: username.toLowerCase() });
                }

                if (!user) {
                    const message = translationManager.translate('user_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }
                return res.status(200).json({
                    success: true,
                    user: {
                        ...stripSensitiveFields(user),
                        active: convertToBoolean(user.active),
                        is_banned: convertToBoolean(user.is_banned),
                    }
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // تحديث مستخدم بواسطة اسم المستخدم
        router.put('/users/:username', async (req, res) => {
            try {
                const { headers, body, params } = req;
                const { username } = params;

                if (username && username.length > 50) {
                    const message = translationManager.translate('username_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                // التحقق من المصادقة باستخدام اسم المستخدم وكلمة المرور
                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                // البحث عن المستخدم بواسطة user_id
                let user = usersDBManager.findRecord("users", { user_id: username });

                // إذا لم يتم العثور، يبحث بواسطة username
                if (!user) {
                    user = usersDBManager.findRecord("users", { username: username.toLowerCase() });
                }
                if (!user) {
                    const message = translationManager.translate('user_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من صلاحية المستخدم لتحديث بينات المستخدم
                const isOwner = authResult.user.user_id === user.user_id;
                const isAdmin = checkUserRole(authResult.user, ["admin"]);
                const isBanned = convertToBoolean(authResult.user.is_banned); // تأكد من حالة الحظر للمستخدم

                // تحقق من حالة الحظر أولاً
                if (isBanned) {
                    const message = translationManager.translate('user_banned', { requester: authResult.user.username, username: username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // بعد التأكد من أن المستخدم غير محظور، قم بالتحقق من صلاحيات الوصول
                if (!(isOwner || isAdmin)) {
                    const message = translationManager.translate('not_authorized', { username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من البيانات المدخلة
                const validation = dataValidator.validate(body);
                if (!validation.success) {
                    return res.status(400).json({
                        success: false,
                        message: validation.message,
                    });
                }

                // التحقق من اسم المستخدم المطلوب ليس محجوزاً
                const existingUsername = usersDBManager.findRecord("users", { username: body?.username?.toLowerCase() });
                if (existingUsername && existingUsername.username !== user.username) {
                    const message = translationManager.translate('username_taken', {}, lang);
                    return res.status(400).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من أن البريد الإلكتروني المطلوب غير مستخدم بالفعل
                const existingEmail = usersDBManager.findRecord("users", { email: body?.email?.toLowerCase() });
                if (existingEmail && existingEmail.email !== user.email) {
                    const message = translationManager.translate('email_taken', {}, lang);
                    return res.status(400).json({
                        success: false,
                        message: message
                    });
                }

                // تشفير كلمة المرور إذا تم إرسالها للتحديث
                let newPassHash;
                if (body?.password) {
                    const { hashedPassword } = await passwordHandler(body.password, 'hash');
                    newPassHash = hashedPassword;
                }

                // الوقت الحالي
                const currentTime = new Date().toISOString();
                const updatedUser = {
                    user_id: user.user_id,
                    username: body?.username ? body.username.toLowerCase() : user.username,
                    full_name: body?.full_name ? body.full_name : user?.full_name,
                    email: body?.email ? body.email.toLowerCase() : user.email,
                    password: body?.password ? body.password : user.password, // سيتم حذفها
                    hashedPassword: newPassHash ? newPassHash : user.hashedPassword,
                    active: body?.active && (authResult.user.role === "admin") ? body.active ? 1 : 0 : user.active,
                    is_banned: body?.is_banned && (authResult.user.role === "admin") ? body.is_banned ? 1 : 0 : user.is_banned,
                    role: body?.role && (authResult.user.role === "admin") ? body.role.toLowerCase() : user.role,
                    birthdate: body?.birthdate ? body.birthdate : user.birthdate,
                    gender: body?.gender ? body.gender : user.gender,
                    location: body?.location ? body.location : user.location,
                    bio: body?.bio ? body.bio : user.bio,
                    phone: body?.phone ? body.phone : user.phone,
                    profile_picture: body?.profile_picture ? body.profile_picture : user.profile_picture,
                    created_at: user.created_at,
                    updated_at: currentTime
                }
                // تحديث المستخدم في قاعدة البيانات
                usersDBManager.updateRecord("users", { username: username }, updatedUser);

                // إرسال استجابة بنجاح التحديث
                const message = translationManager.translate('user_updated', { username }, lang);
                res.status(200).json({
                    success: true,
                    user: {
                        ...updatedUser,
                        active: convertToBoolean(updatedUser.active),
                        is_banned: convertToBoolean(updatedUser.is_banned),
                    },
                    message: message
                });
            } catch (error) {
                console.log(error);
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });


        // حذف مستخدم بواسطة اسم المستخدم
        router.delete('/users/:username', async (req, res) => {
            try {
                const { headers, params } = req;
                const { username } = params;
                if (username && username.length > 50) {
                    const message = translationManager.translate('username_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }
                // البحث عن المستخدم بواسطة user_id
                let user = usersDBManager.findRecord("users", { user_id: username });

                // إذا لم يتم العثور، يبحث بواسطة username
                if (!user) {
                    user = usersDBManager.findRecord("users", { username: username.toLowerCase() });
                }
                if (!user) {
                    const message = translationManager.translate('user_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من المصادقة باستخدام اسم المستخدم وكلمة المرور
                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                // التحقق من صلاحيات المستخدم لحذف المستخدم
                if (!checkUserRole(authResult.user, ["admin"])) {
                    const message = translationManager.translate('action_not_authorized', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                usersDBManager.deleteRecord("users", { username: username.toLowerCase() });

                const postRecords = postsDBManager.findRecordAll("posts", "user_id", user.user_id);
                postRecords.forEach(post => {
                    // حذف المنشورات من قاعدة البيانات
                    postsDBManager.deleteRecord("posts", { post_id: post.post_id });
                    // حذف التعليقات المرتبطة بالمنشورات من قاعدة البيانات
                    postsDBManager.deleteRecord("comments", { post_id: post.post_id });
                    // حذف الهاشتاقات المرتبطة بالمنشورات من قاعدة البيانات
                    postsDBManager.deleteRecord("hashtags", { post_id: post.post_id });

                });

                const message = translationManager.translate('user_deleted', { username: username.toLowerCase() }, lang);
                res.status(200).json({
                    success: true,
                    user: user,
                    message: message
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
};