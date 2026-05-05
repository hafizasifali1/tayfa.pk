"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const node_postgres_1 = require("drizzle-orm/node-postgres");
const mysql2_1 = require("drizzle-orm/mysql2");
const pg_1 = require("pg");
const promise_1 = __importDefault(require("mysql2/promise"));
const schema = __importStar(require("./schema"));
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.warn('DATABASE_URL is not set. Database features will be disabled.');
}
// ✅ Declare dbInstance
let dbInstance;
exports.pool = dbUrl?.startsWith('mysql')
    ? promise_1.default.createPool({
        uri: dbUrl,
        ssl: dbUrl.includes('localhost') ? undefined : { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
    })
    : null;
if (exports.pool && dbUrl?.startsWith('mysql')) {
    dbInstance = (0, mysql2_1.drizzle)(exports.pool, { schema, mode: 'default' });
}
else if (dbUrl) {
    const pgPool = new pg_1.Pool({
        connectionString: dbUrl,
        max: 10,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    dbInstance = (0, node_postgres_1.drizzle)(pgPool, { schema });
}
else {
    dbInstance = null;
}
exports.db = dbInstance;
