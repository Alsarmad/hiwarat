/**
 * تقوم هذه الدالة بإنشاء قواعد البيانات المختلفة وجداولها.
 * كل قاعدة بيانات يتم إنشاؤها باستخدام كائن `DatabaseManager` والدوال المناسبة.
 * تعتمد هذه الدالة على الدوال `createUsersDatabase()`, `createPostsDatabase()`, 
 * `createRelMsgsDatabase()`, و `createReportsFavsDatabase()` لإنشاء قواعد البيانات.
 * يمكن استدعاء هذا الملف لإعداد وإنشاء جميع قواعد البيانات المختلفة وجداولها في تطبيقك.
 * 
 * @example
 * import './database/databaseInitializer.js';
 */

import DatabaseManager from './DatabaseManager.js';
import path from 'node:path';
import fs from 'node:fs';
import { logError, logInfo } from "../utils/logger.js";


// get the current working directory
const root = path.resolve(process.cwd());

// تعريف مسارات قواعد البيانات
const DBdir = path.join(root, "src", "database");
const usersDBPath = path.join(DBdir, 'users.db');
const postsDBPath = path.join(DBdir, 'posts.db');
const relMsgsDBPath = path.join(DBdir, 'relationships_messages.db');
const reportsFavsDBPath = path.join(DBdir, 'reports_favorites.db');

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
        user_id: usersDBManager.DataTypes.INTEGER,
        username: usersDBManager.DataTypes.TEXT,
        full_name: usersDBManager.DataTypes.TEXT,
        email: usersDBManager.DataTypes.TEXT,
        password: usersDBManager.DataTypes.TEXT,
        hashedPassword: usersDBManager.DataTypes.TEXT,
        apiUsername: usersDBManager.DataTypes.TEXT,
        apiKey: usersDBManager.DataTypes.TEXT,
        active: usersDBManager.DataTypes.TEXT,
        birthdate: usersDBManager.DataTypes.TEXT,
        gender: usersDBManager.DataTypes.TEXT,
        location: usersDBManager.DataTypes.TEXT,
        bio: usersDBManager.DataTypes.TEXT,
        profile_picture: usersDBManager.DataTypes.BLOB,
        created_at: usersDBManager.DataTypes.TEXT,
        updated_at: usersDBManager.DataTypes.TEXT
    });

    // جدول التسجيلات (Registrations Table)
    usersDBManager.createTable('registrations', {
        registration_id: usersDBManager.DataTypes.INTEGER,
        user_id: usersDBManager.DataTypes.INTEGER,
        registration_date: usersDBManager.DataTypes.TEXT,
        registration_type: usersDBManager.DataTypes.TEXT
    });

    // جدول الإعدادات (Settings Table)
    usersDBManager.createTable('settings', {
        setting_id: usersDBManager.DataTypes.INTEGER,
        user_id: usersDBManager.DataTypes.INTEGER,
        setting_name: usersDBManager.DataTypes.TEXT,
        setting_value: usersDBManager.DataTypes.TEXT
    });

    usersDBManager.closeDatabase();
}

// قاعدة بيانات المنشورات
function createPostsDatabase() {
    postsDBManager.openDatabase();

    // جدول التعليقات (Comments Table)
    postsDBManager.createTable('comments', {
        comment_id: postsDBManager.DataTypes.INTEGER,
        post_id: postsDBManager.DataTypes.INTEGER,
        user_id: postsDBManager.DataTypes.INTEGER,
        comment_text: postsDBManager.DataTypes.TEXT,
        comment_date: postsDBManager.DataTypes.TEXT
    });

    // جدول المنشورات (Posts Table)
    postsDBManager.createTable('posts', {
        post_id: postsDBManager.DataTypes.INTEGER,
        user_id: postsDBManager.DataTypes.INTEGER,
        post_text: postsDBManager.DataTypes.TEXT,
        post_date: postsDBManager.DataTypes.TEXT
    });

    // جدول الإعجابات (Likes Table)
    postsDBManager.createTable('likes', {
        like_id: postsDBManager.DataTypes.INTEGER,
        user_id: postsDBManager.DataTypes.INTEGER,
        post_id: postsDBManager.DataTypes.INTEGER,
        like_date: postsDBManager.DataTypes.TEXT
    });

    // جدول الهاشتاجات (Hashtags Table)
    postsDBManager.createTable('hashtags', {
        hashtag_id: postsDBManager.DataTypes.INTEGER,
        hashtag_text: postsDBManager.DataTypes.TEXT
    });

    // جدول الإحصائيات (Statistics Table)
    postsDBManager.createTable('statistics', {
        stat_id: postsDBManager.DataTypes.INTEGER,
        post_id: postsDBManager.DataTypes.INTEGER,
        likes_count: postsDBManager.DataTypes.INTEGER,
        comments_count: postsDBManager.DataTypes.INTEGER,
        shares_count: postsDBManager.DataTypes.INTEGER
    });

    // جدول الفئات (Categories Table)
    postsDBManager.createTable('categories', {
        category_id: postsDBManager.DataTypes.INTEGER,
        category_name: postsDBManager.DataTypes.TEXT,
        category_description: postsDBManager.DataTypes.TEXT
    });

    postsDBManager.closeDatabase();
}

