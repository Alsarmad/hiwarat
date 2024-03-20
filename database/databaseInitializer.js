import DatabaseManager from './DatabaseManager.js';
import path from 'path';


// get the current working directory
const __dirname = path.resolve();

// تعريف مسارات قواعد البيانات
const usersDBPath = path.join(__dirname, "database", 'users.db');
const postsDBPath = path.join(__dirname, "database", 'posts.db');
const relMsgsDBPath = path.join(__dirname, "database", 'relationships_messages.db');
const reportsFavsDBPath = path.join(__dirname, "database", 'reports_favorites.db');

// إنشاء كائنات DatabaseManager لكل قاعدة بيانات
const usersDBManager = new DatabaseManager(usersDBPath);
const postsDBManager = new DatabaseManager(postsDBPath);
const relMsgsDBManager = new DatabaseManager(relMsgsDBPath);
const reportsFavsDBManager = new DatabaseManager(reportsFavsDBPath);

// قاعدة بيانات المستخدمين 
function createUsersDatabase() {
    usersDBManager.openDatabase();

    // جدول المستخدمين (Users Table)
    usersDBManager.createTable('users', {
        user_id: usersDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل مستخدم.
        username: usersDBManager.DataTypes.TEXT, // اسم المستخدم.
        email: usersDBManager.DataTypes.TEXT, // عنوان البريد الإلكتروني للمستخدم.
        password: usersDBManager.DataTypes.TEXT, // كلمة مرور المستخدم (ربما تكون مشفرة).
        full_name: usersDBManager.DataTypes.TEXT, // الاسم الكامل للمستخدم.
        birthdate: usersDBManager.DataTypes.TEXT, // تاريخ ميلاد المستخدم.
        gender: usersDBManager.DataTypes.TEXT, // جنس المستخدم.
        location: usersDBManager.DataTypes.TEXT, // موقع المستخدم.
        bio: usersDBManager.DataTypes.TEXT, // نبذة عن المستخدم.
        profile_picture: usersDBManager.DataTypes.BLOB, // صورة الملف الشخصي للمستخدم.
        created_at: usersDBManager.DataTypes.TEXT, // تاريخ إنشاء الحساب.
        updated_at: usersDBManager.DataTypes.TEXT // تاريخ آخر تحديث للمعلومات.
    });

    // جدول التسجيلات (Registrations Table)
    usersDBManager.createTable('registrations', {
        registration_id: usersDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل عملية تسجيل.
        user_id: usersDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم المسجل.
        registration_date: usersDBManager.DataTypes.TEXT, // تاريخ عملية التسجيل.
        registration_type: usersDBManager.DataTypes.TEXT // نوع عملية التسجيل (مثلاً: تسجيل دخول، تسجيل خروج، إنشاء حساب جديد، إلخ).
    });

    // جدول الإعدادات (Settings Table)
    usersDBManager.createTable('settings', {
        setting_id: usersDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل إعداد.
        user_id: usersDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم المرتبط بالإعداد.
        setting_name: usersDBManager.DataTypes.TEXT, // اسم الإعداد.
        setting_value: usersDBManager.DataTypes.TEXT // قيمة الإعداد.
    });


    usersDBManager.closeDatabase();
}

// قاعدة بيانات المنشورات
function createPostsDatabase() {
    postsDBManager.openDatabase();

    // جدول التعليقات (Comments Table)
    postsDBManager.createTable('comments', {
        comment_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل تعليق.
        post_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف للمنشور الذي يتعلق به التعليق.
        user_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم الذي قام بالتعليق.
        comment_text: postsDBManager.DataTypes.TEXT, // نص التعليق.
        comment_date: postsDBManager.DataTypes.TEXT // تاريخ نشر التعليق.
    });

    // جدول المنشورات (Posts Table)
    postsDBManager.createTable('posts', {
        post_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل منشور.
        user_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم الذي نشر المنشور.
        post_text: postsDBManager.DataTypes.TEXT, // نص المنشور.
        post_date: postsDBManager.DataTypes.TEXT // تاريخ نشر المنشور.
    });

    // جدول الإعجابات (Likes Table)
    postsDBManager.createTable('likes', {
        like_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل إعجاب.
        user_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم الذي قام بالإعجاب.
        post_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف للمنشور الذي تم الإعجاب به.
        like_date: postsDBManager.DataTypes.TEXT // تاريخ الإعجاب.
    });

    // جدول الهاشتاجات (Hashtags Table)
    postsDBManager.createTable('hashtags', {
        hashtag_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل هاشتاج.
        hashtag_text: postsDBManager.DataTypes.TEXT // نص الهاشتاج.
    });

    // جدول الإحصائيات (Statistics Table)
    postsDBManager.createTable('statistics', {
        stat_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل إحصائية.
        post_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف للمنشور المرتبط بالإحصائية.
        likes_count: postsDBManager.DataTypes.INTEGER, // عدد الإعجابات على المنشور.
        comments_count: postsDBManager.DataTypes.INTEGER, // عدد التعليقات على المنشور.
        shares_count: postsDBManager.DataTypes.INTEGER // عدد المشاركات على المنشور.
    });

    // جدول الفئات (Categories Table)
    postsDBManager.createTable('categories', {
        category_id: postsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل فئة.
        category_name: postsDBManager.DataTypes.TEXT, // اسم الفئة.
        category_description: postsDBManager.DataTypes.TEXT // وصف الفئة.
    });

    postsDBManager.closeDatabase();
}

