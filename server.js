import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import apiRoutes from './app/routes/api/index.js';
import JsonFileManager from './app/utils/JsonFileManager.js';
import initializeDatabases from './database/databaseInitializer.js';

// get the current working directory
const __dirname = path.resolve();

// قراءة تكوين الخادم:
const serverConfigManager = new JsonFileManager(path.join(__dirname, "./config/serverConfig.json"));
const serverConfig = serverConfigManager.readJson();

const app = express();
const port = serverConfig.PORT || 3000;
app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true }));



// توجيه الطلبات (routes)
apiRoutes(app);

// تقوم هذه الدالة بإنشاء قواعد البيانات المختلفة وجداولها.
initializeDatabases();


process.on('exit', () => {
    // أي كود تريد تنفيذه قبل إغلاق التطبيق - process.exit(0);
    console.log('Executing cleanup operations before exiting the application...');
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});