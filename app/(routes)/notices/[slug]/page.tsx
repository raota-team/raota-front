import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatNoticeDate, getNotice, notices } from "@/app/lib/notices";

type NoticeDetailPageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => notices.map((notice) => ({ slug: notice.slug }));

export async function generateMetadata({ params }: NoticeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = getNotice(slug);
  if (!notice) return {};

  return {
    title: notice.title,
    description: notice.summary,
    alternates: { canonical: `/notices/${notice.slug}` },
  };
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { slug } = await params;
  const notice = getNotice(slug);
  if (!notice) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-12 md:pt-16">
      <Link href="/notices" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-[#e60000]">
        <ArrowLeft className="h-4 w-4" />
        공지사항 목록
      </Link>

      <header className="mb-10 border-b border-stone-200 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Notice</p>
          <span className="h-3 w-px bg-stone-200" />
          <span className="text-xs font-bold text-stone-500">{notice.category}</span>
        </div>
        <h1 className="mt-3 break-keep text-3xl font-black leading-tight tracking-tight text-[#25282b] md:text-5xl">{notice.title}</h1>
        <time dateTime={notice.publishedAt} className="mt-4 block text-sm font-medium text-[#7e7e7e]">게시일: {formatNoticeDate(notice.publishedAt)}</time>
      </header>

      <div className="space-y-8 text-base leading-8 text-[#25282b]">
        {notice.sections.map((section, index) => (
          <section key={`${notice.slug}-${index}`}>
            {section.heading && <h2 className="mb-3 text-xl font-black">{section.heading}</h2>}
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mb-3 last:mb-0">{paragraph}</p>)}
            {section.items && (
              <ul className="list-disc space-y-2 pl-5">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t border-stone-200 pt-6">
        <Link href="/notices" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#25282b] transition-colors hover:text-[#e60000]">
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </footer>
    </article>
  );
}