// قاعدة بيانات العلاقات والرسائل
function createRelMsgsDatabase() {
    relMsgsDBManager.openDatabase();

    // جدول الإشعارات (Notifications Table)
    relMsgsDBManager.createTable('notifications', {
        notification_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل إشعار.
        user_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم المستلم للإشعار.
        notification_text: relMsgsDBManager.DataTypes.TEXT, // نص الإشعار.
        notification_date: relMsgsDBManager.DataTypes.TEXT // تاريخ الإشعار.
    });

    // جدول العلاقات بين المستخدمين (Relationships Table)
    relMsgsDBManager.createTable('relationships', {
        relationship_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل علاقة.
        user1_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف لأحد المستخدمين في العلاقة.
        user2_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم الآخر في العلاقة.
        relationship_type: relMsgsDBManager.DataTypes.TEXT // نوع العلاقة (مثل: صديق، متابع، إلخ).
    });

    // جدول الرسائل الخاصة (Messages Table)
    relMsgsDBManager.createTable('messages', {
        message_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل رسالة.
        sender_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف للمرسل للرسالة.
        receiver_id: relMsgsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستقبل للرسالة.
        message_text: relMsgsDBManager.DataTypes.TEXT, // نص الرسالة.
        message_date: relMsgsDBManager.DataTypes.TEXT // تاريخ الرسالة.
    });

    relMsgsDBManager.closeDatabase();
}

// قاعدة بيانات البلاغات والمفضلة
function createReportsFavsDatabase() {
    reportsFavsDBManager.openDatabase();

    // جدول البلاغات (Reports Table)
    reportsFavsDBManager.createTable('reports', {
        report_id: reportsFavsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل بلاغ.
        user_id: reportsFavsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم الذي قام بالبلاغ.
        reported_item_id: reportsFavsDBManager.DataTypes.INTEGER, // رقم مُعرف للعنصر المُبلغ عنه.
        report_type: reportsFavsDBManager.DataTypes.TEXT, // نوع البلاغ (مثل: سُب، تحرش، إلخ).
        report_description: reportsFavsDBManager.DataTypes.TEXT, // وصف البلاغ.
        report_date: reportsFavsDBManager.DataTypes.TEXT // تاريخ البلاغ.
    });

    // جدول المفضلة (Favorites Table)
    reportsFavsDBManager.createTable('favorites', {
        favorite_id: reportsFavsDBManager.DataTypes.INTEGER, // رقم مُعرف فريد لكل عنصر مفضل.
        user_id: reportsFavsDBManager.DataTypes.INTEGER, // رقم مُعرف للمستخدم الذي قام بإضافة العنصر للمفضلة.
        favorited_item_id: reportsFavsDBManager.DataTypes.INTEGER, // رقم مُعرف للعنصر المُضاف للمفضلة.
        favorited_item_type: reportsFavsDBManager.DataTypes.TEXT, // نوع العنصر المُضاف للمفضلة (مثل: منشور، تعليق، إلخ).
        favorite_date: reportsFavsDBManager.DataTypes.TEXT // تاريخ إضافة العنصر للمفضلة.
    });

    reportsFavsDBManager.closeDatabase();
}

/**
 * تقوم هذه الدالة بإنشاء قواعد البيانات المختلفة وجداولها.
 * كل قاعدة بيانات يتم إنشاؤها باستخدام كائن `DatabaseManager` والدوال المناسبة.
 * تعتمد هذه الدالة على الدوال `createUsersDatabase()`, `createPostsDatabase()`, 
 * `createRelMsgsDatabase()`, و `createReportsFavsDatabase()` لإنشاء قواعد البيانات.
 * يمكن استدعاء هذه الدالة لإعداد وإنشاء جميع قواعد البيانات المختلفة وجداولها في تطبيقك.
 * @returns {void}
 */
export default function initializeDatabases() {
    createUsersDatabase();
    createPostsDatabase();
    createRelMsgsDatabase();
    createReportsFavsDatabase();
}