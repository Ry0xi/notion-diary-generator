"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@notionhq/client");
const dayjs_1 = __importDefault(require("dayjs"));
const ja_1 = __importDefault(require("dayjs/locale/ja"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.locale(ja_1.default);
const notion = new client_1.Client({
    auth: process.env.NOTION_API_KEY
});
const DATABASE_ID = process.env.DATABASE_ID || "";
const now = (0, dayjs_1.default)().tz("Asia/Tokyo");
const YYYYMMDD = now.format("YYYY-MM-DD");
const YYYYMMDDdd = now.format("YYYY月MM日DD(ddd)");
(async () => {
    const alreadyExist = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
            property: "Name",
            title: {
                equals: YYYYMMDDdd,
            },
        },
    });
    if (alreadyExist.results.length !== 0) {
        console.log("すでに作成されています");
        return;
    }
    try {
        await notion.pages.create({
            parent: {
                database_id: DATABASE_ID,
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: YYYYMMDDdd,
                            },
                        },
                    ],
                },
                Date: {
                    type: "date",
                    date: {
                        start: YYYYMMDD,
                        end: null,
                    },
                },
            },
        });
        console.log("diary generated.");
    }
    catch (e) {
        console.log(e);
    }
})();
//# sourceMappingURL=index.js.map