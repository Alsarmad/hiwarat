/**
 * تقوم هذه الدالة بإنشاء قواعد البيانات المختلفة وجداولها.
 * كل قاعدة بيانات يتم إنشاؤها باستخدام كائن `DatabaseManager` والدوال المناسبة.
 * يمكن استدعاء هذا الملف لإعداد وإنشاء جميع قواعد البيانات المختلفة وجداولها في تطبيقك.
 * 
 * @example
 * import './database/databaseInitializer.js';
 */

import 'dotenv/config';

import DatabaseManager from './DatabaseManager.js';
import path from 'node:path';
import fs from 'node:fs';
import {
    logError,
    logInfo
} from "../utils/logger.js";
import generateUniqueId from '../utils/generateUniqueId.js';
import passwordHandler from '../utils/passwordHandler.js';


// get the current working directory
const root = path.resolve(process.cwd());

// تعريف مسارات قواعد البيانات
const DBdir = path.join(root, "src", "database");
const usersDBPath = path.join(DBdir, 'users.db');
const postsDBPath = path.join(DBdir, 'posts.db');
const reportsDBPath = path.join(DBdir, 'reports.db');

// إنشاء كائنات DatabaseManager لكل قاعدة بيانات
const usersDBManager = new DatabaseManager(usersDBPath);
const postsDBManager = new DatabaseManager(postsDBPath);
const reportsDBManager = new DatabaseManager(reportsDBPath);

// قاعدة بيانات المستخدمين 
async function createUsersDatabase() {
    usersDBManager.openDatabase();

    // جدول المستخدمين (Users Table)
    usersDBManager.createTable('users', {
        user_id: usersDBManager.DataTypes.TEXT, // مُعرف فريد لكل مستخدم.
        username: usersDBManager.DataTypes.TEXT, // اسم المستخدم.
        full_name: usersDBManager.DataTypes.TEXT, // الاسم الكامل للمستخدم.
        email: usersDBManager.DataTypes.TEXT, // عنوان البريد الإلكتروني للمستخدم.
        password: usersDBManager.DataTypes.TEXT, // كلمة مرور المستخدم (ربما تكون مشفرة).
        hashedPassword: usersDBManager.DataTypes.TEXT, // كلمة مرور المستخدم مشفرة
        active: usersDBManager.DataTypes.INTEGER, // حالة تفعيل العضوية (true)=1 || (false)=0
        is_banned: usersDBManager.DataTypes.INTEGER, // حظر العضوية (true)=1 || (false)=0
        role: usersDBManager.DataTypes.TEXT, // دور المستخدم في النظام (Admin, Moderator, User, etc.).
        birthdate: usersDBManager.DataTypes.TEXT, // تاريخ ميلاد المستخدم.
        gender: usersDBManager.DataTypes.TEXT, // جنس المستخدم.
        location: usersDBManager.DataTypes.TEXT, // موقع المستخدم.
        bio: usersDBManager.DataTypes.TEXT, // نبذة عن المستخدم.
        phone: usersDBManager.DataTypes.TEXT, // هاتف عن المستخدم.
        profile_picture: usersDBManager.DataTypes.BLOB, // صورة الملف الشخصي للمستخدم.
        created_at: usersDBManager.DataTypes.TEXT, // تاريخ إنشاء الحساب.
        updated_at: usersDBManager.DataTypes.TEXT // تاريخ آخر تحديث للمعلومات.
    });

    // جدول جلسات المستخدمين (sessions Table)
    usersDBManager.createTable('sessions', {
        session_id: usersDBManager.DataTypes.TEXT, // مُعرف فريد لكل جلسة.
        data: usersDBManager.DataTypes.TEXT, // البيانات المخزنة للجلسة.
        expires: usersDBManager.DataTypes.TEXT, // تاريخ انتهاء صلاحية الجلسة.
    });


    // إنشاء مستخدم (admin) للوصول الكامل إلى جميع الميزات والوظائف.
    const {
        hashedPassword
    } = await passwordHandler(process.env.ADMIN_PASSWORD, 'hash');
    const currentTime = new Date().toISOString();
    usersDBManager.insertRecord("users", {
        user_id: generateUniqueId(35),
        username: process.env.ADMIN_USERNAME.toLowerCase(),
        full_name: process.env.ADMIN_FULL_NAME.toLowerCase(),
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        password: process.env.ADMIN_PASSWORD,
        hashedPassword,
        active: 1,
        is_banned: 0,
        role: "admin",
        created_at: currentTime,
        updated_at: currentTime,
    });

    usersDBManager.closeDatabase();
}

