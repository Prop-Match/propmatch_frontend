"use client";

/**
 * Last-resort boundary for errors in the root layout itself. Must render its
 * own <html>/<body>. Segment-level errors are handled by the per-group
 * error.tsx files, which keep the surrounding layout/nav intact.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>حدث خطأ غير متوقع</h1>
          <p style={{ marginTop: "0.5rem", color: "#64748b" }}>نعتذر، حدثت مشكلة. برجاء إعادة تحميل الصفحة.</p>
          <button
            onClick={reset}
            style={{ marginTop: "1rem", borderRadius: "0.75rem", background: "#0e7c86", color: "#fff", padding: "0.5rem 1.25rem", fontWeight: 600 }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
