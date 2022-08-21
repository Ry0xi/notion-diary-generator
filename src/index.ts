import { Client } from "@notionhq/client";
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import dayjs from "dayjs";
import ja from "dayjs/locale/ja";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { DiaryAlreadyExistError } from "./errors/diary-already-exist-error";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(ja);
const YYYYMMDD_FORMAT = "YYYY-MM-DD";
const YYYYMMDDdd_FORMAT = "YYYY年MM月DD日(ddd)";

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});
const DIARY_DATABASE_ID: string = process.env.DIARY_DATABASE_ID || "";
const now = dayjs().tz("Asia/Tokyo");

// TODO: Diary DBとDone DBで環境変数を設定
// TODO: Done DBのFilterのDiaryを作成したレコードに設定する

generateDiary(now)
  .then((created: CreatePageResponse) => console.log("A new diary is created."))
  .catch((e: unknown) => {
    if (e instanceof DiaryAlreadyExistError) {
      console.log("すでに作成されています");
    } else {
      console.log(e);
      process.exit(1);
    }
  });

async function generateDiary(date:dayjs.Dayjs): Promise<CreatePageResponse> {
  const dateYYYYMMDD = date.format(YYYYMMDD_FORMAT);
  const dateYYYYMMDDdd = date.format(YYYYMMDDdd_FORMAT);
  const propertyNameTitle = "Title";
  const propertyNameDate = "Date";

  const alreadyExist = await notion.databases.query({
    database_id: DIARY_DATABASE_ID,
    filter: {
      property: propertyNameTitle,
      title: {
        equals: dateYYYYMMDDdd,
      },
    },
  });

  if (alreadyExist.results.length !== 0) {
    throw new DiaryAlreadyExistError;
  }

  try {
    return await notion.pages.create({
      parent: {
        database_id: DIARY_DATABASE_ID,
      },
      properties: {
        [propertyNameTitle]: {
          title: [
            {
              text: {
                content: dateYYYYMMDDdd,
              },
            },
          ],
        },
        [propertyNameDate]: {
          type: "date",
          date: {
            start: dateYYYYMMDD,
            end: null,
          },
        },
      },
    });
  } catch (e) {
    throw e;
  }
}
