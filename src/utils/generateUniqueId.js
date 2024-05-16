/**
 * Generates a unique ID consisting of alphanumeric characters.
 * @param {number} length - The length of the unique ID to be generated.
 * @returns {string} - The generated unique ID.
 */

export default function generateUniqueId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let uniqueId = '';
    for (let i = 0; i < length; i++) {
        uniqueId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uniqueId;
}