import bcrypt from 'bcrypt';

/**
 * تنفذ عمليات تشفير ومقارنة كلمة المرور باستخدام bcrypt.
 * 
 * @param {string | { hashedPassword: string, plainPassword: string }} password - كلمة المرور أو الهاش المخزن.
 * @param {'hash' | 'compare'} action - الإجراء المطلوب (تشفير أو مقارنة).
 * @returns {Promise<{ hashedPassword?: string, isMatch?: boolean, error?: string }>} - كائن يحتوي على القيمة المطلوبة أو رسالة خطأ.
 * 
 * @example
 * // لتشفير كلمة المرور
 * (async () => {
 *   const result = await passwordHandler('myPlainPassword', 'hash');
 *   if (result.error) {
 *     console.error(result.error);
 *   } else {
 *     console.log('Hashed Password:', result.hashedPassword);
 *   }
 * })();
 * 
 * @example
 * // لمقارنة كلمة المرور
 * (async () => {
 *   const result = await passwordHandler({ hashedPassword: 'storedHashedPassword', plainPassword: 'myPlainPassword' }, 'compare');
 *   if (result.error) {
 *     console.error(result.error);
 *   } else {
 *     console.log('Password Match:', result.isMatch);
 *   }
 * })();
 */
export default async function passwordHandler(password, action) {
    const saltRounds = 10; // هذا يعني أن عملية التشفير ستجري عبر 10 دورات من التشفير، مما يجعل الكلمة المشفرة أكثر أمانًا.

    try {
        if (action === 'hash') {
            if (typeof password !== 'string') {
                throw new Error('Invalid password type for hashing');
            }
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return { hashedPassword };
        } else if (action === 'compare') {
            const { hashedPassword, plainPassword } = password;
            if (typeof hashedPassword !== 'string' || typeof plainPassword !== 'string') {
                throw new Error('Invalid password types for comparison');
            }
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return { isMatch };
        } else {
            throw new Error('Invalid action');
        }
    } catch (error) {
        return { error: error.message };
    }
}
