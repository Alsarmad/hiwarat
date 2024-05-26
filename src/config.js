import path from "node:path";
import fs from "node:fs";

const root = path.resolve(process.cwd()); // project root directory (./)
const port = process.env.PORT || 3000;
const domain = `http://127.0.0.1:${port}`; // remove process.env.PORT in production
const packageRead = fs.readFileSync(path.join(root, "package.json"));
const packageJson = JSON.parse(packageRead);

export const config = {

    // الإصدار
    version: packageJson.version,

    /* Server */
    port: port,
    domain: domain,
    defaultLang: process.env.DEFAULTLANG || "en",

    /* Config Api */
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

    /* Config Website */
    website_name: process.env.WEBSITE_NAME,

    /* Helmet */
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "*"],
                fontSrc: ["'self'", "*"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'", "*"],
                frameSrc: ["'self'", "https://www.youtube.com"],
                childSrc: ["'self'"],
                connectSrc: ["'self'", "*"],
                workerSrc: ["'self'", "blob:"],
                manifestSrc: ["'self'"],
            },
        },
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: false,
        originAgentCluster: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        strictTransportSecurity: { maxAge: 63072000, includeSubDomains: true },
        xContentTypeOptions: true,
        xDnsPrefetchControl: { allow: true },
        xDownloadOptions: true,
        xFrameOptions: { action: "sameorigin" },
        xPermittedCrossDomainPolicies: { permittedPolicies: "none" },
        xXssProtection: false,
    },

    /* Body Parser */
    bodyParser: {
        extended: true,
        limit: "50kb", // body limit
    },

    /* Compression */
    compression: {
        level: 6,
        threshold: 1000,
        memLevel: 8,
    },

    /* Paths */
    paths: {
        root: root,
        logs: path.join(root, "src", "logs"),
        views: path.join(root, "src", "views"),
        public: path.join(root, "src", "public"),
        favicon: path.join(root, "src", "public", "favicon.ico"),
        database: path.join(root, "src", "database")
    },
}