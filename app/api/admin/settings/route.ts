import { writeAdminAuditLog } from "@/lib/admin-audit-log";
import { createAdminClient } from "@/lib/supabase/admin";

type IncomingSetting = {
  setting_key?: unknown;
  setting_value?: unknown;
};

type SettingDefinition = {
  setting_key: string;
  setting_label: string;
  setting_group: "payment" | "pricing" | "general";
  setting_value: string;
  maxLength: number;
  type: "text" | "textarea" | "url" | "price";
};

const settingDefinitions: SettingDefinition[] = [
  {
    setting_key: "customer_wechat",
    setting_label: "客服微信",
    setting_group: "payment",
    setting_value: "请填写客服微信",
    maxLength: 80,
    type: "text",
  },
  {
    setting_key: "payment_notice",
    setting_label: "付款说明",
    setting_group: "payment",
    setting_value: "付款后请提交付款截图或填写已发客服微信。",
    maxLength: 300,
    type: "textarea",
  },
  {
    setting_key: "wechat_qr_url",
    setting_label: "微信收款二维码图片链接",
    setting_group: "payment",
    setting_value: "",
    maxLength: 500,
    type: "url",
  },
  {
    setting_key: "alipay_qr_url",
    setting_label: "支付宝收款二维码图片链接",
    setting_group: "payment",
    setting_value: "",
    maxLength: 500,
    type: "url",
  },
  {
    setting_key: "payment_account_name",
    setting_label: "收款人名称",
    setting_group: "payment",
    setting_value: "AI Bot Pro",
    maxLength: 80,
    type: "text",
  },
  {
    setting_key: "payment_remark_notice",
    setting_label: "付款备注提示",
    setting_group: "payment",
    setting_value: "付款时请备注你的登录邮箱，方便管理员核对。",
    maxLength: 300,
    type: "textarea",
  },
  {
    setting_key: "monthly_price",
    setting_label: "Pro 月卡价格",
    setting_group: "pricing",
    setting_value: "¥19.9",
    maxLength: 40,
    type: "price",
  },
  {
    setting_key: "yearly_price",
    setting_label: "Pro 年卡价格",
    setting_group: "pricing",
    setting_value: "¥199",
    maxLength: 40,
    type: "price",
  },
  {
    setting_key: "review_notice",
    setting_label: "审核说明",
    setting_group: "payment",
    setting_value: "管理员确认付款后会为账号开通 Pro 权限。",
    maxLength: 300,
    type: "textarea",
  },
  {
    setting_key: "site_announcement",
    setting_label: "网站公告",
    setting_group: "general",
    setting_value: "AI Bot Pro 正在持续升级中。",
    maxLength: 500,
    type: "textarea",
  },
];

const definitionMap = new Map(
  settingDefinitions.map((item) => [item.setting_key, item])
);

const defaultSettings = settingDefinitions.map((item) => ({
  setting_key: item.setting_key,
  setting_label: item.setting_label,
  setting_group: item.setting_group,
  setting_value: item.setting_value,
}));

function cleanBasicText(value: unknown) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim();
}

function validateSettingValue(definition: SettingDefinition, rawValue: unknown) {
  const value = cleanBasicText(rawValue);

  if (value.length > definition.maxLength) {
    return {
      ok: false as const,
      error: `${definition.setting_label} 不能超过 ${definition.maxLength} 个字符。`,
    };
  }

  if (/[<>]/.test(value)) {
    return {
      ok: false as const,
      error: `${definition.setting_label} 不能包含 < 或 > 字符。`,
    };
  }

  if (definition.type === "url") {
    if (!value) {
      return { ok: true as const, value: "" };
    }

    if (value.startsWith("/")) {
      if (value.startsWith("//") || /\s/.test(value)) {
        return {
          ok: false as const,
          error: `${definition.setting_label} 不是有效的图片链接。`,
        };
      }

      return { ok: true as const, value };
    }

    try {
      const url = new URL(value);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return {
          ok: false as const,
          error: `${definition.setting_label} 只支持 http 或 https 链接。`,
        };
      }

      return { ok: true as const, value: url.toString() };
    } catch {
      return {
        ok: false as const,
        error: `${definition.setting_label} 不是有效的图片链接。`,
      };
    }
  }

  if (definition.type === "price") {
    const priceLike = /^[¥￥$]?\s?\d+(\.\d{1,2})?(\s?元)?(\/月|\/年)?$/;

    if (value && !priceLike.test(value)) {
      return {
        ok: false as const,
        error: `${definition.setting_label} 格式不正确，建议填写类似 ¥19.9 或 ¥199。`,
      };
    }
  }

  return { ok: true as const, value };
}

