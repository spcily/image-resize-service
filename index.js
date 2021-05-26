const sharp = require("sharp");
const axios = require("axios");
const Koa = require("koa");
const Router = require("@koa/router");
const app = new Koa();
const router = new Router();
const dotenv = require("dotenv");
dotenv.config();

router.get("/resize", async (ctx, next) => {
  if (!ctx.request.query.url) {
    ctx.status = 400;
    ctx.body = "invalid param";
    return;
  }
  const { w: width, h: height } = ctx.request.query;
  if (!!width) {
    const downloaded = await axios.get(ctx.request.query.url, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(downloaded.data, "utf-8");
    const image = sharp(buffer);
    const metadata = await image.metadata();
    image.resize(parseInt(width, 10), !!height ? parseInt(height, 10) : null);
    ctx.type = "image/" + metadata.format;
    ctx.body = await image.toBuffer();
  } else {
    ctx.status = 400;
    ctx.body = "invalid param";
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(process.env.PORT);
