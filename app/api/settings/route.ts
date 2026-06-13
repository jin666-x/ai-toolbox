import { createAdminClient } from "@/lib/supabase/admin";

const defaultSettings: Record<string, string> = {
  customer_wechat: "请填写客服微信",
  payment_notice: "付款后请提交付款截图或填写已发客服微信。",
  wechat_qr_url: "",
  alipay_qr_url: "",
  payment_account_name: "AI Bot Pro",
  payment_remark_notice: "付款时请备注你的登录邮箱，方便管理员核对。",
  monthly_price: "¥19.9",
  yearly_price: "¥199",
  review_notice: "管理员确认付款后会为账号开通 Pro 权限。",
  site_announcement: "AI Bot Pro 正在持续升级中。",
};

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value");

    if (error) {
      console.error("读取前台配置失败：", error);

      return Response.json({
        success: true,
        settings: defaultSettings,
      });
    }

    const settings = {
      ...defaultSettings,
    };

    (data || []).forEach((item) => {
      if (item.setting_key) {
        settings[item.setting_key] = item.setting_value || "";
      }
    });

    return Response.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("前台配置接口错误：", error);

    return Response.json({
      success: true,
      settings: defaultSettings,
    });
  }
}
