"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const tools = [
  {
    id: "chat",
    name: "AI 聊天助手",
    tag: "通用问答",
    desc: "适合日常问答、方案整理、内容创作。",
    placeholder: "直接输入你的问题，例如：这个项目怎么做、怎么赚钱、怎么优化...",
    example: "帮我分析一下 AI 工具箱网站应该怎么运营",
  },
  {
    id: "copy",
    name: "爆款文案",
    tag: "短视频/种草",
    desc: "输入产品或主题，自动生成抖音、小红书、朋友圈文案。",
    placeholder: "输入产品或主题，例如：AI工具箱、咖啡、免费CDN、奶茶店...",
    example: "AI工具箱",
  },
  {
    id: "title",
    name: "标题生成",
    tag: "吸睛标题",
    desc: "输入主题，自动生成短视频、小红书、广告标题。",
    placeholder: "输入主题，例如：AI工具箱、短视频副业、免费CDN...",
    example: "AI工具箱",
  },
  {
    id: "ad",
    name: "广告优化",
    tag: "转化提升",
    desc: "粘贴广告词，AI 自动帮你优化成更有吸引力的版本。",
    placeholder: "粘贴你的广告词，例如：AI工具箱，一键生成文案",
    example: "AI工具箱，一键生成文案",
  },
  {
    id: "code",
    name: "代码助手",
    tag: "开发辅助",
    desc: "帮你看代码、改页面、解释报错。",
    placeholder: "把你的代码、报错、需求粘贴进来...",
    example: "帮我解释一下 Next.js 里面 app/page.tsx 是干嘛的",
  },
  {
    id: "script",
    name: "短视频脚本",
    tag: "视频创作",
    desc: "输入主题，自动生成短视频分镜、口播和结尾引导。",
    placeholder: "输入视频主题，例如：AI工具箱、咖啡店探店、副业赚钱...",
    example: "AI工具箱",
  },
  {
    id: "moments",
    name: "朋友圈文案",
    tag: "私域文案",
    desc: "生成适合朋友圈、社群、私域转化的文案。",
    placeholder: "输入产品或主题，例如：AI工具箱、免费CDN、课程推广...",
    example: "AI工具箱",
  },
  {
    id: "seo",
    name: "SEO文章",
    tag: "搜索优化",
    desc: "生成适合网站、公众号、博客的结构化文章。",
    placeholder: "输入文章主题，例如：AI工具箱有什么用、如何提高效率...",
    example: "AI工具箱有什么用",
  },
  {
    id: "report",
    name: "日报周报",
    tag: "办公效率",
    desc: "快速生成工作日报、周报、项目总结。",
    placeholder: "输入工作内容，例如：今天做了网站首页、套餐页、AI工具箱...",
    example: "今天完成了AI工具箱首页、聊天页和套餐页优化",
  },
  {
    id: "rewrite",
    name: "翻译润色",
    tag: "文本优化",
    desc: "帮你润色、改写、翻译、优化表达。",
    placeholder: "粘贴需要润色或翻译的内容...",
    example: "这个AI工具箱可以帮助用户快速生成文案和标题",
  },
];

const DAILY_LIMIT = 5;
const MAX_MESSAGE_LENGTH = 2000;
const USAGE_KEY = "ai_bot_pro_daily_usage";

type ChatApiResponse = {
  reply?: string;
  error?: string;
  usage?: {
    used?: number;
    limit?: number;
    remaining?: number;
  };
};

function getToday() {
  return new Date().toLocaleDateString("zh-CN");
}

