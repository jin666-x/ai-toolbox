import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const BUCKET_NAME = "payment-proofs";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function getImageExt(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/jpeg") return "jpg";

  return null;
}

function isValidImageBuffer(buffer: Buffer, mimeType: string) {
  const isPng =
    mimeType === "image/png" &&
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  const isJpeg =
    mimeType === "image/jpeg" &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isWebp =
    mimeType === "image/webp" &&
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isPng || isJpeg || isWebp;
}

function getSafeImageExt(buffer: Buffer, mimeType: string) {
  if (!isValidImageBuffer(buffer, mimeType)) {
    return null;
  }

  return getImageExt(mimeType);
}

function getUploadPath(ext: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${today}/proof-${Date.now()}-${randomUUID()}.${ext}`;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const minuteLimit = checkRateLimit(`upload-payment-proof:minute:${ip}`, {
      limit: 3,
      windowMs: 60 * 1000,
    });

    if (!minuteLimit.allowed) {
      return rateLimitResponse(minuteLimit.resetAt);
    }

    const hourLimit = checkRateLimit(`upload-payment-proof:hour:${ip}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });

    if (!hourLimit.allowed) {
      return rateLimitResponse(hourLimit.resetAt);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "请上传付款截图文件。" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "付款截图只支持 PNG、JPG、WEBP 图片。" },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return Response.json(
        { error: "付款截图文件不能为空。" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "付款截图不能超过 5MB。" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = getSafeImageExt(buffer, file.type);

    if (!ext) {
      return Response.json(
        { error: "付款截图文件内容不是有效的 PNG、JPG 或 WEBP 图片。" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const filePath = getUploadPath(ext);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("上传付款截图失败：", uploadError);

      return Response.json(
        {
          error:
            "上传付款截图失败，请确认 Supabase Storage 已创建 payment-proofs 桶。",
        },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return Response.json({
      success: true,
      path: filePath,
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("付款截图上传接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
