import Link from "next/link";
import { ArrowLeft, ArrowRight, Megaphone } from "lucide-react";
import { formatNoticeDate, notices } from "@/app/lib/notices";

const NOTICES_PER_PAGE = 10;

type NoticesPageProps = { searchParams: Promise<{ page?: string }> };

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam ?? "1");
  const totalPages = Math.max(1, Math.ceil(notices.length / NOTICES_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(Math.floor(requestedPage), 1), totalPages) : 1;
  const pageNotices = notices.slice((currentPage - 1) * NOTICES_PER_PAGE, currentPage * NOTICES_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-12 md:pt-16">
      <header className="border-b border-stone-200 pb-8 md:pb-10">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Notice</p>
        <h1 className="text-4xl font-black tracking-tight text-[#25282b] md:text-5xl">공지사항</h1>
        <p className="mt-4 max-w-xl break-keep text-sm font-medium leading-6 text-[#7e7e7e] md:text-base">
          라오타의 새로운 소식과 서비스 운영에 필요한 안내를 전해드립니다.
        </p>
      </header>

      <section className="divide-y divide-stone-200 border-b border-stone-200" aria-label="공지사항 목록">
        {pageNotices.map((notice) => (
          <Link
            key={notice.slug}
            href={`/notices/${notice.slug}`}
            className="group grid gap-2 py-4 transition-colors hover:bg-stone-50 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4 md:px-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm bg-red-50 px-2 py-1 text-[10px] font-black text-[#e60000]">{notice.category}</span>
                <time dateTime={notice.publishedAt} className="text-xs font-medium text-stone-400">{formatNoticeDate(notice.publishedAt)}</time>
              </div>
              <h2 className="mt-1.5 text-base font-black text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-lg">{notice.title}</h2>
              <p className="mt-1 line-clamp-1 text-xs leading-5 text-stone-500 md:text-sm">{notice.summary}</p>
            </div>
            <span className="hidden h-9 w-9 items-center justify-center border border-stone-200 text-stone-400 transition-[color,border-color,transform] group-hover:translate-x-1 group-hover:border-[#e60000] group-hover:text-[#e60000] md:flex">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="공지사항 페이지 이동">
          <Link href={`/notices?page=${Math.max(1, currentPage - 1)}`} aria-disabled={currentPage === 1} className={`flex h-10 w-10 items-center justify-center border border-stone-200 ${currentPage === 1 ? "pointer-events-none text-stone-300" : "text-stone-600 hover:border-[#e60000] hover:text-[#e60000]"}`}><ArrowLeft className="h-4 w-4" /></Link>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <Link key={page} href={`/notices?page=${page}`} aria-current={page === currentPage ? "page" : undefined} className={`flex h-10 min-w-10 items-center justify-center border px-3 text-xs font-black ${page === currentPage ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-200 text-stone-600 hover:border-[#e60000] hover:text-[#e60000]"}`}>{page}</Link>
          ))}
          <Link href={`/notices?page=${Math.min(totalPages, currentPage + 1)}`} aria-disabled={currentPage === totalPages} className={`flex h-10 w-10 items-center justify-center border border-stone-200 ${currentPage === totalPages ? "pointer-events-none text-stone-300" : "text-stone-600 hover:border-[#e60000] hover:text-[#e60000]"}`}><ArrowRight className="h-4 w-4" /></Link>
        </nav>
      )}

      <div className="flex items-start gap-3 pt-6 text-sm leading-6 text-stone-500">
        <Megaphone className="mt-1 h-4 w-4 shrink-0 text-[#e60000]" />
        <p>서비스 이용과 관련해 궁금한 점은 contact@raota.net으로 문의해 주세요.</p>
      </div>
    </div>
  );
}