function getUsage() {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = localStorage.getItem(USAGE_KEY);

  if (!raw) {
    return 0;
  }

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
  if (typeof window === "undefined") {
    return;
  }

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

用户输入的主题是：
${userInput}

请不要反问用户，直接根据主题自动生成内容。

你必须严格按照下面 Markdown 格式输出：

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

### 推荐发布标题
1. **标题：**
2. **标题：**
3. **标题：**

### 推荐标签
- #AI工具
- #效率提升
- #实用工具

要求：
- 文案要接地气，不要太像 AI
- 适合抖音、小红书、朋友圈
- 不要输出一大段纯文字
- 必须有标题、加粗、列表
`;
  }

  if (toolId === "title") {
    return `
当前工具：爆款标题生成器

用户输入的主题是：
${userInput}

请不要反问用户，直接生成标题。

你必须严格按照下面 Markdown 格式输出：

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

要求：
- 标题要短
- 要有点击欲望
- 适合抖音、小红书、公众号、广告使用
- 不要输出一大段纯文字
`;
  }

  if (toolId === "ad") {
    return `
当前工具：广告优化器

用户输入的广告词是：
${userInput}

请不要反问用户，直接分析并优化。

你必须严格按照下面 Markdown 格式输出：

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

要求：
- 语言要有销售感
- 不要太夸张
- 适合真实投放
- 不要输出一大段纯文字
`;
  }

  if (toolId === "script") {
    return `
当前工具：短视频脚本生成器

用户输入的主题是：
${userInput}

请不要反问用户，直接生成一条适合短视频发布的脚本。

你必须严格按照下面 Markdown 格式输出：

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

要求：
- 适合抖音、小红书、视频号
- 语言要自然，有代入感
- 不要输出一大段纯文字
- 必须有标题、加粗、列表
`;
  }

  if (toolId === "moments") {
    return `
当前工具：朋友圈文案生成器

用户输入的主题是：
${userInput}

请不要反问用户，直接生成适合朋友圈发布的文案。

你必须严格按照下面 Markdown 格式输出：

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

要求：
- 不要太像广告
- 要像真人发朋友圈
- 适合私域、社群、朋友圈使用
- 不要输出一大段纯文字
`;
  }

  if (toolId === "seo") {
    return `
当前工具：SEO文章生成器

用户输入的文章主题是：
${userInput}

请不要反问用户，直接生成一篇结构清晰的 SEO 文章。

你必须严格按照下面 Markdown 格式输出：

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

### 适合发布平台
- 网站
- 公众号
- 博客
- 百家号

要求：
- 文章结构清晰
- 适合搜索收录
- 不要堆砌关键词
- 不要输出一大段纯文字
`;
  }

  if (toolId === "report") {
    return `
当前工具：日报周报生成器

用户输入的工作内容是：
${userInput}

请不要反问用户，直接整理成专业的工作汇报。

你必须严格按照下面 Markdown 格式输出：

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

要求：
- 表达要正式
- 适合发给老板、主管、客户
- 自动把口语内容整理成专业表达
- 不要输出一大段纯文字
`;
  }

  if (toolId === "rewrite") {
    return `
当前工具：翻译润色助手

用户输入的内容是：
${userInput}

请不要反问用户，直接对内容进行优化。

你必须严格按照下面 Markdown 格式输出：

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

要求：
- 保留原意
- 表达更自然
- 适合发布、沟通、办公使用
- 不要输出一大段纯文字
`;
  }

  if (toolId === "code") {
    return `
当前工具：代码助手

用户的问题或代码是：
${userInput}

请用小白能看懂的话解释，并给出具体解决方法。

你必须严格按照下面 Markdown 格式输出：

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

  return `
当前工具：AI 聊天助手

用户问题：
${userInput}

请使用标准 Markdown 输出。

输出格式要求：

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

要求：
- 不要输出一大段纯文字
- 必须有标题、加粗、列表
- 用普通用户能看懂的话回答
`;
}

