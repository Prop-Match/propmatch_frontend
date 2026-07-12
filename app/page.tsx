import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("brand");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-display font-bold text-primary">{t("name")}</h1>
      <p className="max-w-md text-body text-body-text">{t("tagline")}</p>
      <p className="text-small text-muted">
        هذا سقالة المشروع (Phase 0). واجهات المستخدم الكاملة قادمة في المراحل التالية.
      </p>
    </main>
  );
}
