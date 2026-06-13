"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";

const tools = [
  {
    id: "chat",
    name: "AI 聊天助手",
    tag: "通用问答",
    desc: "适合日常问答、方案整理、内容创作。",
    placeholder: "直接输入你的问题，例如：这个项目怎么做、怎么赚钱、怎么优化...",
  },
  {
    id: "copy",
    name: "爆款文案",
    tag: "短视频/种草",
    desc: "输入产品或主题，自动生成抖音、小红书、朋友圈文案。",
    placeholder: "输入产品或主题，例如：AI工具箱、咖啡、免费CDN、奶茶店...",
  },
  {
    id: "title",
    name: "标题生成",
    tag: "吸睛标题",
    desc: "输入主题，自动生成短视频、小红书、广告标题。",
    placeholder: "输入主题，例如：AI工具箱、短视频副业、免费CDN...",
  },
  {
    id: "ad",
    name: "广告优化",
    tag: "转化提升",
    desc: "粘贴广告词，AI 自动帮你优化成更有吸引力的版本。",
    placeholder: "粘贴你的广告词，例如：AI工具箱，一键生成文案",
  },
  {
    id: "code",
    name: "代码助手",
    tag: "开发辅助",
    desc: "帮你看代码、改页面、解释报错。",
    placeholder: "把你的代码、报错、需求粘贴进来...",
  },
  {
    id: "script",
    name: "短视频脚本",
    tag: "视频创作",
    desc: "输入主题，自动生成短视频分镜、口播和结尾引导。",
    placeholder: "输入视频主题，例如：AI工具箱、咖啡店探店、副业赚钱...",
  },
  {
    id: "moments",
    name: "朋友圈文案",
    tag: "私域文案",
    desc: "生成适合朋友圈、社群、私域转化的文案。",
    placeholder: "输入产品或主题，例如：AI工具箱、免费CDN、课程推广...",
  },
  {
    id: "seo",
    name: "SEO文章",
    tag: "搜索优化",
    desc: "生成适合网站、公众号、博客的结构化文章。",
    placeholder: "输入文章主题，例如：AI工具箱有什么用、如何提高效率...",
  },
  {
    id: "report",
    name: "日报周报",
    tag: "办公效率",
    desc: "快速生成工作日报、周报、项目总结。",
    placeholder: "输入工作内容，例如：今天做了网站首页、套餐页、AI工具箱...",
  },
  {
    id: "rewrite",
    name: "翻译润色",
    tag: "文本优化",
    desc: "帮你润色、改写、翻译、优化表达。",
    placeholder: "粘贴需要润色或翻译的内容...",
  },
];

const ANONYMOUS_DAILY_LIMIT = 5;
const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 100;
const MAX_MESSAGE_LENGTH = 2000;
const USAGE_KEY = "ai_bot_pro_daily_usage";

type PlanType = "free" | "pro";

type UserPlanState = {
  plan: PlanType;
  dailyLimit: number;
  expiredAt: string | null;
};

type ChatApiResponse = {
  reply?: string;
  error?: string;
  usage?: {
    type?: "login" | "anonymous";
    plan?: "free" | "pro" | "anonymous";
    used?: number;
    limit?: number;
    remaining?: number;
  };
};

