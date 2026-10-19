"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import {
  getAdminV2Shop, readAdminV2Error, updateAdminV2BusinessHours, updateAdminV2ServicePerks,
  updateAdminV2Shop, updateAdminV2ShopVisibility,
  type AdminV2BusinessHour, type AdminV2PerkStatus, type AdminV2PerkType,
  type AdminV2ServicePerk, type AdminV2ShopDetail, type AdminV2ShopForm,
} from "@/lib/api/admin-v2";
import ShopForm from "../ShopForm";
import { businessStatusLabels } from "../shop-labels";

const days = [[1, "월요일"], [2, "화요일"], [3, "수요일"], [4, "목요일"], [5, "금요일"], [6, "토요일"], [7, "일요일"]] as const;
const perks = [["NOODLE_REFILL", "면 리필"], ["RICE_REFILL", "밥 리필"], ["SOUP_REFILL", "육수 리필"], ["CONDIMENT", "양념"]] as const;
const perkStatusLabels: Record<AdminV2PerkStatus | "NONE", string> = { FREE: "무료", PAID: "유료", NOT_OFFERED: "제공 안 함", UNKNOWN: "모름", NONE: "미등록" };
const inputClass = "min-h-11 w-full rounded-sm border border-stone-300 bg-white px-3 text-sm outline-none focus:border-[#e60000] focus-visible:ring-1 focus-visible:ring-[#e60000] disabled:bg-stone-100 disabled:text-stone-500";

type HourDraft = { state: "NONE" | "CLOSED" | "OPEN"; opensAt: string; closesAt: string; breakStart: string; breakEnd: string; lastOrderAt: string };
type PerkDraft = { status: AdminV2PerkStatus | "NONE"; price: string; condition: string };

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "확인 전";
}

