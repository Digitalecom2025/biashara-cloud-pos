"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BrainCircuit,
  ChevronRight,
  Crown,
  Lightbulb,
  PackageSearch,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { comingSoonAiFeatures, fallbackAiResponse, suggestedPrompts } from "@/lib/ai-mock-data";
import type { AiAssistantSummary, AiInsightItemData, AiSummaryCardData } from "@/lib/ai-data";

const fallbackSummary: AiAssistantSummary = {
  lastUpdated: "",
  packagePlan: "Business",
  metrics: {
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    salesTodayCount: 0,
    stockValue: 0,
    totalDebt: 0,
    debtorsCount: 0,
    monthExpenses: 0,
    activeUsers: 0,
    branchCount: 0,
    estimatedWeekProfit: 0,
  },
  cards: [
    { title: "Today's AI Summary", insight: "Loading local business insights from the database.", tone: "gold" },
    { title: "Sales Health", insight: "Sales health will appear after the summary loads.", tone: "gold" },
    { title: "Stock Risk", insight: "Stock risk will appear after the summary loads.", tone: "gold" },
    { title: "Debtor Risk", insight: "Debtor risk will appear after the summary loads.", tone: "gold" },
    { title: "Expense Warning", insight: "Expense warnings will appear after the summary loads.", tone: "gold" },
    { title: "Profit Opportunity", insight: "Profit opportunities will appear after the summary loads.", tone: "green" },
  ],
  insights: { sales: [], stock: [], debtors: [], expenses: [], staff: [], branches: [] },
  recommendedActions: [],
  promptResponses: {},
};

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function AiAssistantPage() {
  const [summary, setSummary] = useState<AiAssistantSummary>(fallbackSummary);
  const [lastUpdatedText, setLastUpdatedText] = useState("--");
  const [question, setQuestion] = useState("");
  const [activePrompt, setActivePrompt] = useState(suggestedPrompts[7]);
  const [response, setResponse] = useState(fallbackAiResponse);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiResponse = await fetch("/api/ai-assistant/summary");
      if (!apiResponse.ok) throw new Error("Failed to load AI assistant summary.");
      const json = (await apiResponse.json()) as { data: AiAssistantSummary };
      setSummary(json.data);
      setResponse(json.data.promptResponses[activePrompt] ?? fallbackAiResponse);
      setLastUpdatedText(formatUpdated(json.data.lastUpdated));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "AI assistant summary could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [activePrompt]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSummary();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSummary]);

  function askAi(prompt: string) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    setActivePrompt(cleanPrompt);
    setQuestion(cleanPrompt);
    setResponse(summary.promptResponses[cleanPrompt] ?? fallbackAiResponse);
  }

  const limitedPlan = ["Lite", "Growth"].includes(summary.packagePlan);

  return (
    <div className="mx-auto max-w-[1800px]">
      <div className="mb-6 overflow-hidden rounded-3xl bg-[#07120D] p-5 text-[#F6FFF8] shadow-xl shadow-[#12311F]/10 md:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#D4A017]">
              <Sparkles size={15} /> Premium insights
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">AI Business Assistant</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C7BD]">
              Get smart insights from your sales, stock, customers, debtors, expenses, staff activity, and reports.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={() => loadSummary()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh insights
              </button>
              <p className="text-xs text-[#B8C7BD]">Last updated: {lastUpdatedText}</p>
              {error && <p className="text-xs font-bold text-[#EF4444]">{error}</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-[#D4A017]/25 bg-[#D4A017]/10 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/20 text-[#D4A017]">
                <Crown size={18} />
              </span>
              <div>
                <h3 className="text-sm font-black text-[#F6FFF8]">Premium feature notice</h3>
                <p className="mt-1 text-xs leading-5 text-[#E9D7A0]">
                  AI Business Assistant is available on Premium and Custom plans. This demo still shows local insights. {limitedPlan ? "Lite/Growth users get limited AI insights and can upgrade for forecasts, AI SMS suggestions, and debtor follow-ups." : "Premium/Custom unlocks full AI insights, forecasts, AI SMS suggestions, and debtor follow-ups."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="mb-4 rounded-2xl border border-[#DDEAE0] bg-white p-4 text-sm font-bold text-[#789083]">Loading local AI insights from database summaries...</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {summary.cards.map((card) => <SummaryCard key={card.title} card={card} />)}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <AskAiPanel question={question} setQuestion={setQuestion} activePrompt={activePrompt} response={response} onAsk={askAi} />
        <RecommendedActions actions={summary.recommendedActions} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <InsightBlock icon={TrendingUp} title="Sales Insights" items={summary.insights.sales} />
        <InsightBlock icon={PackageSearch} title="Stock Insights" items={summary.insights.stock} />
        <InsightBlock icon={ShieldAlert} title="Debtor Insights" items={summary.insights.debtors} />
        <InsightBlock icon={WalletCards} title="Expense Insights" items={summary.insights.expenses} />
        <InsightBlock icon={Users} title="Staff / Cashier Insights" items={summary.insights.staff} />
        <InsightBlock icon={BrainCircuit} title="Branch Insights" items={summary.insights.branches} />
      </section>

      <section className="mt-5 rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
            <BrainCircuit size={18} />
          </span>
          <div>
            <h3 className="font-black text-[#173324]">Coming Soon</h3>
            <p className="text-xs text-[#789083]">Future AI capabilities planned for the premium assistant.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonAiFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-3 rounded-xl border border-[#EEF3EF] bg-[#F8FBF8] p-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#D4A017]/12 text-[#A57809]">
                <ChevronRight size={15} />
              </span>
              <p className="text-xs font-bold text-[#60766B]">{feature}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ card }: { card: AiSummaryCardData }) {
  const tone = card.tone === "red" ? "bg-[#EF4444]/10 text-[#EF4444]" : card.tone === "gold" ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  const Icon = card.tone === "red" ? AlertTriangle : card.tone === "gold" ? Lightbulb : BrainCircuit;
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        <Icon size={18} />
      </span>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{card.title}</p>
      <p className="mt-2 text-xs leading-5 text-[#173324]">{card.insight}</p>
    </article>
  );
}

function AskAiPanel({ question, setQuestion, activePrompt, response, onAsk }: { question: string; setQuestion: (value: string) => void; activePrompt: string; response: string; onAsk: (prompt: string) => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="border-b border-[#E8F0EA] bg-[#F8FBF8] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#12311F] text-[#22C55E]">
            <Bot size={18} />
          </span>
          <div>
            <h3 className="font-black text-[#173324]">Ask AI</h3>
            <p className="text-xs text-[#789083]">Rule-based local assistant. No real AI API is connected.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-2xl bg-[#12311F] px-4 py-3 text-xs leading-5 text-[#F6FFF8]">
            {activePrompt}
          </div>
        </div>
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
            <BrainCircuit size={16} />
          </span>
          <div className="rounded-2xl border border-[#E8F0EA] bg-[#F8FBF8] px-4 py-3 text-sm leading-6 text-[#173324]">
            {response}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#789083]">Suggested prompts</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} onClick={() => onAsk(prompt)} className="rounded-full border border-[#DDEAE0] bg-white px-3 py-2 text-[10px] font-black text-[#60766B] hover:border-[#16A34A]/50 hover:text-[#0F8C42]">
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Ask AI a question" placeholder="Ask about sales, stock, debtors, expenses or staff..." className="rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" />
          <button onClick={() => onAsk(question)} className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">
            Ask AI <Send size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function RecommendedActions({ actions }: { actions: string[] }) {
  return (
    <article className="rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-5 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/18 text-[#A57809]">
          <Lightbulb size={18} />
        </span>
        <div>
          <h3 className="font-black text-[#173324]">Recommended Actions</h3>
          <p className="text-xs text-[#8A670C]">Rule-based guidance generated from local POS data.</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {actions.length === 0 ? <p className="text-xs font-bold text-[#8A670C]">No recommendations yet. Add more sales, products, and expenses to unlock guidance.</p> : null}
        {actions.map((action) => (
          <div key={action} className="flex gap-3 rounded-xl border border-[#D4A017]/25 bg-white/70 p-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
              <ArrowRight size={13} />
            </span>
            <p className="text-xs leading-5 text-[#173324]">{action}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function InsightBlock({ icon: Icon, title, items }: { icon: typeof TrendingUp; title: string; items: AiInsightItemData[] }) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="font-black text-[#173324]">{title}</h3>
          <p className="text-xs text-[#789083]">Generated from local database summaries.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.length === 0 ? <p className="text-xs font-bold text-[#789083]">No insight data yet.</p> : null}
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#EEF3EF] bg-[#F8FBF8] p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{item.label}</p>
            <p className="mt-1 text-sm font-black text-[#173324]">{item.value}</p>
            <p className="mt-1 text-[11px] leading-5 text-[#789083]">{item.note}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
