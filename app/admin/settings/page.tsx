"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
  setting_group: string;
  updated_at: string;
};

type SettingsResponse = {
  success?: boolean;
  settings?: SiteSetting[];
  error?: string;
};

const groupMap: Record<
  string,
  {
    title: string;
    desc: string;
    className: string;
  }
> = {
  payment: {
    title: "付款配置",
    desc: "用于付款确认页、审核提示和客服联系方式。",
    className: "border-emerald-300/20 bg-emerald-500/10",
  },
  pricing: {
    title: "价格配置",
    desc: "用于展示 Pro 月卡、年卡等价格信息。",
    className: "border-purple-300/20 bg-purple-500/10",
  },
  general: {
    title: "网站配置",
    desc: "用于网站公告、全局提示等内容。",
    className: "border-blue-300/20 bg-blue-500/10",
  },
};

const textareaKeys = new Set([
  "payment_notice",
  "review_notice",
  "site_announcement",
]);

function getGroupInfo(group: string) {
  return (
    groupMap[group] || {
      title: group || "其他配置",
      desc: "其他站点配置。",
      className: "border-white/10 bg-white/[0.04]",
    }
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const groupedSettings = useMemo(() => {
    const groups: Record<string, SiteSetting[]> = {};

    settings.forEach((item) => {
      if (!groups[item.setting_group]) {
        groups[item.setting_group] = [];
      }

      groups[item.setting_group].push(item);
    });

    return groups;
  }, [settings]);

  async function loadSettings() {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/settings", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as SettingsResponse;

      if (!res.ok) {
        throw new Error(data.error || "读取配置失败。");
      }

      const list = data.settings || [];
      const nextValues: Record<string, string> = {};

      list.forEach((item) => {
        nextValues[item.setting_key] = item.setting_value || "";
      });

      setSettings(list);
      setValues(nextValues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取配置失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = settings.map((item) => ({
        setting_key: item.setting_key,
        setting_value: values[item.setting_key] ?? "",
      }));

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          settings: payload,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as SettingsResponse;

      if (!res.ok) {
        throw new Error(data.error || "保存配置失败。");
      }

      const list = data.settings || [];
      const nextValues: Record<string, string> = {};

      list.forEach((item) => {
        nextValues[item.setting_key] = item.setting_value || "";
      });

      setSettings(list);
      setValues(nextValues);
      setNotice("配置已保存。前台页面刷新后会读取最新配置。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存配置失败，请稍后再试。");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin" className="hover:text-white">
                后台首页
              </Link>

              <Link href="/admin/plans" className="hover:text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="hover:text-white">
                提交记录
              </Link>

              <Link href="/admin/orders" className="hover:text-white">
                开通记录
              </Link>

              <Link href="/admin/settings" className="text-white">
                后台配置
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                退出后台
              </button>
            </div>
          </nav>

          <div className="py-14">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              后台配置
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              站点配置中心
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                修改付款、价格和公告信息
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里可以维护客服微信、付款说明、审核说明、Pro 价格和网站公告。保存后前台页面可以读取最新配置。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadSettings}
                disabled={loading}
                className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "刷新中..." : "刷新配置"}
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || loading}
                className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-6 py-3 font-black text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "保存中..." : "保存配置"}
              </button>

              <Link
                href="/checkout"
                className="rounded-2xl border border-purple-300/20 bg-purple-500/10 px-6 py-3 font-black text-purple-100 transition hover:bg-purple-500/20"
              >
                查看付款页
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-200">
            {notice}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-white/60">
            正在读取后台配置...
          </div>
        ) : settings.length === 0 ? (
          <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-7 text-yellow-100">
            暂时没有配置项。请先确认 Supabase 已创建 site_settings 表并插入默认配置。
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([group, items]) => {
              const groupInfo = getGroupInfo(group);

              return (
                <div
                  key={group}
                  className={`rounded-[2rem] border p-7 ${groupInfo.className}`}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-black">{groupInfo.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {groupInfo.desc}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {items.map((item) => (
                      <div
                        key={item.setting_key}
                        className="rounded-3xl border border-white/10 bg-black/30 p-5"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <label className="text-sm font-black text-white">
                              {item.setting_label || item.setting_key}
                            </label>

                            <div className="mt-1 text-xs text-white/35">
                              key：{item.setting_key}
                            </div>
                          </div>

                          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/45">
                            {item.setting_group}
                          </div>
                        </div>

                        {textareaKeys.has(item.setting_key) ? (
                          <textarea
                            value={values[item.setting_key] ?? ""}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                [item.setting_key]: event.target.value,
                              }))
                            }
                            rows={4}
                            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                            placeholder={`请输入${item.setting_label}`}
                          />
                        ) : (
                          <input
                            value={values[item.setting_key] ?? ""}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                [item.setting_key]: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                            placeholder={`请输入${item.setting_label}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "保存中..." : "保存全部配置"}
              </button>

              <Link
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white transition hover:bg-white/10"
              >
                返回后台首页
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