function getToday() {
  return new Date().toLocaleDateString("zh-CN");
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getPlanName(plan: PlanType) {
  return plan === "pro" ? "Pro 会员版" : "Free 免费版";
}

function getLimitTitle(isLoggedIn: boolean, plan: PlanType) {
  if (!isLoggedIn) {
    return "今日免费体验次数已用完";
  }

  if (plan === "pro") {
    return "今日 Pro 额度已用完";
  }

  return "今日 Free 额度已用完";
}

function getLimitDescription(isLoggedIn: boolean, plan: PlanType, usageLimit: number) {
  if (!isLoggedIn) {
    return `未登录用户每日可体验 ${ANONYMOUS_DAILY_LIMIT} 次。登录账号后每日可使用 ${FREE_DAILY_LIMIT} 次，升级 Pro 后每日可使用 ${PRO_DAILY_LIMIT} 次。`;
  }

  if (plan === "pro") {
    return `你当前是 Pro 会员，每日可使用 ${usageLimit} 次。今日额度已用完，明天会自动恢复。`;
  }

  return `你当前是 Free 免费版，每日可使用 ${usageLimit} 次。升级 Pro 后每日可使用 ${PRO_DAILY_LIMIT} 次，更适合高频创作、办公和运营。`;
}

function getUsage() {
  if (typeof window === "undefined") return 0;

  const raw = localStorage.getItem(USAGE_KEY);

  if (!raw) return 0;

  try {
    const data = JSON.parse(raw);

    if (data.date !== getToday()) {
      localStorage.setItem(
        USAGE_KEY,
        JSON.stringify({
          date: getToday(),
          count: 0,
        })
      );

      return 0;
    }

    return Number(data.count || 0);
  } catch {
    return 0;
  }
}

function saveUsage(count: number) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    USAGE_KEY,
    JSON.stringify({
      date: getToday(),
      count,
    })
  );
}

function buildFinalPrompt(toolId: string, userInput: string) {
  if (toolId === "copy") {
    return `
当前工具：爆款文案生成器

用户输入：
${userInput}

请直接生成适合抖音、小红书、朋友圈的爆款文案。

输出格式：

## 爆款文案方案

### 文案版本 1：强吸引开头
- **开头钩子：**
- **正文内容：**
- **引导动作：**

### 文案版本 2：痛点刺激版
- **开头钩子：**
- **正文内容：**
- **引导动作：**

### 文案版本 3：种草推荐版
- **开头钩子：**
- **正文内容：**
- **引导动作：**

### 推荐标题
1. **标题：**
2. **标题：**
3. **标题：**

### 推荐标签
- #AI工具
- #效率提升
- #实用工具
`;
  }

  if (toolId === "title") {
    return `
当前工具：标题生成器

用户输入：
${userInput}

请直接生成适合短视频、小红书、公众号、广告使用的标题。

输出格式：

## 爆款标题推荐

### 强冲突标题
1. **标题：**
2. **标题：**
3. **标题：**

### 好奇心标题
1. **标题：**
2. **标题：**
3. **标题：**

### 转化型标题
1. **标题：**
2. **标题：**
3. **标题：**

### 最推荐标题
- **推荐标题：**
- **推荐理由：**
`;
  }

  if (toolId === "ad") {
    return `
当前工具：广告优化器

用户输入：
${userInput}

请直接分析并优化广告词。

输出格式：

## 广告词优化结果

### 原广告词问题
- **问题1：**
- **问题2：**
- **问题3：**

### 优化版本
- **版本1：**
- **版本2：**
- **版本3：**
- **版本4：**
- **版本5：**

### 最推荐版本
- **推荐广告词：**
- **推荐理由：**

### 适合投放场景
- **抖音：**
- **小红书：**
- **朋友圈：**
`;
  }

  if (toolId === "code") {
    return `
当前工具：代码助手

用户输入：
${userInput}

请用小白能看懂的话解释，并给出具体解决方法。

输出格式：

## 问题原因

- **原因1：**
- **原因2：**

## 解决方法

### 第一步
- 具体操作：

### 第二步
- 具体操作：

### 第三步
- 具体操作：

## 可复制代码

\`\`\`tsx
// 如果需要代码，就写在这里
\`\`\`

## 注意事项

- **注意1：**
- **注意2：**
`;
  }

  if (toolId === "script") {
    return `
当前工具：短视频脚本生成器

用户输入：
${userInput}

请直接生成一条适合短视频发布的脚本。

输出格式：

## 短视频脚本方案

### 视频标题
- **标题：**

### 开头 3 秒钩子
- **钩子文案：**

### 口播脚本
- **第一段：**
- **第二段：**
- **第三段：**

### 分镜建议
1. **镜头1：**
2. **镜头2：**
3. **镜头3：**

### 结尾引导
- **引导关注：**
- **引导评论：**
`;
  }

  if (toolId === "moments") {
    return `
当前工具：朋友圈文案生成器

用户输入：
${userInput}

请直接生成适合朋友圈发布的文案。

输出格式：

## 朋友圈文案方案

### 真实分享版
- **文案：**
- **适合人群：**

### 成交转化版
- **文案：**
- **适合人群：**

### 轻松种草版
- **文案：**
- **适合人群：**

### 配图建议
- **图片方向1：**
- **图片方向2：**
- **图片方向3：**
`;
  }

  if (toolId === "seo") {
    return `
当前工具：SEO文章生成器

用户输入：
${userInput}

请直接生成一篇结构清晰的 SEO 文章。

输出格式：

## SEO文章标题

### 文章摘要
- **核心内容：**

### 正文大纲
1. **第一部分：**
2. **第二部分：**
3. **第三部分：**

### 正文内容

#### 第一部分
- 内容：

#### 第二部分
- 内容：

#### 第三部分
- 内容：

### SEO关键词建议
- **关键词1：**
- **关键词2：**
- **关键词3：**
`;
  }

  if (toolId === "report") {
    return `
当前工具：日报周报生成器

用户输入：
${userInput}

请直接整理成专业的工作汇报。

输出格式：

## 工作汇报

### 今日完成
- **事项1：**
- **事项2：**
- **事项3：**

### 工作成果
- **成果1：**
- **成果2：**

### 遇到的问题
- **问题1：**
- **问题2：**

### 明日计划
- **计划1：**
- **计划2：**
- **计划3：**

### 汇报总结
- **总结：**
`;
  }

  if (toolId === "rewrite") {
    return `
当前工具：翻译润色助手

用户输入：
${userInput}

请直接对内容进行润色、改写和翻译。

输出格式：

## 文本优化结果

### 原文问题
- **问题1：**
- **问题2：**

### 润色版本
- **版本：**

### 更自然版本
- **版本：**

### 更专业版本
- **版本：**

### 可选英文翻译
- **English：**
`;
  }

  return `
当前工具：AI 聊天助手

用户问题：
${userInput}

请使用标准 Markdown 输出。

输出格式：

## 回答结果

### 核心结论
- **结论：**

### 详细说明
- **第1点：**
- **第2点：**
- **第3点：**

### 建议
- **建议1：**
- **建议2：**
`;
}

