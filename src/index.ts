import { Client } from "@notionhq/client";
import dayjs from "dayjs";
import ja from "dayjs/locale/ja";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(ja);

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});
const DATABASE_ID: string = process.env.DATABASE_ID || "";
const now = dayjs().tz("Asia/Tokyo");
const YYYYMMDD = now.format("YYYY-MM-DD");
const YYYYMMDDdd = now.format("YYYY年MM月DD日(ddd)");

(async () => {
  const alreadyExist = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "Title",
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
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
