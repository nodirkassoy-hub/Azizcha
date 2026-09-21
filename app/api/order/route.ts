/**
 * POST /api/order — serverless order handler.
 *
 * SECURITY: the Telegram bot token lives ONLY in server env vars.
 * It is never sent to the browser, never logged, never prefixed with NEXT_PUBLIC_.
 * The server always recomputes the price and ignores any client-sent amount.
 *
 * Success is reported ONLY when Telegram accepted the message (ok: true).
 */

import { NextResponse } from "next/server";
import type { ProductId } from "@/config/products";
import {
  CONTACT,
  ORDER_MESSAGE_LANG,
  QUANTITY_MAX,
  QUANTITY_MIN,
  type DensityValue,
} from "@/config/site";
import { dictionaries, type SiteLang } from "@/content";
import { formatDensity, formatThickness, formatUsd, getQuantityUnit, getUnitPriceUsd } from "@/lib/pricing";
import { orderRequestSchema, orderSchema } from "@/lib/validation";

export const runtime = "nodejs";

const TELEGRAM_TIMEOUT_MS = 10_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface OrderSummaryLine {
  label: string;
  value: string;
}

function buildSummary(input: {
  productId: ProductId;
  name: string;
  phone: string;
  density: number | null;
  thickness: number | null;
  quantity: number;
  note?: string;
}): OrderSummaryLine[] {
  const dict = dictionaries[ORDER_MESSAGE_LANG as SiteLang];
  const crushed = input.productId === "maydalangan";
  const unitPrice = getUnitPriceUsd(input.productId, (input.density as DensityValue) ?? null);
  const total = unitPrice * input.quantity;
  const unit = getQuantityUnit(input.productId);

  const lines: OrderSummaryLine[] = [
    { label: dict.order.summary.product, value: dict.products.names[input.productId] },
  ];
  if (!crushed && input.density != null) {
    lines.push({ label: dict.order.summary.density, value: formatDensity(input.density as DensityValue) });
  }
  if (!crushed && input.thickness != null) {
    lines.push({
      label: dict.order.summary.thickness,
      value: formatThickness(input.thickness as Parameters<typeof formatThickness>[0]),
    });
  }
  lines.push({ label: dict.order.summary.quantity, value: `${input.quantity} ${unit}` });
  lines.push({
    label: dict.order.summary.price,
    value: crushed ? `${formatUsd(unitPrice)} / KG` : formatUsd(unitPrice),
  });
  lines.push({ label: dict.order.summary.total, value: formatUsd(total) });
  lines.push({ label: dict.order.name, value: input.name });
  lines.push({ label: dict.order.phone, value: input.phone });
  if (input.note) lines.push({ label: dict.order.note, value: input.note });
  return lines;
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    // Do not log secrets or reveal which variable is missing.
    console.error("[order] telegram env is not configured");
    return NextResponse.json({ ok: false, error: "server-misconfigured" }, { status: 500 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = orderRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
      { status: 400 },
    );
  }

  // Full validation with phone normalization to +998XXXXXXXXX.
  const validated = orderSchema.safeParse({
    name: parsed.data.name,
    phone: parsed.data.phone,
    productId: parsed.data.productId,
    density: parsed.data.density ?? null,
    thickness: parsed.data.thickness ?? null,
    quantity: parsed.data.quantity,
    note: parsed.data.note,
  });
  if (!validated.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: validated.error.issues.map((i) => ({ path: i.path, message: i.message })) },
      { status: 400 },
    );
  }

  const data = validated.data;
  const crushed = data.productId === "maydalangan";
  const density = crushed ? null : ((data.density ?? null) as DensityValue | null);
  const thickness = crushed ? null : data.thickness ?? null;

  if (data.quantity < QUANTITY_MIN || data.quantity > QUANTITY_MAX) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  // Server-side price computation (client-sent price/total are ignored).
  let unitPrice: number;
  try {
    unitPrice = getUnitPriceUsd(data.productId, density);
  } catch {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const lines = buildSummary({
    productId: data.productId,
    name: data.name,
    phone: data.phone,
    density,
    thickness,
    quantity: data.quantity,
    note: data.note,
  });

  const title = "🆕 Yangi buyurtma — IZO PLUS";
  const text = [title, "", ...lines.map((l) => `${escapeHtml(l.label)}: <b>${escapeHtml(l.value)}</b>`)].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      cache: "no-store",
    });

    const result = (await response.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!response.ok || !result?.ok) {
      console.error("[order] telegram rejected message", response.status, result?.description ?? "");
      return NextResponse.json({ ok: false, error: "telegram" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Network error or timeout — never claim the order was received.
    console.error("[order] telegram request failed");
    return NextResponse.json({ ok: false, error: "network" }, { status: 504 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method-not-allowed" }, { status: 405 });
}
