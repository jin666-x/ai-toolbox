import { createAdminClient } from "@/lib/supabase/admin";

type IncomingSetting = {
  setting_key?: string;
  setting_value?: string;
};

const defaultSettings = [
  {
    setting_key: "customer_wechat",
    setting_label: "客服微信",
    setting_group: "payment",
    setting_value: "请填写客服微信",
  },
  {
    setting_key: "payment_notice",
    setting_label: "付款说明",
    setting_group: "payment",
    setting_value: "付款后请提交付款截图或填写已发客服微信。",
  },
  {
    setting_key: "monthly_price",
    setting_label: "Pro 月卡价格",
    setting_group: "pricing",
    setting_value: "¥19.9",
  },
  {
    setting_key: "yearly_price",
    setting_label: "Pro 年卡价格",
    setting_group: "pricing",
    setting_value: "¥199",
  },
  {
    setting_key: "review_notice",
    setting_label: "审核说明",
    setting_group: "payment",
    setting_value: "管理员确认付款后会为账号开通 Pro 权限。",
  },
  {
    setting_key: "site_announcement",
    setting_label: "网站公告",
    setting_group: "general",
    setting_value: "AI Bot Pro 正在持续升级中。",
  },
];

async function ensureDefaultSettings() {
  const supabase = createAdminClient();

  const { error } = await supabase.from("site_settings").upsert(
    defaultSettings.map((item) => ({
      ...item,
      updated_at: new Date().toISOString(),
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

export async function GET() {
  try {
    const supabase = await ensureDefaultSettings();

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "id, setting_key, setting_value, setting_label, setting_group, updated_at"
      )
      .order("setting_group", { ascending: true })
      .order("setting_key", { ascending: true });

    if (error) {
      console.error("读取后台配置失败：", error);

      return Response.json(
        { error: "读取后台配置失败。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      settings: data || [],
    });
  } catch (error) {
    console.error("后台配置接口错误：", error);

    return Response.json(
      {
        error:
          "服务器异常，请确认 site_settings 表已创建，并检查 SUPABASE_SERVICE_ROLE_KEY。",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incomingSettings = (body.settings || []) as IncomingSetting[];

    if (!Array.isArray(incomingSettings) || incomingSettings.length === 0) {
      return Response.json(
        { error: "缺少要保存的配置。" },
        { status: 400 }
      );
    }

    const supabase = await ensureDefaultSettings();

    const allowedKeys = new Set(defaultSettings.map((item) => item.setting_key));

    const updates = incomingSettings
      .filter((item) => item.setting_key && allowedKeys.has(item.setting_key))
      .map((item) => ({
        setting_key: String(item.setting_key),
        setting_value: String(item.setting_value ?? ""),
        updated_at: new Date().toISOString(),
      }));

    if (updates.length === 0) {
      return Response.json(
        { error: "没有可保存的配置项。" },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "id, setting_key, setting_value, setting_label, setting_group, updated_at"
      )
      .order("setting_group", { ascending: true })
      .order("setting_key", { ascending: true });

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
