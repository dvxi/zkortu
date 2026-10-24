import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSiteSettings } from "@/lib/sanity";

const FALLBACK_RECIPIENT = "kontakt@zkortu.pl";
// Resend only sends from verified domains (resend.com/domains). Override with RESEND_FROM
// until zkortu.pl is verified, e.g. "zkortu.pl <onboarding@resend.dev>" (delivers to the account owner only).
const FROM = process.env.RESEND_FROM || "Formularz zkortu.pl <noreply@zkortu.pl>";
const MAX_MESSAGE = 1200;

const SUBJECT_LABELS: Record<string, string> = {
  general: "Ogólne zapytanie",
  news: "Redakcja",
  bug: "Błąd / usterka",
  partnership: "Współpraca",
};

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// best-effort per-instance limiter: 5 messages / 10 min / IP
const recent = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (list.length >= 5) return true;
  list.push(now);
  recent.set(ip, list);
  return false;
}

function validate(body: Record<string, unknown>): string | null {
  const { name, email, subject, message } = body;
  if (!name || typeof name !== "string" || !name.trim()) return "Podaj imię i nazwisko";
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) return "Nieprawidłowy adres e-mail";
  if (!subject || !SUBJECT_LABELS[subject as string]) return "Wybierz temat wiadomości";
  if (!message || typeof message !== "string" || message.trim().length < 10) return "Wiadomość jest za krótka";
  if (message.length > MAX_MESSAGE) return "Wiadomość jest za długa";
  return null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  // honeypot: bots fill every field
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  if (typeof body.startedAt === "number" && Date.now() - body.startedAt < 3000) {
    return NextResponse.json({ error: "Formularz wysłany zbyt szybko. Spróbuj ponownie." }, { status: 429 });
  }

  const validationError = validate(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 422 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "0.0.0.0";
  if (limited(ip)) return NextResponse.json({ error: "Za dużo wiadomości. Spróbuj za kilka minut." }, { status: 429 });

  const { name, email, subject, message } = body as Record<string, string>;
  const subjectLabel = SUBJECT_LABELS[subject];

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "[SENSITIVE]") {
    console.error("RESEND_API_KEY not set");
    return NextResponse.json({ error: "Wysyłka jest chwilowo niedostępna. Napisz bezpośrednio na adres e-mail redakcji." }, { status: 503 });
  }

  const settings = await getSiteSettings();
  const recipient = settings?.email || FALLBACK_RECIPIENT;
  const resend = new Resend(apiKey);

  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeMessage = escapeHtml(message.trim());

  const { error } = await resend.emails.send({
    from: FROM,
    to: recipient,
    replyTo: email.trim(),
    subject: `[${subjectLabel}] Wiadomość od ${name.trim()}`,
    text: `Imię i nazwisko: ${name.trim()}\nE-mail: ${email.trim()}\nTemat: ${subjectLabel}\n\n${message.trim()}`,
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
        <h2 style="color:#d96f22;margin:0 0 16px">Nowa wiadomość z formularza zkortu.pl</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px 0;color:#78716c;width:140px">Imię i nazwisko</td><td style="padding:6px 0;font-weight:600">${safeName}</td></tr>
          <tr><td style="padding:6px 0;color:#78716c">E-mail</td><td style="padding:6px 0"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr><td style="padding:6px 0;color:#78716c">Temat</td><td style="padding:6px 0">${subjectLabel}</td></tr>
        </table>
        <hr style="margin:16px 0;border:none;border-top:1px solid #e7e5e4"/>
        <div style="white-space:pre-wrap;line-height:1.6;font-size:15px">${safeMessage}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e7e5e4"/>
        <p style="font-size:12px;color:#a8a29e">Wysłane przez formularz na zkortu.pl. Odpowiedź trafi bezpośrednio do nadawcy.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    const domainIssue = /not verified|domain/i.test(error.message ?? "");
    return NextResponse.json(
      { error: domainIssue ? "Wysyłka jest chwilowo niedostępna. Napisz bezpośrednio na adres e-mail redakcji." : "Nie udało się wysłać wiadomości. Spróbuj ponownie." },
      { status: domainIssue ? 503 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