export default function ChatPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTool, setActiveTool] = useState(tools[0]);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitNotice, setLimitNotice] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(ANONYMOUS_DAILY_LIMIT);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlanState>({
    plan: "free",
    dailyLimit: FREE_DAILY_LIMIT,
    expiredAt: null,
  });

  const remainingCount = Math.max(usageLimit - usageCount, 0);
  const messageLength = message.length;
  const isMessageTooLong = messageLength > MAX_MESSAGE_LENGTH;
  const shouldShowLimitCard = remainingCount <= 0 || Boolean(limitNotice);

  async function loadLoginUsage(userId: string) {
    const today = getTodayDate();

    const { data: planData, error: planError } = await supabase
      .from("user_plans")
      .select("plan,daily_limit,expired_at")
      .eq("user_id", userId)
      .maybeSingle();

    let finalPlan: UserPlanState = {
      plan: "free",
      dailyLimit: FREE_DAILY_LIMIT,
      expiredAt: null,
    };

    if (planError) {
      console.error("读取用户套餐失败：", planError);
    } else if (planData) {
      const dbPlan = planData.plan === "pro" ? "pro" : "free";
      const dbDailyLimit = Number(planData.daily_limit || FREE_DAILY_LIMIT);
      const expiredAt = planData.expired_at ? String(planData.expired_at) : null;
      const isExpired = expiredAt
        ? new Date(expiredAt).getTime() <= Date.now()
        : false;

      if (!isExpired) {
        finalPlan = {
          plan: dbPlan,
          dailyLimit:
            Number.isFinite(dbDailyLimit) && dbDailyLimit > 0
              ? dbDailyLimit
              : FREE_DAILY_LIMIT,
          expiredAt,
        };
      }
    }

    const { data: usageData, error: usageError } = await supabase
      .from("user_daily_usage")
      .select("used_count")
      .eq("user_id", userId)
      .eq("usage_date", today)
      .maybeSingle();

    if (usageError) {
      console.error("读取今日使用次数失败：", usageError);
      setUsageCount(0);
    } else {
      setUsageCount(Number(usageData?.used_count || 0));
    }

    setUserPlan(finalPlan);
    setUsageLimit(finalPlan.dailyLimit);
  }

  function applyBackendUsage(data: ChatApiResponse) {
    const backendUsed = Number(data?.usage?.used);
    const backendLimit = Number(data?.usage?.limit);
    const backendType = data?.usage?.type;
    const backendPlan = data?.usage?.plan;

    if (backendType === "login") {
      setIsLoggedIn(true);

      if (backendPlan === "pro" || backendPlan === "free") {
        setUserPlan((current) => ({
          ...current,
          plan: backendPlan,
          dailyLimit:
            Number.isFinite(backendLimit) && backendLimit > 0
              ? backendLimit
              : current.dailyLimit,
        }));
      }
    }

    if (Number.isFinite(backendLimit) && backendLimit > 0) {
      setUsageLimit(backendLimit);
    }

    if (Number.isFinite(backendUsed) && backendUsed >= 0) {
      const safeLimit =
        Number.isFinite(backendLimit) && backendLimit > 0
          ? backendLimit
          : usageLimit;

      const safeUsed = Math.min(backendUsed, safeLimit);

      setUsageCount(safeUsed);

      if (safeUsed >= safeLimit) {
        setLimitNotice("今日额度已用完，可以升级 Pro 获得更高每日使用次数。");
      } else {
        setLimitNotice("");
      }

      if (backendType === "anonymous") {
        saveUsage(safeUsed);
      }
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initPage() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user && session?.access_token) {
        setIsLoggedIn(true);
        await loadLoginUsage(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserPlan({
          plan: "free",
          dailyLimit: FREE_DAILY_LIMIT,
          expiredAt: null,
        });
        setUsageLimit(ANONYMOUS_DAILY_LIMIT);
        setUsageCount(getUsage());
      }

      const params = new URLSearchParams(window.location.search);
      const toolId = params.get("tool");

      if (!toolId) return;

      const foundTool = tools.find((tool) => tool.id === toolId);

      if (foundTool) {
        setActiveTool(foundTool);
        setMessage("");
        setReply("");
        setError("");
        setLimitNotice("");
      }
    }

    initPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user && session?.access_token) {
        setIsLoggedIn(true);
        await loadLoginUsage(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserPlan({
          plan: "free",
          dailyLimit: FREE_DAILY_LIMIT,
          expiredAt: null,
        });
        setUsageLimit(ANONYMOUS_DAILY_LIMIT);
        setUsageCount(getUsage());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    if (isMessageTooLong) {
      setError(`输入内容太长了，最多只能输入 ${MAX_MESSAGE_LENGTH} 个字。`);
      return;
    }

    setLoading(true);
    setReply("");
    setError("");
    setLimitNotice("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const loggedIn = Boolean(session?.access_token);
      setIsLoggedIn(loggedIn);

      const currentUsage = loggedIn ? usageCount : getUsage();

      if (currentUsage >= usageLimit) {
        const limitText = loggedIn
          ? userPlan.plan === "pro"
            ? "你今天的 Pro 额度已用完，明天会自动恢复。"
            : "你今天的 Free 额度已用完，升级 Pro 后每日可使用 100 次。"
          : "今日免费体验次数已用完，登录账号可获得每日 10 次，升级 Pro 后每日 100 次。";

        setLimitNotice(limitText);
        setError("");
        setUsageCount(currentUsage);
        setLoading(false);
        return;
      }

      const finalMessage = buildFinalPrompt(activeTool.id, message.trim());

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          tool: activeTool.id,
          message: finalMessage,
        }),
      });

      const data: ChatApiResponse = await res.json();

      if (!res.ok) {
        applyBackendUsage(data);
        throw new Error(data?.error || "AI 接口请求失败");
      }

      setReply(data.reply || "AI 没有返回内容，请重新试一次。");

      const backendUsed = Number(data?.usage?.used);
      const backendType = data?.usage?.type;

      applyBackendUsage(data);

      if (!Number.isFinite(backendUsed) || backendUsed < 0) {
        const newUsage = currentUsage + 1;

        setUsageCount(newUsage);

        if (newUsage >= usageLimit) {
          setLimitNotice("今日额度已用完，可以升级 Pro 获得更高每日使用次数。");
        }

        if (backendType === "anonymous" || !loggedIn) {
          saveUsage(newUsage);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "请求失败，请稍后重试。";

      const lowerError = errorMessage.toLowerCase();
      const isLimitError =
        errorMessage.includes("次数") ||
        errorMessage.includes("额度") ||
        lowerError.includes("limit");

      if (isLimitError) {
        setLimitNotice(errorMessage);
        setError("");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  function changeTool(tool: (typeof tools)[number]) {
    setActiveTool(tool);
    setMessage("");
    setReply("");
    setError("");
    setLimitNotice("");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tool", tool.id);
      window.history.replaceState(null, "", url.toString());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      sendMessage();
    }
  }

  async function copyReply() {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-6">
        <aside className="hidden h-[calc(100vh-3rem)] w-72 shrink-0 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:block">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-2 block text-2xl font-black tracking-tight"
            >
              AI Bot Pro
            </Link>

            <p className="text-sm leading-6 text-zinc-400">
              一站式 AI 工具箱，帮你快速生成文案、标题、方案和创意内容。
            </p>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => changeTool(tool)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  activeTool.id === tool.id
                    ? "bg-white font-bold text-black"
                    : "border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div>{tool.name}</div>
                <div
                  className={`mt-1 text-xs ${
                    activeTool.id === tool.id
                      ? "text-zinc-600"
                      : "text-zinc-500"
                  }`}
                >
                  {tool.tag}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-2 text-sm font-bold text-zinc-200">
              当前状态
            </div>

            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI 接口已连接
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-zinc-500">当前版本</div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-200">
                <span>
                  {isLoggedIn ? getPlanName(userPlan.plan) : "免费体验版"}
                </span>

                {isLoggedIn && userPlan.plan === "pro" && (
                  <span className="rounded-full border border-purple-300/30 bg-purple-400/10 px-2 py-0.5 text-[10px] font-black text-purple-200">
                    PRO
                  </span>
                )}
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                {isLoggedIn
                  ? `${getPlanName(userPlan.plan)}每日使用`
                  : "每日免费使用"}{" "}
                {usageLimit} 次
              </div>

              <div className="mt-3 grid gap-2">
                <Link
                  href="/pricing"
                  className="flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-black text-black transition hover:bg-zinc-200"
                >
                  查看套餐
                </Link>

                <Link
                  href="/waitlist"
                  className="flex w-full items-center justify-center rounded-xl border border-purple-300/30 bg-purple-500/20 px-3 py-2 text-xs font-black text-purple-100 transition hover:bg-purple-500/30"
                >
                  申请 Pro
                </Link>

                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-zinc-200 transition hover:bg-white/10"
                >
                  会员中心
                </Link>

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-zinc-200 transition hover:bg-white/10"
                >
                  {isLoggedIn ? "账号已登录" : "登录账号"}
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-300">
                {activeTool.tag}
              </div>

              {isLoggedIn && (
                <div
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${
                    userPlan.plan === "pro"
                      ? "border-purple-300/30 bg-purple-400/10 text-purple-100"
                      : "border-white/10 bg-black/30 text-zinc-300"
                  }`}
                >
                  {getPlanName(userPlan.plan)}
                </div>
              )}

              <Link
                href="/pricing"
                className="inline-flex rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                套餐价格
              </Link>

              <Link
                href="/waitlist"
                className="inline-flex rounded-full border border-purple-300/30 bg-purple-500/20 px-4 py-2 text-sm font-bold text-purple-100 transition hover:bg-purple-500/30"
              >
                申请 Pro
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                会员中心
              </Link>

              <Link
                href="/login"
                className="inline-flex rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                {isLoggedIn ? "已登录" : "登录"}
              </Link>
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              {activeTool.name}
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">{activeTool.desc}</p>
          </header>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:hidden">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => changeTool(tool)}
                className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                  activeTool.id === tool.id
                    ? "bg-white font-bold text-black"
                    : "border border-white/10 bg-white/5 text-zinc-300"
                }`}
              >
                {tool.name}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`h-44 w-full resize-none rounded-3xl border bg-black/40 p-6 text-base leading-7 text-white outline-none placeholder:text-zinc-500 ${
                isMessageTooLong
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-white/10 focus:border-white/30"
              }`}
              placeholder={activeTool.placeholder}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  {isLoggedIn
                    ? userPlan.plan === "pro"
                      ? "Pro 会员剩余次数"
                      : "Free 账号剩余次数"
                    : "今日免费体验剩余次数"}
                  ：{remainingCount} / {usageLimit}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    isMessageTooLong ? "text-red-400" : "text-zinc-500"
                  }`}
                >
                  已输入 {messageLength} / {MAX_MESSAGE_LENGTH}
                </p>
              </div>

              <button
                onClick={sendMessage}
                disabled={
                  loading ||
                  !message.trim() ||
                  remainingCount <= 0 ||
                  isMessageTooLong
                }
                className="rounded-2xl bg-white px-8 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "生成中..." : "发送消息"}
              </button>
            </div>

            {isMessageTooLong && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                输入内容太长了，免费版每次最多输入 {MAX_MESSAGE_LENGTH} 个字，请精简后再发送。
              </div>
            )}
          </div>

          {shouldShowLimitCard && (
            <div className="mt-5 rounded-3xl border border-purple-300/25 bg-purple-500/10 p-6 text-purple-100 shadow-2xl shadow-purple-500/10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-black">
                    {getLimitTitle(isLoggedIn, userPlan.plan)}
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-purple-100/80">
                    {limitNotice ||
                      getLimitDescription(
                        isLoggedIn,
                        userPlan.plan,
                        usageLimit
                      )}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-300/20 bg-black/30 px-5 py-3 text-right">
                  <div className="text-xs text-purple-100/60">Pro 每日额度</div>
                  <div className="mt-1 text-2xl font-black">100 次/天</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-purple-100/80 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="font-black text-white">Free 免费版</div>
                  <div className="mt-1">登录后每日 10 次</div>
                </div>

                <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 p-4">
                  <div className="font-black text-white">Pro 月卡</div>
                  <div className="mt-1">￥19.9 / 月，每日 100 次</div>
                </div>

                <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 p-4">
                  <div className="font-black text-white">Pro 年卡</div>
                  <div className="mt-1">￥199 / 年，每日 100 次</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/waitlist"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
                >
                  升级 Pro
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex rounded-2xl border border-purple-300/20 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20"
                >
                  查看套餐
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex rounded-2xl border border-purple-300/20 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20"
                >
                  返回会员中心
                </Link>

                {!isLoggedIn && (
                  <Link
                    href="/login"
                    className="inline-flex rounded-2xl border border-purple-300/20 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20"
                  >
                    登录账号
                  </Link>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
              {error}
            </div>
          )}

          {(reply || loading) && (
            <div className="mt-5 rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-bold text-zinc-200">AI 回复</div>

                {reply && (
                  <button
                    onClick={copyReply}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                  >
                    复制
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none leading-8 text-zinc-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reply}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}