// قاعدة بيانات العلاقات والرسائل
function createRelMsgsDatabase() {
    relMsgsDBManager.openDatabase();

    // جدول الإشعارات (Notifications Table)
    relMsgsDBManager.createTable('notifications', {
        notification_id: relMsgsDBManager.DataTypes.INTEGER,
        user_id: relMsgsDBManager.DataTypes.INTEGER,
        notification_text: relMsgsDBManager.DataTypes.TEXT,
        notification_date: relMsgsDBManager.DataTypes.TEXT
    });

    // جدول العلاقات بين المستخدمين (Relationships Table)
    relMsgsDBManager.createTable('relationships', {
        relationship_id: relMsgsDBManager.DataTypes.INTEGER,
        user1_id: relMsgsDBManager.DataTypes.INTEGER,
        user2_id: relMsgsDBManager.DataTypes.INTEGER,
        relationship_type: relMsgsDBManager.DataTypes.TEXT
    });

    // جدول الرسائل الخاصة (Messages Table)
    relMsgsDBManager.createTable('messages', {
        message_id: relMsgsDBManager.DataTypes.INTEGER,
        sender_id: relMsgsDBManager.DataTypes.INTEGER,
        receiver_id: relMsgsDBManager.DataTypes.INTEGER,
        message_text: relMsgsDBManager.DataTypes.TEXT,
        message_date: relMsgsDBManager.DataTypes.TEXT
    });

    relMsgsDBManager.closeDatabase();
}

// قاعدة بيانات البلاغات والمفضلة
function createReportsFavsDatabase() {
    reportsFavsDBManager.openDatabase();

    // جدول البلاغات (Reports Table)
    reportsFavsDBManager.createTable('reports', {
        report_id: reportsFavsDBManager.DataTypes.INTEGER,
        user_id: reportsFavsDBManager.DataTypes.INTEGER,
        reported_item_id: reportsFavsDBManager.DataTypes.INTEGER,
        report_type: reportsFavsDBManager.DataTypes.TEXT,
        report_description: reportsFavsDBManager.DataTypes.TEXT,
        report_date: reportsFavsDBManager.DataTypes.TEXT
    });

    // جدول المفضلة (Favorites Table)
    reportsFavsDBManager.createTable('favorites', {
        favorite_id: reportsFavsDBManager.DataTypes.INTEGER,
        user_id: reportsFavsDBManager.DataTypes.INTEGER,
        favorited_item_id: reportsFavsDBManager.DataTypes.INTEGER,
        favorited_item_type: reportsFavsDBManager.DataTypes.TEXT,
        favorite_date: reportsFavsDBManager.DataTypes.TEXT
    });

    reportsFavsDBManager.closeDatabase();
}

if (!fs.existsSync(usersDBPath)) {
    logError(`Database file not found: ${usersDBPath}`);
    createUsersDatabase();
}
if (!fs.existsSync(postsDBPath)) {
    logError(`Database file not found: ${postsDBPath}`);
    createPostsDatabase();
}
if (!fs.existsSync(relMsgsDBPath)) {
    logError(`Database file not found: ${relMsgsDBPath}`);
    createRelMsgsDatabase();
}
if (!fs.existsSync(reportsFavsDBPath)) {
    logError(`Database file not found: ${reportsFavsDBPath}`);
    createReportsFavsDatabase();
}
else {
    logInfo("لقد تم إنشاء قواعد البيانات وجداولها مسبقاً ✔️");
}