export default function ChatPage() {
  const [activeTool, setActiveTool] = useState(tools[0]);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(DAILY_LIMIT);

  const remainingCount = Math.max(usageLimit - usageCount, 0);
  const messageLength = message.length;
  const isMessageTooLong = messageLength > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    setUsageCount(getUsage());

    const params = new URLSearchParams(window.location.search);
    const toolId = params.get("tool");

    if (!toolId) {
      return;
    }

    const foundTool = tools.find((tool) => tool.id === toolId);

    if (foundTool) {
      setActiveTool(foundTool);
      setMessage("");
      setReply("");
      setError("");
    }
  }, []);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    if (isMessageTooLong) {
      setError(`输入内容太长了，最多只能输入 ${MAX_MESSAGE_LENGTH} 个字。`);
      return;
    }

    const currentUsage = getUsage();

    if (currentUsage >= usageLimit) {
      setError("今日免费次数已用完，请明天再来。");
      setUsageCount(currentUsage);
      return;
    }

    setLoading(true);
    setReply("");
    setError("");

    try {
      const finalMessage = buildFinalPrompt(activeTool.id, message.trim());

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: activeTool.id,
          message: finalMessage,
        }),
      });

      const data: ChatApiResponse = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          saveUsage(usageLimit);
          setUsageCount(usageLimit);
        }

        throw new Error(data?.error || "AI 接口请求失败");
      }

      setReply(data.reply || "AI 没有返回内容，请重新试一次。");

      const backendUsed = Number(data?.usage?.used);
      const backendLimit = Number(data?.usage?.limit);

      if (Number.isFinite(backendLimit) && backendLimit > 0) {
        setUsageLimit(backendLimit);
      }

      if (Number.isFinite(backendUsed) && backendUsed >= 0) {
        const safeUsed = Math.min(
          backendUsed,
          Number.isFinite(backendLimit) && backendLimit > 0
            ? backendLimit
            : usageLimit
        );

        saveUsage(safeUsed);
        setUsageCount(safeUsed);
      } else {
        const newUsage = currentUsage + 1;
        saveUsage(newUsage);
        setUsageCount(newUsage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  function changeTool(tool: (typeof tools)[number]) {
    setActiveTool(tool);
    setMessage("");
    setReply("");
    setError("");

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

              <div className="mt-1 text-sm font-bold text-zinc-200">
                免费体验版
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                每日免费使用 {usageLimit} 次
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
                  className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-zinc-200 transition hover:bg-white/10"
                >
                  加入等待名单
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
                  登录账号
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

              <Link
                href="/pricing"
                className="inline-flex rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                套餐价格
              </Link>

              <Link
                href="/waitlist"
                className="inline-flex rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                等待名单
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
                登录
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
                  今日剩余免费次数：{remainingCount} / {usageLimit}
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

          {remainingCount <= 0 && !error && (
            <div className="mt-5 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-300">
              <div className="font-bold">今日免费次数已用完</div>

              <p className="mt-2 text-sm text-yellow-200/80">
                免费版每日可使用 {usageLimit} 次，明天会自动恢复。后续可升级
                Pro 套餐获得更多次数。
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
                >
                  查看套餐价格
                </Link>

                <Link
                  href="/waitlist"
                  className="inline-flex rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-3 text-sm font-black text-yellow-100 transition hover:bg-yellow-400/20"
                >
                  加入等待名单
                </Link>

                <Link
                  href="/login"
                  className="inline-flex rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-3 text-sm font-black text-yellow-100 transition hover:bg-yellow-400/20"
                >
                  登录账号
                </Link>
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
                <div className="max-w-none leading-8 text-zinc-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="mb-4 mt-6 text-3xl font-black text-white">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-3 mt-6 text-2xl font-black text-white">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-2 mt-5 text-xl font-bold text-white">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-8 text-zinc-300">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-black text-white">
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 ml-6 list-disc space-y-2 text-zinc-300">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 ml-6 list-decimal space-y-2 text-zinc-300">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-8 text-zinc-300">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="mb-4 border-l-4 border-white/20 pl-4 text-zinc-400">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="rounded-lg bg-white/10 px-2 py-1 text-sm text-zinc-100">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="mb-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-zinc-100">
                          {children}
                        </pre>
                      ),
                    }}
                  >
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