async function ensureDefaultSettings() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("site_settings").upsert(
    defaultSettings.map((item) => ({
      ...item,
      updated_at: now,
    })),
    {
      onConflict: "setting_key",
      ignoreDuplicates: true,
    }
  );

  if (error) {
    throw error;
  }

  return supabase;
}

async function fetchSettings() {
  const supabase = createAdminClient();

  return supabase
    .from("site_settings")
    .select(
      "id, setting_key, setting_value, setting_label, setting_group, updated_at"
    )
    .order("setting_group", { ascending: true })
    .order("setting_key", { ascending: true });
}

export async function GET() {
  try {
    await ensureDefaultSettings();

    const { data, error } = await fetchSettings();

    if (error) {
      console.error("读取后台配置失败：", error);

      return Response.json({ error: "读取后台配置失败。" }, { status: 500 });
    }

    return Response.json({
      success: true,
      settings: data || [],
    });
  } catch (error) {
    console.error("后台配置接口错误：", error);

    return Response.json(
      {
        error: "服务器异常，请确认站点配置表和服务端配置是否正常。",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incomingSettings = body?.settings as IncomingSetting[];

    if (!Array.isArray(incomingSettings) || incomingSettings.length === 0) {
      return Response.json({ error: "缺少要保存的配置。" }, { status: 400 });
    }

    if (incomingSettings.length > settingDefinitions.length) {
      return Response.json(
        { error: "提交的配置项数量异常。" },
        { status: 400 }
      );
    }

    await ensureDefaultSettings();

    const seenKeys = new Set<string>();
    const now = new Date().toISOString();
    const updates: Array<{
      setting_key: string;
      setting_value: string;
      updated_at: string;
    }> = [];

    for (const item of incomingSettings) {
      const settingKey = cleanBasicText(item.setting_key);

      if (!settingKey) {
        return Response.json({ error: "存在空的配置项 key。" }, { status: 400 });
      }

      const definition = definitionMap.get(settingKey);

      if (!definition) {
        return Response.json(
          { error: `不允许保存未知配置项：${settingKey}` },
          { status: 400 }
        );
      }

      if (seenKeys.has(settingKey)) {
        return Response.json(
          { error: `配置项重复提交：${settingKey}` },
          { status: 400 }
        );
      }

      seenKeys.add(settingKey);

      const checked = validateSettingValue(definition, item.setting_value);

      if (!checked.ok) {
        return Response.json({ error: checked.error }, { status: 400 });
      }

      updates.push({
        setting_key: settingKey,
        setting_value: checked.value,
        updated_at: now,
      });
    }

    if (updates.length === 0) {
      return Response.json({ error: "没有可保存的配置项。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: beforeSettings } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")
      .in(
        "setting_key",
        updates.map((item) => item.setting_key)
      );

    const beforeMap = new Map(
      (beforeSettings || []).map((item) => [
        item.setting_key,
        item.setting_value,
      ])
    );

    const changedSettings = updates
      .map((item) => ({
        setting_key: item.setting_key,
        before: beforeMap.get(item.setting_key) ?? null,
        after: item.setting_value,
      }))
      .filter((item) => item.before !== item.after);

    for (const item of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          setting_value: item.setting_value,
          updated_at: item.updated_at,
        })
        .eq("setting_key", item.setting_key);

      if (error) {
        console.error("保存配置失败：", error);

        return Response.json(
          { error: `保存 ${item.setting_key} 失败。` },
          { status: 500 }
        );
      }
    }

    if (changedSettings.length > 0) {
      await writeAdminAuditLog({
        req,
        action: "update_settings",
        targetType: "site_settings",
        targetId: "global",
        description: "管理员修改站点配置。",
        metadata: {
          changedCount: changedSettings.length,
          changedSettings,
        },
      });
    }

    const { data, error } = await fetchSettings();

    if (error) {
      console.error("读取保存后的配置失败：", error);

      return Response.json(
        { error: "配置已保存，但读取最新配置失败。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "配置已保存。",
      settings: data || [],
    });
  } catch (error) {
    console.error("保存后台配置接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
