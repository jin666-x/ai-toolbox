import { createAdminClient } from "@/lib/supabase/admin";

type AuditMetadata = Record<string, unknown>;

type WriteAdminAuditLogParams = {
  req?: Request;
  adminEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  description?: string | null;
  metadata?: AuditMetadata;
};

function getClientIp(req?: Request) {
  if (!req) {
    return null;
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfIp = req.headers.get("cf-connecting-ip");

  if (cfIp) {
    return cfIp.trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return null;
}

function getUserAgent(req?: Request) {
  if (!req) {
    return null;
  }

  return req.headers.get("user-agent");
}

export function getAdminEmailFromRequest(req?: Request) {
  if (!req) {
    return null;
  }

  return req.headers.get("x-aibotpro-admin-email");
}

function safeMetadata(metadata?: AuditMetadata) {
  if (!metadata) {
    return {};
  }

  try {
    JSON.stringify(metadata);
    return metadata;
  } catch {
    return {
      warning: "metadata_not_serializable",
    };
  }
}

export async function writeAdminAuditLog(params: WriteAdminAuditLogParams) {
  try {
    const supabase = createAdminClient();

    const adminEmail =
      params.adminEmail ||
      getAdminEmailFromRequest(params.req) ||
      "admin_key";

    const { error } = await supabase.from("admin_audit_logs").insert({
      admin_email: adminEmail,
      action: params.action,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      description: params.description || null,
      metadata: safeMetadata(params.metadata),
      ip: getClientIp(params.req),
      user_agent: getUserAgent(params.req),
    });

    if (error) {
      console.error("写入后台操作日志失败：", error);
    }
  } catch (error) {
    // 日志写入失败不能影响主业务，例如审核开通、保存配置等。
    console.error("后台操作日志异常：", error);
  }
}