// قاعدة بيانات المنشورات
function createPostsDatabase() {
    postsDBManager.openDatabase();

    // جدول التعليقات (Comments Table)
    postsDBManager.createTable('comments', {
        comment_id: postsDBManager.DataTypes.TEXT, // مُعرف فريد لكل تعليق.
        post_id: postsDBManager.DataTypes.TEXT, // مُعرف للمنشور الذي يتعلق به التعليق.
        user_id: postsDBManager.DataTypes.TEXT, // مُعرف للمستخدم الذي قام بالتعليق.
        comment_content: postsDBManager.DataTypes.TEXT, // نص التعليق بتنسيق html.
        comment_content_raw: postsDBManager.DataTypes.TEXT, // نص التعليق بتنسيق raw (text).
        created_at: postsDBManager.DataTypes.TEXT, // تاريخ الإنشاء.
        updated_at: postsDBManager.DataTypes.TEXT // تاريخ آخر تحديث.
    });

    // جدول المنشورات (Posts Table)
    postsDBManager.createTable('posts', {
        post_id: postsDBManager.DataTypes.TEXT, // مُعرف فريد لكل منشور.
        user_id: postsDBManager.DataTypes.TEXT, // مُعرف للمستخدم الذي نشر المنشور.
        post_title: postsDBManager.DataTypes.TEXT, // عنوان المنشور
        post_content: postsDBManager.DataTypes.TEXT, // نص المنشور بتنسيق html.
        post_content_raw: postsDBManager.DataTypes.TEXT, // نص المنشور بتنسيق raw (text).
        hashtags: postsDBManager.DataTypes.TEXT, // هاشتاجات المنشور. مصفوفة Array
        is_pinned: postsDBManager.DataTypes.INTEGER, // هل المنشور مثبت أم لا
        created_at: postsDBManager.DataTypes.TEXT, // تاريخ الإنشاء.
        updated_at: postsDBManager.DataTypes.TEXT // تاريخ آخر تحديث.
    });

    // جدول الإعجابات (Likes Table)
    postsDBManager.createTable('likes', {
        like_id: postsDBManager.DataTypes.TEXT, // مُعرف فريد لكل إعجاب.
        user_id: postsDBManager.DataTypes.TEXT, // مُعرف للمستخدم الذي قام بالإعجاب.
        post_id: postsDBManager.DataTypes.TEXT, // مُعرف للمنشور الذي تم الإعجاب به.
        created_at: postsDBManager.DataTypes.TEXT, // تاريخ الإنشاء.
    });

    // جدول الهاشتاجات (Hashtags Table)
    postsDBManager.createTable('hashtags', {
        hashtag_id: postsDBManager.DataTypes.TEXT, // مُعرف فريد لكل هاشتاج.
        hashtag_text: postsDBManager.DataTypes.TEXT, // نص الهاشتاج.
        post_id: postsDBManager.DataTypes.TEXT, // مُعرف المنشور الخاص بالهاشتاج.
        created_at: postsDBManager.DataTypes.TEXT, // تاريخ الإنشاء.
    });

    // جدول المشاهدات (Views Table)
    postsDBManager.createTable('views', {
        post_id: postsDBManager.DataTypes.TEXT, // مُعرف للمنشور المرتبط بالمشاهدة.
        view_count: postsDBManager.DataTypes.INTEGER, // عدد المشاهدات على المنشور.
    });

    postsDBManager.closeDatabase();
}

// قاعدة بيانات البلاغات والمفضلة
function createReportsDatabase() {
    reportsDBManager.openDatabase();

    // جدول البلاغات (Reports Table)
    reportsDBManager.createTable('reports', {
        report_id: reportsDBManager.DataTypes.TEXT, // رقم مُعرف فريد لكل بلاغ.
        user_id: reportsDBManager.DataTypes.TEXT, // مُعرف للمستخدم الذي قام بالبلاغ.
        reported_item_type: reportsDBManager.DataTypes.TEXT, // نوع العنصر المُبلغ عنه منشور ام تعليق.
        reported_item_id: reportsDBManager.DataTypes.TEXT, // رقم مُعرف للعنصر المُبلغ عنه.
        report_type: reportsDBManager.DataTypes.TEXT, // نوع البلاغ (مثل: سُب، تحرش، إلخ).
        report_description: reportsDBManager.DataTypes.TEXT, // وصف البلاغ.
        created_at: reportsDBManager.DataTypes.TEXT, // تاريخ الإنشاء.
    });

    reportsDBManager.closeDatabase();
}

if (!fs.existsSync(usersDBPath)) {
    logInfo(`Database created: ${usersDBPath}`);
    await createUsersDatabase();
}
if (!fs.existsSync(postsDBPath)) {
    logInfo(`Database created: ${postsDBPath}`);
    createPostsDatabase();
}
if (!fs.existsSync(reportsDBPath)) {
    logInfo(`Database created: ${reportsDBPath}`);
    createReportsDatabase();
} else {
    logInfo("لقد تم إنشاء قواعد البيانات وجداولها مسبقاً ✔️");
}