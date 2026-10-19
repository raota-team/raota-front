"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Upload } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useState } from "react";
import { readAdminV2Error, type AdminV2ShopDetail, type AdminV2ShopForm } from "@/lib/api/admin-v2";
import { getUploadTicket, uploadFileToStorage } from "@/lib/api/files";
import { compressImage } from "@/lib/utils/image-optimization";
import { businessStatusLabels, ramenTypeOptions } from "./shop-labels";

const emptyForm: AdminV2ShopForm = {
  name: "", branchName: null, address: "", region: null, latitude: null, longitude: null, phone: null,
  tagline: null, description: null, ramenTypes: [], tags: [], instagramUrl: null, reservationUrl: null,
  websiteUrl: null, naverPlaceId: null, kakaoPlaceId: null, priceMin: null, priceMax: null,
  businessStatus: "UNKNOWN", closedDaysText: null, imageUrls: [],
};

const fieldClass = "min-h-11 w-full rounded-sm border border-stone-300 bg-white px-3 text-sm text-[#25282b] outline-none focus:border-[#e60000] focus-visible:ring-1 focus-visible:ring-[#e60000]";

export default function ShopForm({ initial, onSave }: { initial?: AdminV2ShopDetail; onSave: (form: AdminV2ShopForm) => Promise<void> }) {
  const [form, setForm] = useState<AdminV2ShopForm>(() => initial ? {
    name: initial.name, branchName: initial.branchName, address: initial.address, region: initial.region,
    latitude: initial.latitude, longitude: initial.longitude, phone: initial.phone, tagline: initial.tagline,
    description: initial.description, ramenTypes: initial.ramenTypes, tags: initial.tags,
    instagramUrl: initial.instagramUrl, reservationUrl: initial.reservationUrl, websiteUrl: initial.websiteUrl,
    naverPlaceId: initial.naverPlaceId, kakaoPlaceId: initial.kakaoPlaceId, priceMin: initial.priceMin,
    priceMax: initial.priceMax, businessStatus: initial.businessStatus, closedDaysText: initial.closedDaysText,
    imageUrls: initial.imageUrls,
  } : emptyForm);
  const [numbers, setNumbers] = useState(() => ({
    latitude: initial?.latitude?.toString() ?? "", longitude: initial?.longitude?.toString() ?? "",
    priceMin: initial?.priceMin?.toString() ?? "", priceMax: initial?.priceMax?.toString() ?? "",
  }));
  const [ramenDraft, setRamenDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [imageDraft, setImageDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const setField = <K extends keyof AdminV2ShopForm>(key: K, value: AdminV2ShopForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setOptional = (key: "branchName" | "region" | "phone" | "tagline" | "description" | "instagramUrl" | "reservationUrl" | "websiteUrl" | "naverPlaceId" | "kakaoPlaceId" | "closedDaysText", value: string) => setField(key, value || null);

  const addRamen = () => {
    const value = ramenDraft.trim();
    if (value && !form.ramenTypes.includes(value)) setField("ramenTypes", [...form.ramenTypes, value]);
    setRamenDraft("");
  };
  const addTag = () => {
    const value = tagDraft.trim();
    if (value && !form.tags.includes(value)) setField("tags", [...form.tags, value]);
    setTagDraft("");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (uploading) return;
    const parsed = Object.fromEntries(Object.entries(numbers).map(([key, value]) => [key, value.trim() === "" ? null : Number(value)])) as Record<keyof typeof numbers, number | null>;
    const ramenTypes = ramenDraft.trim() && !form.ramenTypes.includes(ramenDraft.trim()) ? [...form.ramenTypes, ramenDraft.trim()] : form.ramenTypes;
    const tags = tagDraft.trim() && !form.tags.includes(tagDraft.trim()) ? [...form.tags, tagDraft.trim()] : form.tags;
    const imageUrls = form.imageUrls.map((url) => url.trim()).filter(Boolean);
    if (!form.name.trim() || !form.address.trim()) { setError("매장명과 주소를 입력해 주세요."); return; }
    if (Object.values(parsed).some((value) => value !== null && !Number.isFinite(value))) { setError("좌표와 가격은 숫자로 입력해 주세요."); return; }
    if ((parsed.latitude === null) !== (parsed.longitude === null)) { setError("위도와 경도는 함께 입력하거나 둘 다 비워 주세요."); return; }
    if (parsed.latitude !== null && (parsed.latitude < -90 || parsed.latitude > 90) || parsed.longitude !== null && (parsed.longitude < -180 || parsed.longitude > 180)) { setError("위도는 -90~90, 경도는 -180~180 사이여야 합니다."); return; }
    if (parsed.priceMin !== null && parsed.priceMax !== null && parsed.priceMin > parsed.priceMax) { setError("최저 가격이 최고 가격보다 클 수 없습니다."); return; }
    if (ramenTypes.length > 20 || tags.length > 30 || imageUrls.length > 20) { setError("라멘 종류는 20개, 태그는 30개, 사진은 20개까지 등록할 수 있습니다."); return; }
    const payload: AdminV2ShopForm = {
      ...form,
      name: form.name.trim(), address: form.address.trim(),
      branchName: form.branchName?.trim() || null, region: form.region?.trim() || null,
      phone: form.phone?.trim() || null, tagline: form.tagline?.trim() || null,
      description: form.description?.trim() || null, instagramUrl: form.instagramUrl?.trim() || null,
      reservationUrl: form.reservationUrl?.trim() || null, websiteUrl: form.websiteUrl?.trim() || null,
      naverPlaceId: form.naverPlaceId?.trim() || null, kakaoPlaceId: form.kakaoPlaceId?.trim() || null,
      closedDaysText: form.closedDaysText?.trim() || null,
      ...parsed, ramenTypes, tags, imageUrls,
    };
    setSaving(true);
    setError("");
    try { await onSave(payload); setForm(payload); setRamenDraft(""); setTagDraft(""); }
    catch (cause) { setError(readAdminV2Error(cause, "기본 정보를 저장하지 못했습니다.")); }
    finally { setSaving(false); }
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    if (form.imageUrls.filter(Boolean).length + files.length > 20) { setError("사진은 최대 20장까지 등록할 수 있습니다."); return; }
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        const ticket = await getUploadTicket({ type: "SHOP", extension: "webp", contentType: "image/webp" });
        const url = await uploadFileToStorage(ticket, compressed);
        if (!url) throw new Error("업로드된 사진 URL을 받지 못했습니다.");
        uploaded.push(url);
      }
      setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, ...uploaded] }));
    } catch (cause) { setError(readAdminV2Error(cause, "사진을 업로드하지 못했습니다.")); }
    finally { setUploading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">기본 정보</h2><p className="mt-1 text-sm text-stone-600">앱 매장에 표시되는 이름, 위치와 소개를 입력합니다.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField label="매장명 *" value={form.name} onChange={(value) => setField("name", value)} maxLength={1000} required />
          <TextField label="지점명" value={form.branchName ?? ""} onChange={(value) => setOptional("branchName", value)} maxLength={255} />
          <TextField label="주소 *" value={form.address} onChange={(value) => setField("address", value)} required className="sm:col-span-2" />
          <TextField label="지역" value={form.region ?? ""} onChange={(value) => setOptional("region", value)} placeholder="서울 마포구" maxLength={1000} />
          <TextField label="전화번호" value={form.phone ?? ""} onChange={(value) => setOptional("phone", value)} maxLength={100} type="tel" />
          <TextField label="위도" value={numbers.latitude} onChange={(value) => setNumbers((current) => ({ ...current, latitude: value }))} type="number" step="any" placeholder="37.5665" />
          <TextField label="경도" value={numbers.longitude} onChange={(value) => setNumbers((current) => ({ ...current, longitude: value }))} type="number" step="any" placeholder="126.9780" />
          <TextField label="한 줄 소개" value={form.tagline ?? ""} onChange={(value) => setOptional("tagline", value)} className="sm:col-span-2" />
          <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-stone-600">설명</span><textarea value={form.description ?? ""} onChange={(event) => setOptional("description", event.target.value)} className={`${fieldClass} min-h-28 py-2.5 leading-6`} /></label>
        </div>
      </section>
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">메뉴·운영 정보</h2>
        <div className="mt-5 space-y-5"><div><p className="text-xs font-bold text-stone-600">라멘 종류 (복수 선택)</p><div className="mt-2 flex flex-wrap gap-2">{ramenTypeOptions.map((type) => <button type="button" key={type} aria-pressed={form.ramenTypes.includes(type)} onClick={() => setField("ramenTypes", form.ramenTypes.includes(type) ? form.ramenTypes.filter((item) => item !== type) : [...form.ramenTypes, type])} className={`min-h-11 rounded-sm border px-3 text-sm font-bold ${form.ramenTypes.includes(type) ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-300 text-stone-700 hover:border-[#e60000]"}`}>{type}</button>)}</div><div className="mt-3 flex flex-wrap gap-2">{form.ramenTypes.filter((type) => !ramenTypeOptions.includes(type)).map((type) => <button type="button" key={type} onClick={() => setField("ramenTypes", form.ramenTypes.filter((item) => item !== type))} className="min-h-11 rounded-sm border border-stone-300 px-3 text-sm font-bold" aria-label={`${type} 삭제`}>{type} ×</button>)}</div><div className="mt-2 flex gap-2"><input aria-label="기타 라멘 종류" value={ramenDraft} maxLength={50} onChange={(event) => setRamenDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRamen(); } }} placeholder="기타 종류 입력" className={`${fieldClass} max-w-xs`} /><button type="button" onClick={addRamen} className="min-h-11 rounded-sm border border-stone-300 px-3 text-sm font-bold">추가</button></div></div>
          <div><p className="text-xs font-bold text-stone-600">태그</p><div className="mt-2 flex flex-wrap gap-2">{form.tags.map((tag) => <button type="button" key={tag} onClick={() => setField("tags", form.tags.filter((item) => item !== tag))} aria-label={`${tag} 삭제`} className="min-h-11 rounded-sm bg-stone-100 px-3 text-sm font-bold">{tag} ×</button>)}</div><input aria-label="태그 입력" value={tagDraft} maxLength={50} onChange={(event) => setTagDraft(event.target.value)} onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="쉼표 또는 엔터로 태그 추가" className={`${fieldClass} mt-2`} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">영업 상태</span><select value={form.businessStatus} onChange={(event) => setField("businessStatus", event.target.value as AdminV2ShopForm["businessStatus"])} className={fieldClass}>{Object.entries(businessStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><TextField label="정기 휴무 안내" value={form.closedDaysText ?? ""} onChange={(value) => setOptional("closedDaysText", value)} maxLength={50} placeholder="매주 월요일" /><TextField label="최저 가격 (원)" value={numbers.priceMin} onChange={(value) => setNumbers((current) => ({ ...current, priceMin: value }))} type="number" min={0} /><TextField label="최고 가격 (원)" value={numbers.priceMax} onChange={(value) => setNumbers((current) => ({ ...current, priceMax: value }))} type="number" min={0} /></div>
        </div>
      </section>
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">링크·장소 ID</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><TextField label="인스타그램 URL" type="url" value={form.instagramUrl ?? ""} onChange={(value) => setOptional("instagramUrl", value)} maxLength={1000} /><TextField label="예약 URL" type="url" value={form.reservationUrl ?? ""} onChange={(value) => setOptional("reservationUrl", value)} /><TextField label="웹사이트 URL" type="url" value={form.websiteUrl ?? ""} onChange={(value) => setOptional("websiteUrl", value)} /><TextField label="네이버 플레이스 ID" value={form.naverPlaceId ?? ""} onChange={(value) => setOptional("naverPlaceId", value)} maxLength={100} /><TextField label="카카오 플레이스 ID" value={form.kakaoPlaceId ?? ""} onChange={(value) => setOptional("kakaoPlaceId", value)} maxLength={100} /></div></section>
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-black">매장 사진</h2><p className="mt-1 text-sm text-stone-600">첫 번째 사진이 대표 사진입니다. 위아래 버튼으로 순서를 바꾸거나 URL을 직접 입력할 수 있습니다.</p><div className="mt-5 space-y-3">{form.imageUrls.map((url, index) => <div key={index} className="flex flex-wrap items-center gap-2 border border-stone-200 p-3"><div className="relative h-14 w-14 shrink-0 bg-stone-100">{/^https?:\/\//.test(url) && <Image src={url} alt="" fill sizes="56px" unoptimized className="object-cover" />}</div><div className="min-w-40 flex-1"><label className="block text-xs font-bold text-stone-600" htmlFor={`shop-image-${index}`}>{index === 0 ? "대표 사진 URL" : `사진 ${index + 1} URL`}</label><input id={`shop-image-${index}`} type="url" value={url} onChange={(event) => setField("imageUrls", form.imageUrls.map((item, position) => position === index ? event.target.value : item))} className={`${fieldClass} mt-1`} /></div><div className="flex gap-1"><button type="button" disabled={index === 0} aria-label={`사진 ${index + 1} 위로`} onClick={() => { const next = [...form.imageUrls]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setField("imageUrls", next); }} className="min-h-11 min-w-11 border border-stone-300 disabled:opacity-40"><ArrowUp className="mx-auto h-4 w-4" /></button><button type="button" disabled={index === form.imageUrls.length - 1} aria-label={`사진 ${index + 1} 아래로`} onClick={() => { const next = [...form.imageUrls]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; setField("imageUrls", next); }} className="min-h-11 min-w-11 border border-stone-300 disabled:opacity-40"><ArrowDown className="mx-auto h-4 w-4" /></button><button type="button" aria-label={`사진 ${index + 1} 삭제`} onClick={() => setField("imageUrls", form.imageUrls.filter((_, position) => position !== index))} className="min-h-11 min-w-11 border border-stone-300 text-stone-600 hover:text-[#e60000]"><Trash2 className="mx-auto h-4 w-4" /></button></div></div>)}</div><div className="mt-4 flex flex-wrap items-end gap-3"><div className="flex min-w-52 flex-1 gap-2"><input aria-label="추가할 사진 URL" type="url" value={imageDraft} onChange={(event) => setImageDraft(event.target.value)} placeholder="https://..." className={fieldClass} /><button type="button" disabled={!imageDraft.trim() || form.imageUrls.length >= 20} onClick={() => { setField("imageUrls", [...form.imageUrls, imageDraft.trim()]); setImageDraft(""); }} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-sm border border-stone-300 px-3 text-sm font-bold disabled:opacity-40"><Plus className="h-4 w-4" />URL 추가</button></div><label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-stone-300 px-3 text-sm font-bold hover:border-[#e60000]"><Upload className="h-4 w-4" />{uploading ? "업로드 중…" : "사진 업로드"}<input type="file" accept="image/*" multiple disabled={uploading || form.imageUrls.length >= 20} onChange={(event) => { void uploadImages(event.target.files); event.target.value = ""; }} className="sr-only" /></label></div></section>
      {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="flex justify-end"><button type="submit" disabled={saving || uploading} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60000] disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "저장 중…" : initial ? "기본 정보 저장" : "숨김 매장으로 추가"}</button></div>
    </form>
  );
}

function TextField({ label, value, onChange, className = "", type = "text", required, placeholder, maxLength, min, step }: { label: string; value: string; onChange: (value: string) => void; className?: string; type?: string; required?: boolean; placeholder?: string; maxLength?: number; min?: number; step?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold text-stone-600">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} maxLength={maxLength} min={min} step={step} className={fieldClass} /></label>;
}
