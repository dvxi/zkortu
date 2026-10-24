import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
        <Search className="h-7 w-7" />
      </span>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-strong">Błąd 404</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Aut! Tej strony nie ma.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Strona mogła zostać przeniesiona albo adres zawiera literówkę. Sprawdź aktualności, wyniki na żywo lub ranking.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground hover:bg-ink-muted">
          <ArrowLeft className="h-4 w-4" /> Strona główna
        </Link>
        <Link href="/aktualnosci" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
          Aktualności
        </Link>
        <Link href="/wyniki-live" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
          Wyniki live
        </Link>
      </div>
    </div>
  );
}
