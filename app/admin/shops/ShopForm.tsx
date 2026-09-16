"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createAdminShop, getAdminShop, updateAdminShop, type AdminShopForm } from "@/lib/api/admin";

const emptyForm: AdminShopForm = {
  name: "",
  branchName: "",
  naverMapId: "",
  city: "",
  district: "",
  street: "",
  detail: "",
  latitude: null,
  longitude: null,
  closedDays: "",
  openTime: "",
  closeTime: "",
  breakStart: "",
  breakEnd: "",
  instagramUrl: "",
  catchTableUrl: "",
  description: "",
  detailedDescription: "",
  parkingInfo: "",
  imageUrl: "",
  tags: "",
  published: false,
  normalMenus: [],
  eventMenus: [],
};

export default function ShopForm({ shopId }: { shopId?: number }) {
  const router = useRouter();
  const editing = shopId !== undefined;
  const [form, setForm] = useState<AdminShopForm>(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing || shopId === undefined) return;
    getAdminShop(shopId)
      .then((shop) => setForm({ ...emptyForm, ...shop, normalMenus: shop.normalMenus || [], eventMenus: shop.eventMenus || [] }))
      .catch((cause) => setError(readError(cause)))
      .finally(() => setLoading(false));
  }, [editing, shopId]);

  const setField = <K extends keyof AdminShopForm>(field: K, value: AdminShopForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.street.trim()) {
      setError("매장명, 시·도, 도로명 주소는 필수입니다.");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const result = editing && shopId !== undefined ? await updateAdminShop(shopId, form) : await createAdminShop(form);
      setMessage(editing ? "매장 정보를 저장했습니다." : "매장을 추가했습니다.");
      if (!editing) router.replace(`/admin/shops/${result.id}`);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="border border-stone-200 bg-white px-5 py-12 text-center text-sm text-stone-500">매장 정보를 불러오는 중…</div>;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-7"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e60000]">Operations / shops / {editing ? "edit" : "new"}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{editing ? "매장 정보 수정" : "매장 추가"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">{editing ? "기본 정보와 운영 시간을 수정합니다. 기존 메뉴와 색인 문서는 보존됩니다." : "필수 주소 정보부터 입력하고 매장을 운영 목록에 추가합니다."}</p></div><Link href="/admin/shops" className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]"><ArrowLeft className="h-3.5 w-3.5" />목록으로</Link></header>
      {(message || error) && <div className={`border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role={error ? "alert" : "status"}>{error || message}</div>}
      <form onSubmit={submit} className="space-y-5">
        <FormSection title="기본 정보" description="서비스에 노출되는 매장명과 주소입니다."><div className="grid gap-4 sm:grid-cols-2"><Field label="매장명 *" value={form.name} onChange={(value) => setField("name", value)} /><Field label="지점명" value={form.branchName || ""} onChange={(value) => setField("branchName", value)} /><Field label="시·도 *" value={form.city} onChange={(value) => setField("city", value)} /><Field label="구·군" value={form.district || ""} onChange={(value) => setField("district", value)} /><Field label="도로명 주소 *" value={form.street} onChange={(value) => setField("street", value)} className="sm:col-span-2" /><Field label="상세 주소" value={form.detail || ""} onChange={(value) => setField("detail", value)} className="sm:col-span-2" /><Field label="Naver Map ID" value={form.naverMapId || ""} onChange={(value) => setField("naverMapId", value)} /><Field label="대표 이미지 URL" value={form.imageUrl || ""} onChange={(value) => setField("imageUrl", value)} /></div></FormSection>
        <FormSection title="운영 정보" description="앱 매장 상세에 표시될 영업시간과 부가 정보입니다."><div className="grid gap-4 sm:grid-cols-2"><Field label="휴무일" value={form.closedDays || ""} onChange={(value) => setField("closedDays", value)} /><Field label="태그" value={form.tags || ""} onChange={(value) => setField("tags", value)} /><Field label="영업 시작" value={form.openTime || ""} onChange={(value) => setField("openTime", value)} placeholder="11:30" /><Field label="영업 종료" value={form.closeTime || ""} onChange={(value) => setField("closeTime", value)} placeholder="21:00" /><Field label="브레이크 시작" value={form.breakStart || ""} onChange={(value) => setField("breakStart", value)} placeholder="15:00" /><Field label="브레이크 종료" value={form.breakEnd || ""} onChange={(value) => setField("breakEnd", value)} placeholder="17:00" /><Field label="주차 안내" value={form.parkingInfo || ""} onChange={(value) => setField("parkingInfo", value)} className="sm:col-span-2" /><Field label="한 줄 설명" value={form.description || ""} onChange={(value) => setField("description", value)} className="sm:col-span-2" /><TextArea label="상세 설명" value={form.detailedDescription || ""} onChange={(value) => setField("detailedDescription", value)} /><Field label="Instagram URL" value={form.instagramUrl || ""} onChange={(value) => setField("instagramUrl", value)} /><Field label="CatchTable URL" value={form.catchTableUrl || ""} onChange={(value) => setField("catchTableUrl", value)} /></div></FormSection>
        <FormSection title="운영 상태" description="비공개로 저장하면 사용자 앱의 매장 목록에서 숨겨집니다."><label className="flex min-h-12 items-center gap-3 border border-stone-200 bg-stone-50 px-4 text-sm font-bold"><input type="checkbox" checked={form.published === true} onChange={(event) => setField("published", event.target.checked)} className="h-4 w-4 accent-[#e60000]" />사용자에게 매장 공개</label><p className="mt-3 text-xs leading-5 text-stone-500">현재 메뉴 {form.normalMenus?.length || 0}개 · 이벤트 메뉴 {form.eventMenus?.length || 0}개가 연결되어 있습니다. 메뉴 편집은 기존 데이터를 보존하기 위해 별도 작업으로 분리합니다.</p></FormSection>
        <div className="flex flex-wrap justify-end gap-2"><Link href="/admin/shops" className="inline-flex min-h-11 items-center justify-center rounded-sm border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]">취소</Link><button type="submit" disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "저장 중…" : editing ? "변경 사항 저장" : "매장 추가"}</button></div>
      </form>
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black tracking-[-0.03em]">{title}</h2><p className="mt-1 text-sm text-stone-500">{description}</p><div className="mt-5">{children}</div></section>; }
function Field({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) { return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold text-stone-500">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-11 w-full border border-stone-300 px-3 text-sm outline-none focus:border-[#e60000]" /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-stone-500">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 w-full resize-y border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-[#e60000]" /></label>; }
function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "매장 정보를 저장하지 못했습니다."; }
