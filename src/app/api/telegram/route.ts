import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function tg(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  // 1. Only accept calls that carry our secret handshake from Telegram
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    !secret ||
    req.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const allowedId = Number(process.env.TELEGRAM_ALLOWED_USER_ID);
  const update = await req.json();

  // 2. Plain messages (e.g. /start) - reply only to Kathleen
  if (update.message) {
    const msg = update.message;
    if (msg.from?.id === allowedId) {
      await tg("sendMessage", {
        chat_id: msg.chat.id,
        text: "Hi Kathleen! 👋 I'm connected. Petitions waiting for review will show up here with Approve / Reject / Skip buttons.",
      });
    }
    return NextResponse.json({ ok: true });
  }

  // 3. Button taps
  if (update.callback_query) {
    const cq = update.callback_query;

    if (cq.from?.id !== allowedId) {
      await tg("answerCallbackQuery", {
        callback_query_id: cq.id,
        text: "Sorry, this bot is private.",
      });
      return NextResponse.json({ ok: true });
    }

    const [action, id] = String(cq.data ?? "").split(":");

    if (action === "noop") {
      await tg("answerCallbackQuery", { callback_query_id: cq.id });
      return NextResponse.json({ ok: true });
    }

    if (!["a", "r", "s"].includes(action) || !UUID_RE.test(id ?? "")) {
      await tg("answerCallbackQuery", {
        callback_query_id: cq.id,
        text: "Hmm, I didn't recognise that button.",
      });
      return NextResponse.json({ ok: true });
    }

    let label = "";
    let toast = "";

    try {
      if (action === "a") {
        const { data, error } = await getSupabase().rpc("approve_submission", {
          p_id: id,
        });
        if (error) throw error;
        label = data ? "✅ Approved" : "⚠️ Already handled";
        toast = data ? "Approved and published!" : "That one was already handled.";
      } else if (action === "r") {
        const { data, error } = await getSupabase().rpc("reject_submission", {
          p_id: id,
        });
        if (error) throw error;
        label = data ? "🚫 Rejected" : "⚠️ Already handled";
        toast = data ? "Rejected." : "That one was already handled.";
      } else {
        label = "⏭ Skipped (still pending)";
        toast = "Skipped. It's still waiting for you.";
      }

      // Replace the buttons with a single status label so it can't be tapped twice
      await tg("editMessageReplyMarkup", {
        chat_id: cq.message.chat.id,
        message_id: cq.message.message_id,
        reply_markup: {
          inline_keyboard: [[{ text: label, callback_data: "noop" }]],
        },
      });
      await tg("answerCallbackQuery", {
        callback_query_id: cq.id,
        text: toast,
      });
    } catch (e) {
      console.error("Telegram action failed:", e);
      await tg("answerCallbackQuery", {
        callback_query_id: cq.id,
        text: "Something went wrong - nothing was changed. Try again?",
        show_alert: true,
      });
    }
  }

  return NextResponse.json({ ok: true });
}