/**
 * @class SessionManager
 * @description إدارة الجلسات باستخدام قاعدة بيانات SQLite
 */
class SessionManager {

    /**
     * @param {DatabaseManager} dbManager - قاعدة البيانات المستخدم
     */
    constructor(dbManager) {
        this.dbManager = dbManager;
        this.SESSIONS_TABLE = 'sessions';

    }
    /**
     * @function createSession
     * @description إنشاء جلسة جديدة للمستخدم
     * @param {Object} data - البيانات المتعلقة بالجلسة
     * @returns {string} sessionId - معرّف الجلسة الفريد
     */
    createSession(data) {
        const sessionId = this.generateSessionId();
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // جلسة لمدة 24 ساعة
        const dataString = JSON.stringify(data);
        this.dbManager.insertRecord(this.SESSIONS_TABLE, {
            session_id: sessionId,
            data: dataString,
            expires: expiresAt.toString()
        });
        return sessionId;
    }

    /**
     * @function getSession
     * @description استرجاع بيانات الجلسة بناءً على معرّف الجلسة
     * @param {string} sessionId - معرّف الجلسة
     * @returns {Object|null} - بيانات الجلسة إذا كانت صالحة، وإلا null
     */
    getSession(sessionId) {
        const session = this.dbManager.findRecord(this.SESSIONS_TABLE, {
            session_id: sessionId
        });
        if (session && parseInt(session.expires) > Date.now()) {
            return JSON.parse(session.data);
        }
        return null;
    }

    /**
     * @function destroySession
     * @description حذف جلسة بناءً على معرّف الجلسة
     * @param {string} sessionId - معرّف الجلسة
     */
    destroySession(sessionId) {
        this.dbManager.deleteRecord(this.SESSIONS_TABLE, {
            session_id: sessionId
        });
    }

    /**
     * @function generateSessionId
     * @description توليد معرّف فريد للجلسة
     * @returns {string} - معرّف فريد للجلسة
     */
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * @function cleanupExpiredSessions
     * @description التحقق من الجلسات المنتهية وحذفها من قاعدة البيانات
     */
    cleanupExpiredSessions() {
        const currentTime = Date.now();
        const statement = this.dbManager.db.prepare(`SELECT * FROM ${this.SESSIONS_TABLE} WHERE expires <= ?`);
        const expiredSessions = statement.all(currentTime);

        expiredSessions.forEach((session) => {
            this.destroySession(session.session_id);
        });
    }
}

export default SessionManager;