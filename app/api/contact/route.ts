import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RECIPIENT = "kontakt@zkortu.pl";
const MAX_MESSAGE = 1200;

const SUBJECT_LABELS: Record<string, string> = {
  general: "Ogólne zapytanie",
  news: "Redakcja",
  bug: "Błąd / usterka",
  partnership: "Współpraca",
};

function validate(body: Record<string, unknown>): string | null {
  const { name, email, subject, message } = body;
  if (!name || typeof name !== "string" || !name.trim()) return "Podaj imię i nazwisko";
  if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) return "Nieprawidłowy adres e-mail";
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

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  const { name, email, subject, message } = body as Record<string, string>;
  const subjectLabel = SUBJECT_LABELS[subject];

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return NextResponse.json({ error: "Konfiguracja serwera — skontaktuj się bezpośrednio." }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Formularz zkortu.pl <noreply@zkortu.pl>",
    to: RECIPIENT,
    replyTo: email,
    subject: `[${subjectLabel}] Wiadomość od ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f2e1a">Nowa wiadomość z formularza kontaktowego</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 0;color:#666;width:120px">Imię i nazwisko</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666">E-mail</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666">Temat</td><td style="padding:8px 0">${subjectLabel}</td></tr>
        </table>
        <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
        <div style="white-space:pre-wrap;line-height:1.6">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
        <p style="font-size:12px;color:#aaa">Wysłane przez formularz na zkortu.pl · odpowiedź trafi bezpośrednio do nadawcy</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Nie udało się wysłać wiadomości. Spróbuj ponownie." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
