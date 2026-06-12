"use client";

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
];

const DAILY_LIMIT = 5;
const USAGE_KEY = "ai_bot_pro_daily_usage";

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

  const remainingCount = Math.max(DAILY_LIMIT - usageCount, 0);

  useEffect(() => {
    setUsageCount(getUsage());
  }, []);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const currentUsage = getUsage();

    if (currentUsage >= DAILY_LIMIT) {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "AI 接口请求失败");
      }

      setReply(data.reply || "AI 没有返回内容，请重新试一次。");

      const newUsage = currentUsage + 1;
      saveUsage(newUsage);
      setUsageCount(newUsage);
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
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:block">
          <div className="mb-8">
            <div className="mb-2 text-2xl font-black tracking-tight">
              AI ToolBox
            </div>
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
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-300">
              {activeTool.tag}
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              {activeTool.name}
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">{activeTool.desc}</p>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-5 lg:hidden">
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
              className="h-44 w-full resize-none rounded-3xl border border-white/10 bg-black/40 p-6 text-base leading-7 text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
              placeholder={activeTool.placeholder}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                今日剩余免费次数：{remainingCount} / {DAILY_LIMIT}
              </p>

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim() || remainingCount <= 0}
                className="rounded-2xl bg-white px-8 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "生成中..." : "发送消息"}
              </button>
            </div>
          </div>

          {remainingCount <= 0 && !error && (
            <div className="mt-5 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-300">
              今日免费次数已用完，请明天再来。
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