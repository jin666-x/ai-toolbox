import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET_NAME = "payment-proofs";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function getFileExt(fileName: string, mimeType: string) {
  const extFromName = fileName.split(".").pop()?.toLowerCase();

  if (extFromName && ["png", "jpg", "jpeg", "webp"].includes(extFromName)) {
    return extFromName === "jpeg" ? "jpg" : extFromName;
  }

  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";

  return "jpg";
}

export async function POST(req: Request) {
  try {
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

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "付款截图不能超过 5MB。" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = getFileExt(file.name, file.type);
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
      .slice(0, 40);

    const filePath = `proof-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeName || "payment"}.${ext}`;

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
