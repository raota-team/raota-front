"use client";

import { useEffect, useState } from "react";
import { getRecommendationStats, type RecommendationStats, type RecommendationStatsRow } from "@/lib/api/recommendation-stats";

const DAY_MS = 24 * 60 * 60 * 1000;

/** 한국 날짜(YYYY-MM-DD). 서버도 기간을 한국 날짜로 읽는다. */
const koreanDate = (time: number) => new Date(time + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

const percent = (count: number, total: number) => (total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "-");

const number = (value: number) => value.toLocaleString("ko-KR");

export default function AdminRecommendationStatsPage() {
  const [from, setFrom] = useState(() => koreanDate(Date.now() - 29 * DAY_MS));
  const [to, setTo] = useState(() => koreanDate(Date.now()));
  const [range, setRange] = useState({ from, to });
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getRecommendationStats(range)
      .then((data) => { if (active) { setStats(data); setError(""); setLoading(false); } })
      .catch((cause: unknown) => {
        if (active) {
          setStats(null);
          setError(cause instanceof Error && cause.message ? cause.message : "추천 성과를 불러오지 못했습니다.");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [range]);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setRange({ from, to });
  };

  return <div className="space-y-7">
    <header className="border-b border-stone-200 pb-7">
      <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">AI 추천 성과</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">앱 AI 큐레이터가 보여준 매장을 회원이 열었는지, 추천 뒤 {stats?.attributionDays ?? 7}일 안에 찜하거나 기록했는지 봅니다.</p>
    </header>

    <form onSubmit={apply} className="flex flex-wrap items-end gap-3 border-b border-stone-200 pb-5" aria-label="기간 선택">
      <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">시작일</span><input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="min-h-11 rounded-sm border border-stone-300 bg-white px-3 text-sm" /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">종료일</span><input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="min-h-11 rounded-sm border border-stone-300 bg-white px-3 text-sm" /></label>
      <button type="submit" disabled={loading} className="min-h-11 rounded-sm bg-[#e60000] px-5 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60000] disabled:opacity-40">조회</button>
      <p className="text-xs text-stone-600">기간은 최대 92일입니다.</p>
    </form>

    {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    <div role="note" className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      최근 {stats?.attributionDays ?? 7}일 안에 한 추천은 찜·기록이 아직 더 생길 수 있어 전환율이 낮게 보입니다. 찜은 지금도 찜 상태인 것만 세고, 같은 기간에 다른 경로로 한 찜·기록도 함께 셉니다.
    </div>

    {loading ? <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-24 animate-pulse bg-stone-100" aria-hidden="true" />)}</div>
      : stats && <>
        <Summary row={stats.overall} />
        {stats.overall.runs === 0
          ? <div className="border border-stone-200 bg-white px-5 py-14 text-center text-sm text-stone-600">{stats.from} ~ {stats.to} 사이에 매장을 보여준 추천이 없습니다.</div>
          : <>
            <StatsTable title="로직 버전별" keyLabel="로직 버전" rows={stats.byAlgorithmVersion} />
            <StatsTable title="국물별" keyLabel="국물" rows={stats.bySoup} />
            <StatsTable title="순위별" keyLabel="순위" rows={stats.byRank} rankRows />
          </>}
      </>}
  </div>;
}

function Summary({ row }: { row: RecommendationStatsRow }) {
  const items = [
    { label: "추천 수", value: number(row.runs), hint: "매장을 보여준 추천" },
    { label: "노출 수", value: number(row.impressions), hint: "보여준 매장 칸" },
    { label: "열기율", value: percent(row.opened, row.impressions), hint: `${number(row.opened)} / ${number(row.impressions)}칸` },
    { label: "1위 열기율", value: percent(row.topOpened, row.runs), hint: `${number(row.topOpened)} / ${number(row.runs)}회` },
    { label: "찜 전환", value: percent(row.bookmarked, row.impressions), hint: `${number(row.bookmarked)}칸` },
    { label: "7일 기록 전환", value: percent(row.logged, row.impressions), hint: `${number(row.logged)}칸` },
  ];
  return <section aria-label="전체 요약" className="grid gap-3 sm:grid-cols-3">
    {items.map((item) => <div key={item.label} className="border border-stone-200 bg-white p-5">
      <p className="text-xs font-bold text-stone-600">{item.label}</p>
      <p className="mt-2 text-2xl font-black tabular-nums">{item.value}</p>
      <p className="mt-1 text-xs text-stone-500">{item.hint}</p>
    </div>)}
  </section>;
}

function StatsTable({ title, keyLabel, rows, rankRows = false }: { title: string; keyLabel: string; rows: RecommendationStatsRow[]; rankRows?: boolean }) {
  return <section className="border border-stone-200 bg-white">
    <div className="border-b border-stone-200 px-5 py-4 sm:px-6"><h2 className="text-lg font-black">{title}</h2></div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-stone-50 text-xs font-bold text-stone-600">
          <tr>
            <th scope="col" className="px-5 py-3">{keyLabel}</th>
            <th scope="col" className="px-3 py-3 text-right">추천</th>
            <th scope="col" className="px-3 py-3 text-right">노출</th>
            <th scope="col" className="px-3 py-3 text-right">열기율</th>
            {!rankRows && <th scope="col" className="px-3 py-3 text-right">1위 열기율</th>}
            <th scope="col" className="px-3 py-3 text-right">찜 전환</th>
            <th scope="col" className="px-5 py-3 text-right">7일 기록 전환</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {rows.map((row) => <tr key={row.key}>
            <th scope="row" className="break-all px-5 py-3 font-bold">{rankRows ? `${row.key}위` : row.key}</th>
            <td className="px-3 py-3 text-right tabular-nums">{number(row.runs)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{number(row.impressions)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{percent(row.opened, row.impressions)} <span className="text-xs text-stone-500">({number(row.opened)})</span></td>
            {!rankRows && <td className="px-3 py-3 text-right tabular-nums">{percent(row.topOpened, row.runs)}</td>}
            <td className="px-3 py-3 text-right tabular-nums">{percent(row.bookmarked, row.impressions)} <span className="text-xs text-stone-500">({number(row.bookmarked)})</span></td>
            <td className="px-5 py-3 text-right tabular-nums">{percent(row.logged, row.impressions)} <span className="text-xs text-stone-500">({number(row.logged)})</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </section>;
}
