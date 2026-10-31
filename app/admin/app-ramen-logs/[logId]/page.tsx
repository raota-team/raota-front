"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteAdminV2RamenLog, getAdminV2RamenLog, readAdminV2Error, type AdminV2RamenLogDetail } from "@/lib/api/admin-v2";
import { authorLabel, formatDateTime, revisitLabels, shopLabel, tasteCategoryLabels, visibilityBadgeClass, visibilityLabels } from "../ramen-log-labels";

const scoreItems = [["satisfaction", "만족도"], ["brothDensity", "국물 농도"], ["noodleFirmness", "면 익힘"], ["topping", "토핑"]] as const;

export default function AdminAppRamenLogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const [detail, setDetail] = useState<AdminV2RamenLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminV2RamenLog(logId)
      .then((log) => { if (active) { setDetail(log); setLoading(false); } })
      .catch((cause: unknown) => { if (active) { setError(readAdminV2Error(cause, "라멘로그를 불러오지 못했습니다.")); setLoading(false); } });
    return () => { active = false; };
  }, [logId]);

  const removeLog = async () => {
    if (!detail || !window.confirm("이 기록을 삭제하고 이 기록의 열린 신고를 모두 처리할까요?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await deleteAdminV2RamenLog(logId);
      setMessage(`기록 삭제 완료 · 이 기록의 열린 신고 ${response.closedReportCount}건을 처리했습니다.`);
      // 삭제 시각은 서버 값으로 다시 맞추고, 재조회가 실패해도 삭제 결과는 화면에 반영한다.
      setDetail(await getAdminV2RamenLog(logId).catch(() => ({ ...detail, deletedAt: new Date().toISOString(), openReportCount: 0 })));
    } catch (cause) { setError(readAdminV2Error(cause, "기록을 삭제하지 못했습니다.")); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="border border-stone-200 bg-white px-5 py-12 text-center text-sm text-stone-600">라멘로그를 불러오는 중…</div>;
  if (!detail) return <div className="space-y-4"><Link href="/admin/app-ramen-logs" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-stone-600 hover:text-[#e60000]"><ArrowLeft className="h-4 w-4" />앱 라멘로그 목록</Link><div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error || "기록을 찾을 수 없습니다."}</div></div>;

  const tasteGroups = [...detail.tasteNotes.reduce((groups, note) => {
    const category = note.category ? tasteCategoryLabels[note.category] ?? note.category : "기타";
    groups.set(category, [...(groups.get(category) ?? []), note]);
    return groups;
  }, new Map<string, AdminV2RamenLogDetail["tasteNotes"]>())];

  const meta: Array<[string, React.ReactNode]> = [
    ["작성자", <>{authorLabel(detail.author)} <span className="text-stone-500">#{detail.author.id}</span></>],
    ["매장", <Link href={`/admin/app-shops/${encodeURIComponent(detail.shop.id)}`} className="font-bold text-[#b00000] hover:underline">{shopLabel(detail.shop)} <span className="font-normal text-stone-500">#{detail.shop.id}</span></Link>],
    ["라멘 종류", detail.ramenType],
    ["방문일", detail.visitedAt],
    ["공감 / 댓글", `${detail.likeCount.toLocaleString("ko-KR")} / ${detail.commentCount.toLocaleString("ko-KR")}`],
    ["열린 신고", detail.openReportCount > 0 ? <strong className="text-[#b00000]">{detail.openReportCount}건</strong> : "0건"],
    ["작성", formatDateTime(detail.createdAt)],
    ["수정", formatDateTime(detail.updatedAt)],
  ];

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-7">
      <div><Link href="/admin/app-ramen-logs" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-stone-600 hover:text-[#e60000]"><ArrowLeft className="h-4 w-4" />앱 라멘로그 목록</Link><h1 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{detail.menuName}</h1><p className="mt-2 text-sm text-stone-600">기록 #{detail.id} · {shopLabel(detail.shop)} · {authorLabel(detail.author)}</p></div>
      <div className="flex flex-wrap items-center gap-3"><span className={`inline-flex items-center gap-1 rounded-sm px-3 py-2 text-xs font-bold ${visibilityBadgeClass[detail.visibility]}`}>{detail.visibility === "PRIVATE" && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}{visibilityLabels[detail.visibility]}</span>{detail.deletedAt ? <span className="rounded-sm bg-stone-200 px-3 py-2 text-xs font-bold text-stone-700">삭제됨 · {formatDateTime(detail.deletedAt)}</span> : <button type="button" disabled={busy} onClick={() => void removeLog()} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-4 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" />{busy ? "삭제 중…" : "기록 삭제"}</button>}</div>
    </header>
    {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    {message && <div role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
    <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">사진 {detail.imageUrls.length}장</h2>{detail.imageUrls.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{detail.imageUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-sm bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60000]"><Image src={url} alt={`기록 사진 ${index + 1}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized className="object-cover" /></a>)}</div> : <p className="mt-3 text-sm text-stone-600">사진이 없습니다.</p>}</section>
    <div className="grid gap-7 lg:grid-cols-2">
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">메모</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">{detail.note || "메모 없음"}</p></section>
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">평가</h2>{detail.scores ? <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">{scoreItems.map(([key, label]) => <div key={key}><dt className="text-xs font-bold text-stone-600">{label}</dt><dd className="mt-1 text-xl font-black tabular-nums">{detail.scores?.[key]}<span className="text-sm font-bold text-stone-500"> / 5</span></dd></div>)}</dl> : <p className="mt-3 text-sm text-stone-600">점수 없음 (웹에서 옮긴 기록)</p>}<dl className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm"><div className="flex gap-3"><dt className="w-20 shrink-0 font-bold text-stone-600">재방문 의향</dt><dd>{detail.revisitIntention ? revisitLabels[detail.revisitIntention] : "–"}</dd></div><div className="flex gap-3"><dt className="w-20 shrink-0 font-bold text-stone-600">맛 노트</dt><dd className="min-w-0 flex-1">{tasteGroups.length ? <dl className="space-y-2">{tasteGroups.map(([category, notes]) => <div key={category} className="flex gap-2"><dt className="w-10 shrink-0 text-xs font-bold leading-6 text-stone-500">{category}</dt><dd className="flex flex-wrap gap-2">{notes.map((note) => <span key={note.code} className={`rounded-sm bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700 ${note.label ? "" : "font-mono"}`}>{note.label ?? note.code}</span>)}</dd></div>)}</dl> : "–"}</dd></div></dl></section>
    </div>
    <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">기록 정보</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{meta.map(([label, value]) => <div key={label}><dt className="text-xs font-bold text-stone-600">{label}</dt><dd className="mt-1 text-sm">{value}</dd></div>)}</dl></section>
  </div>;
}