export default function AdminAppShopDetailPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [detail, setDetail] = useState<AdminV2ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminV2Shop(shopId)
      .then((shop) => { if (active) { setDetail(shop); setLoading(false); } })
      .catch((cause: unknown) => { if (active) { setError(readAdminV2Error(cause, "앱 매장 정보를 불러오지 못했습니다.")); setLoading(false); } });
    return () => { active = false; };
  }, [shopId]);

  const saveBasic = async (form: AdminV2ShopForm) => {
    const result = await updateAdminV2Shop(shopId, form);
    setDetail(result);
    setFormVersion((current) => current + 1);
    setMessage("기본 정보를 저장했습니다.");
  };

  const toggleVisibility = async () => {
    if (!detail) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await updateAdminV2ShopVisibility(shopId, !detail.published);
      setDetail(result);
      setMessage(result.published ? "앱 매장을 공개했습니다." : "앱 매장을 숨겼습니다.");
    } catch (cause) { setError(readAdminV2Error(cause, "공개 상태를 변경하지 못했습니다.")); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="border border-stone-200 bg-white px-5 py-12 text-center text-sm text-stone-600">앱 매장 정보를 불러오는 중…</div>;
  if (!detail) return <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error || "앱 매장을 찾을 수 없습니다."}</div>;

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-7"><div><Link href="/admin/app-shops" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-stone-600 hover:text-[#e60000]"><ArrowLeft className="h-4 w-4" />앱 매장 목록</Link><h1 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{detail.name}{detail.branchName ? ` · ${detail.branchName}` : ""}</h1><p className="mt-2 text-sm text-stone-600">매장 #{detail.id} · {businessStatusLabels[detail.businessStatus]} · 수정 {formatDate(detail.updatedAt)}</p></div><div className="flex items-center gap-3"><span className={`rounded-sm px-3 py-2 text-xs font-bold ${detail.published ? "bg-red-50 text-[#b00000]" : "bg-stone-200 text-stone-700"}`}>{detail.published ? "공개 중" : "숨김"}</span><button type="button" disabled={busy} onClick={() => void toggleVisibility()} className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-stone-300 bg-white px-4 text-sm font-bold hover:border-[#e60000] hover:text-[#e60000] disabled:opacity-40">{detail.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{busy ? "처리 중…" : detail.published ? "숨김으로 전환" : "공개로 전환"}</button></div></header>
    {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    {message && <div role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
    <ShopForm key={`${shopId}-${formVersion}`} initial={detail} onSave={saveBasic} />
    <BusinessHours key={`${shopId}-hours`} shopId={shopId} initial={detail.businessHours} verifiedAt={detail.hoursVerifiedAt} onSaved={setDetail} />
    <ServicePerks key={`${shopId}-perks`} shopId={shopId} initial={detail.servicePerks} onSaved={setDetail} />
    <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">앱 통계 · AI 요약</h2><p className="mt-1 text-sm text-stone-600">앱에서 수집된 읽기 전용 정보입니다.</p><dl className="mt-5 grid gap-4 border-y border-stone-100 py-5 sm:grid-cols-3">{[["조회", detail.viewCount], ["기록", detail.logCount], ["북마크", detail.bookmarkCount]].map(([label, count]) => <div key={label}><dt className="text-xs font-bold text-stone-600">{label}</dt><dd className="mt-1 text-xl font-black tabular-nums">{Number(count).toLocaleString("ko-KR")}</dd></div>)}</dl><div className="mt-5"><h3 className="text-sm font-bold">AI 리뷰 요약</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{detail.aiReviewSummary || "아직 생성된 요약이 없습니다."}</p><div className="mt-3 flex flex-wrap gap-2">{detail.aiSummaryKeywords.map((keyword) => <span key={keyword} className="rounded-sm bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700">{keyword}</span>)}</div><p className="mt-3 text-xs text-stone-600">요약 생성: {formatDate(detail.aiSummaryGeneratedAt)}</p></div></section>
  </div>;
}

function BusinessHours({ shopId, initial, verifiedAt, onSaved }: { shopId: string; initial: AdminV2BusinessHour[]; verifiedAt: string | null; onSaved: (detail: AdminV2ShopDetail) => void }) {
  const [draft, setDraft] = useState<HourDraft[]>(() => days.map(([day]) => {
    const hour = initial.find((item) => item.dayOfWeek === day);
    return { state: !hour ? "NONE" : hour.closed ? "CLOSED" : "OPEN", opensAt: hour?.opensAt ?? "", closesAt: hour?.closesAt ?? "", breakStart: hour?.breakStart ?? "", breakEnd: hour?.breakEnd ?? "", lastOrderAt: hour?.lastOrderAt ?? "" };
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const updateDay = (index: number, change: Partial<HourDraft>) => setDraft((current) => current.map((day, dayIndex) => dayIndex === index ? { ...day, ...change } : day));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const hours: AdminV2BusinessHour[] = [];
    for (const [index, [day, label]] of days.entries()) {
      const row = draft[index];
      if (row.state === "NONE") continue;
      if (row.state === "CLOSED") { hours.push({ dayOfWeek: day, closed: true, opensAt: null, closesAt: null, breakStart: null, breakEnd: null, lastOrderAt: null }); continue; }
      if (!row.opensAt || !row.closesAt) { setError(`${label}의 영업 시작과 마감 시간을 모두 입력해 주세요.`); return; }
      if (Boolean(row.breakStart) !== Boolean(row.breakEnd)) { setError(`${label}의 브레이크 시작과 끝을 함께 입력해 주세요.`); return; }
      hours.push({ dayOfWeek: day, closed: false, opensAt: row.opensAt, closesAt: row.closesAt, breakStart: row.breakStart || null, breakEnd: row.breakEnd || null, lastOrderAt: row.lastOrderAt || null });
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await updateAdminV2BusinessHours(shopId, hours);
      onSaved(result);
      setMessage("영업시간을 저장했습니다. 확인일이 갱신되었습니다.");
    } catch (cause) { setError(readAdminV2Error(cause, "영업시간을 저장하지 못했습니다.")); }
    finally { setSaving(false); }
  };

  return <form onSubmit={save} className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">영업시간</h2><p className="mt-1 text-sm leading-6 text-stone-600">등록하지 않을 요일은 정보 없음으로 두세요. 휴무일은 시간이 모두 비워져 저장됩니다. 저장하면 확인일이 갱신됩니다.</p><p className="mt-2 text-xs font-bold text-stone-600">현재 확인일: {formatDate(verifiedAt)}</p>
    <div className="mt-5 space-y-3">{days.map(([day, label], index) => <div key={day} className="border border-stone-200 p-3 sm:p-4"><div className="flex flex-wrap items-center gap-3"><strong className="min-w-14 text-sm">{label}</strong><label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name={`day-${day}`} checked={draft[index].state === "NONE"} onChange={() => updateDay(index, { state: "NONE" })} className="accent-[#e60000]" />정보 없음</label><label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name={`day-${day}`} checked={draft[index].state === "CLOSED"} onChange={() => updateDay(index, { state: "CLOSED" })} className="accent-[#e60000]" />휴무</label><label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name={`day-${day}`} checked={draft[index].state === "OPEN"} onChange={() => updateDay(index, { state: "OPEN" })} className="accent-[#e60000]" />영업</label></div><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["영업 시작", "opensAt"], ["영업 마감", "closesAt"], ["브레이크 시작", "breakStart"], ["브레이크 끝", "breakEnd"], ["라스트오더", "lastOrderAt"]].map(([timeLabel, field]) => <label key={field} className="block"><span className="mb-1 block text-xs font-bold text-stone-600">{timeLabel}</span><input type="time" value={draft[index][field as keyof Omit<HourDraft, "state">]} onChange={(event) => updateDay(index, { [field]: event.target.value })} disabled={draft[index].state !== "OPEN"} aria-label={`${label} ${timeLabel}`} className={inputClass} /></label>)}</div></div>)}</div>
    {error && <p role="alert" className="mt-4 whitespace-pre-line text-sm text-rose-700">{error}</p>}{message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
    <div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "저장 중…" : "영업시간 저장"}</button></div>
  </form>;
}

function ServicePerks({ shopId, initial, onSaved }: { shopId: string; initial: AdminV2ServicePerk[]; onSaved: (detail: AdminV2ShopDetail) => void }) {
  const [draft, setDraft] = useState<Record<AdminV2PerkType, PerkDraft>>(() => Object.fromEntries(perks.map(([type]) => {
    const perk = initial.find((item) => item.type === type);
    return [type, { status: perk?.status ?? "NONE", price: perk?.price?.toString() ?? "", condition: perk?.condition ?? "" }];
  })) as Record<AdminV2PerkType, PerkDraft>);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const updatePerk = (type: AdminV2PerkType, change: Partial<PerkDraft>) => setDraft((current) => ({ ...current, [type]: { ...current[type], ...change } }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const selected: Array<Omit<AdminV2ServicePerk, "verifiedAt">> = [];
    for (const [type, label] of perks) {
      const row = draft[type];
      if (row.status === "NONE") continue;
      const price = row.status === "PAID" ? row.price.trim() === "" ? null : Number(row.price) : null;
      if (row.status === "PAID" && (price === null || !Number.isFinite(price) || price < 0)) { setError(`${label}의 유료 가격을 0원 이상으로 입력해 주세요.`); return; }
      selected.push({ type, status: row.status, price, condition: row.condition.trim() || null });
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await updateAdminV2ServicePerks(shopId, selected);
      onSaved(result);
      setMessage("혜택 정보를 저장했습니다.");
    } catch (cause) { setError(readAdminV2Error(cause, "혜택 정보를 저장하지 못했습니다.")); }
    finally { setSaving(false); }
  };

  return <form onSubmit={save} className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">혜택</h2><p className="mt-1 text-sm text-stone-600">미등록 항목은 저장 대상에서 제외됩니다. 무료·유료·제공 여부와 조건을 입력하세요.</p><div className="mt-5 space-y-3">{perks.map(([type, label]) => <div key={type} className="grid gap-3 border border-stone-200 p-3 sm:grid-cols-[7rem_10rem_8rem_minmax(0,1fr)] sm:items-end sm:p-4"><strong className="pb-3 text-sm sm:pb-0">{label}</strong><label className="block"><span className="mb-1 block text-xs font-bold text-stone-600">상태</span><select value={draft[type].status} onChange={(event) => updatePerk(type, { status: event.target.value as PerkDraft["status"] })} aria-label={`${label} 상태`} className={inputClass}>{Object.entries(perkStatusLabels).map(([value, caption]) => <option value={value} key={value}>{caption}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-bold text-stone-600">유료 가격 (원)</span><input type="number" min={0} value={draft[type].price} onChange={(event) => updatePerk(type, { price: event.target.value })} disabled={draft[type].status !== "PAID"} aria-label={`${label} 유료 가격`} className={inputClass} /></label><label className="block"><span className="mb-1 block text-xs font-bold text-stone-600">조건</span><input value={draft[type].condition} maxLength={1000} onChange={(event) => updatePerk(type, { condition: event.target.value })} disabled={draft[type].status === "NONE"} placeholder="예: 1회 무료" aria-label={`${label} 조건`} className={inputClass} /></label>{initial.find((perk) => perk.type === type)?.verifiedAt && <p className="text-xs text-stone-600 sm:col-span-4">마지막 확인: {formatDate(initial.find((perk) => perk.type === type)?.verifiedAt ?? null)}</p>}</div>)}</div>
    {error && <p role="alert" className="mt-4 whitespace-pre-line text-sm text-rose-700">{error}</p>}{message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
    <div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "저장 중…" : "혜택 저장"}</button></div>
  </form>;
}
