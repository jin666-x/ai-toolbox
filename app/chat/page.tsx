"use client";

import { useState } from "react";

const tools = [
  {
    id: "chat",
    name: "AI 聊天助手",
    tag: "通用问答",
    desc: "适合日常问答、方案整理、内容创作。",
    placeholder: "请输入你的问题，例如：帮我分析一下这个项目怎么做...",
    example: "帮我分析一下 AI 工具箱网站应该怎么运营",
  },
  {
    id: "copy",
    name: "爆款文案",
    tag: "短视频/种草",
    desc: "生成抖音、小红书、朋友圈爆款文案。",
    placeholder: "请输入产品、服务或主题，例如：AI工具箱、咖啡、CDN服务...",
    example: "帮我写一条关于 AI 工具箱的抖音爆款文案",
  },
  {
    id: "title",
    name: "标题生成",
    tag: "吸睛标题",
    desc: "生成短视频、小红书、广告标题。",
    placeholder: "请输入主题，例如：AI工具箱如何帮普通人赚钱...",
    example: "帮我生成10个关于 AI 工具箱的爆款标题",
  },
  {
    id: "ad",
    name: "广告优化",
    tag: "转化提升",
    desc: "优化广告词，让表达更有吸引力。",
    placeholder: "请输入你现在的广告词，我帮你优化...",
    example: "帮我优化这句广告词：AI工具箱，一键生成文案",
  },
  {
    id: "code",
    name: "代码助手",
    tag: "开发辅助",
    desc: "帮你看代码、改页面、解释报错。",
    placeholder: "把你的代码或报错粘贴进来...",
    example: "帮我解释一下 Next.js 里面 app/page.tsx 是干嘛的",
  },
];

export default function ChatPage() {
  const [activeTool, setActiveTool] = useState(tools[0]);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    if (!message.trim() || loading) return;

    setLoading(true);
    setReply("");
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: activeTool.id,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "AI 接口请求失败");
      }

      setReply(data.reply || "AI 没有返回内容，请重新试一次。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  function changeTool(tool: typeof tools[number]) {
    setActiveTool(tool);
    setMessage(tool.example);
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
                    activeTool.id === tool.id ? "text-zinc-600" : "text-zinc-500"
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

            <p className="mt-4 max-w-2xl text-zinc-400">
              {activeTool.desc}
            </p>
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
                提示：按 Ctrl + Enter 可以快速发送
              </p>

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="rounded-2xl bg-white px-8 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "生成中..." : "发送消息"}
              </button>
            </div>
          </div>

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
                <div className="whitespace-pre-wrap leading-8 text-zinc-300">
                  {reply}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}