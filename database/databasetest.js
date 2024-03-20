import DatabaseManager from './DatabaseManager.js';
import path from 'path';



export default () => {

    // get the current working directory
    const __dirname = path.resolve();
    // مثال على الاستخدام:
    const dbFilePath = path.join(__dirname, 'mydatabase.db');
    const dbManager = new DatabaseManager(dbFilePath);
    dbManager.openDatabase();

    // // تعريف الجدول وإنشاؤه
    // const columns = {
    //     id: `${dbManager.DataTypes.INTEGER} PRIMARY KEY`,
    //     name: dbManager.DataTypes.TEXT,
    //     age: dbManager.DataTypes.INTEGER,
    //     github: dbManager.DataTypes.BOOLEAN
    // };
    // dbManager.createTable('users', columns);

    // // إضافة سجل جديد
    // const newUserId = dbManager.insertRecord('users', { name: 'Ry2n1 jj', age: 30, github: Number(true) });
    // console.log(`تمت إضافة مستخدم جديد بالمعرف: ${newUserId}`); 

    const jjjj = dbManager.browseTable("users", "name", "Ry2n1 ");

    console.log(jjjj);
    // لا تنسى إغلاق قاعدة البيانات عند الانتهاء من استخدامها
    dbManager.closeDatabase();
 

    
}