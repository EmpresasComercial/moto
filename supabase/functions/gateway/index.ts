import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RpcResult = unknown;

type OperationRule = {
  name: string;
  roles: string[];
};

export const SECRET_PASSPHRASE = 'AsiaraySecureProxyPayloadKey2026';

async function getDerivedKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('asiaray-salt-fixed'),
      iterations: 1000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

let cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = await getDerivedKey(SECRET_PASSPHRASE);
  }
  return cachedKey;
}

export async function encryptPayload(data: any): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bufferToBase64(combined.buffer);
}

export async function decryptPayload(encryptedBase64: string): Promise<any> {
  if (!encryptedBase64) return null;
  const key = await getKey();
  const buffer = base64ToBuffer(encryptedBase64);
  const combined = new Uint8Array(buffer);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const decoded = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decoded);
}

const OP_RULES: Record<number, OperationRule> = {
  101: { name: "get_user_profile", roles: ["user"] },
  102: { name: "get_home_financial_stats_v2", roles: ["user"] },
  205: { name: "create_deposit_request", roles: ["user"] },
  206: { name: "create_usdt_deposit", roles: ["user"] },
  309: { name: "request_withdrawal", roles: ["user"] },
  310: { name: "transfer_reproducao_to_balance", roles: ["user"] },
  311: { name: "get_withdrawal_records", roles: ["user"] },
  412: { name: "add_bank_account", roles: ["user"] },
  413: { name: "update_bank_account", roles: ["user"] },
  414: { name: "delete_client_bank", roles: ["user"] },
  511: { name: "purchase_product", roles: ["user"] },
  512: { name: "get_active_products", roles: ["user"] },
  513: { name: "get_user_posts", roles: ["user"] },
  207: { name: "get_deposit_banks", roles: ["user"] },
  208: { name: "get_deposit_records", roles: ["user"] },
  601: { name: "get_user_shop_items", roles: ["user"] },
  602: { name: "claim_daily_task", roles: ["user"] },
  603: { name: "complete_daily_task", roles: ["user"] },
  604: { name: "get_pending_tasks", roles: ["user"] },
  605: { name: "get_completed_tasks", roles: ["user"] },
  606: { name: "get_failed_tasks", roles: ["user"] },
  701: { name: "redeem_gift_code", roles: ["user"] },
  415: { name: "update_payment_pin", roles: ["user"] },
  801: { name: "get_my_team", roles: ["user"] },
  802: { name: "get_weekly_income", roles: ["user"] },
  803: { name: "get_bonus_history", roles: ["user"] },
  901: { name: "get_support", roles: ["user"] },
  103: { name: "get_minha_financa", roles: ["user"] },
  607: { name: "get_gravar_summary", roles: ["user"] },
  902: { name: "get_splash_message", roles: ["public", "user"] },
  416: { name: "get_iban", roles: ["user"] },
  903: { name: "check_ip_availability", roles: ["public", "user"] },
};

const MAX_BODY_BYTES = 5242880; // 5MB para suportar imagens em base64

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders
    },
  });
}

async function encryptedJson(status: number, payload: Record<string, unknown>) {
  try {
    const encrypted = await encryptPayload(payload);
    return json(status, { payload: encrypted });
  } catch (err) {
    return json(500, { error: "Encryption failed" });
  }
}

function mustBeNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mustBePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function roleAllowed(userRole: string, op: number): boolean {
  const rule = OP_RULES[op];
  return !!rule && rule.roles.includes(userRole);
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Sessão inválida. Por favor, inicie sessão novamente.");
  }

  const payload = parts[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  const decoded = atob(padded);
  return JSON.parse(decoded);
}

function assertTokenFresh(token: string) {
  const payload = decodeJwtPayload(token);
  const now = Math.floor(Date.now() / 1000);

  const exp = payload.exp;

  if (typeof exp !== "number") {
    throw new Error("Sessão inválida. Por favor, inicie sessão novamente.");
  }

  // Apenas verificamos se o token expirou (campo exp gerido pelo Supabase Auth).
  // Não limitamos por idade de iat — isso causava rejeição de sessões válidas após 30 min.
  if (now >= exp) {
    throw new Error("SESSION_EXPIRED: A sua sessão expirou. Por favor, inicie sessão novamente.");
  }
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return json(405, { success: false, error: "Método não permitido" });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const raw = await req.text();
    if (!raw || raw.length > MAX_BODY_BYTES) {
      return json(413, { success: false, error: "Pedido inválido. Tente novamente." });
    }

    let body: any;
    try {
      const parsedRaw = JSON.parse(raw);
      if (parsedRaw.payload) {
        body = await decryptPayload(parsedRaw.payload);
      } else {
        body = parsedRaw;
      }
    } catch {
      return json(400, { success: false, error: "Pedido inválido. Tente novamente." });
    }

    const op = Number(body?.op);
    const payload = body?.data ?? {};

    if (!Number.isInteger(op) || !OP_RULES[op]) {
      return json(400, { success: false, error: "Pedido inválido. Tente novamente." });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    const rule = OP_RULES[op];
    const allowsPublic = rule.roles.includes("public");

    let userRole = "public";
    let user = null;

    if (token) {
      try {
        assertTokenFresh(token);
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !userData?.user) {
          throw new Error("Sessão inválida");
        }
        user = userData.user;
        userRole = String(
          user.app_metadata?.role ?? user.user_metadata?.role ?? "user",
        ).toLowerCase();
        if (userRole === "authenticated") {
          userRole = "user";
        }
      } catch (e) {
        if (!allowsPublic) {
          return json(401, { success: false, error: "Sessão inválida. Por favor, inicie sessão novamente." });
        }
      }
    } else if (!allowsPublic) {
      return json(401, { success: false, error: "Não autorizado" });
    }

    if (!roleAllowed(userRole, op)) {
      return json(403, { success: false, error: "Acesso negado. Tente novamente." });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        },
        db: { schema: 'api' }
      }
    );

    let result: RpcResult;

    switch (op) {
      case 101: {
        const { data, error } = await supabase.rpc("get_user_profile_v2");
        if (error) throw error;
        // SEGURANÇA F-10: Remover payment_pin antes de enviar ao cliente.
        // O PIN nunca deve sair do servidor — é validado server-side (op 309/415).
        if (Array.isArray(data)) {
          result = data.map((row: Record<string, unknown>) => {
            const { payment_pin: _pin, ...safe } = row as Record<string, unknown>;
            return safe;
          });
        } else if (data && typeof data === "object") {
          const { payment_pin: _pin, ...safe } = data as Record<string, unknown>;
          result = safe;
        } else {
          result = data;
        }
        break;
      }

      case 102: {
        const { data, error } = await supabase.rpc("get_home_financial_stats_v2");
        if (error) throw error;
        result = data;
        break;
      }

      case 103: {
        const { data, error } = await supabase.rpc("get_minha_financa");
        if (error) throw error;
        result = data;
        break;
      }

      case 205: {
        if (
          !mustBePositiveNumber(payload.amount) ||
          !mustBeNonEmptyString(payload.bank_name) ||
          !mustBeNonEmptyString(payload.iban) ||
          !mustBeNonEmptyString(payload.comprovante_url)
        ) {
          return json(400, { success: false, error: "Dados do depósito inválidos" });
        }

        const { data, error } = await supabase.rpc("create_deposit_request", {
          p_amount: Number(payload.amount),
          p_bank_name: String(payload.bank_name).trim(),
          p_iban: String(payload.iban).trim(),
          p_comprovante_url: String(payload.comprovante_url).trim(),
        });

        if (error) throw error;
        result = data;
        break;
      }

      case 206: {
        if (
          !mustBePositiveNumber(payload.amount_usdt) ||
          !mustBePositiveNumber(payload.exchange_rate)
        ) {
          return json(400, { success: false, error: "Dados do depósito USDT inválidos" });
        }

        const { data, error } = await supabase.rpc("create_usdt_deposit", {
          p_amount_usdt: Number(payload.amount_usdt),
          p_exchange_rate: Number(payload.exchange_rate),
        });

        if (error) throw error;
        result = data;
        break;
      }

      case 207: {
        const { data, error } = await supabase
          .from("bnk_deposit")
          .select("id, nome_do_banco, iban, nome_favorecido")
          .eq("ativo", true)
          .order("created_at", { ascending: true });
        if (error) throw error;
        result = data;
        break;
      }

      case 208: {
        const { data: kzsData, error: kzsError } = await supabase
          .from("rg_kzs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (kzsError) throw kzsError;

        const { data: usdtData, error: usdtError } = await supabase
          .from("rg_usdt")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (usdtError) throw usdtError;

        result = {
          kzs: kzsData || [],
          usdt: usdtData || []
        };
        break;
      }

      case 309: {
        if (
          !mustBePositiveNumber(payload.amount) ||
          !mustBeNonEmptyString(payload.bank_id) ||
          !mustBeNonEmptyString(payload.pin)
        ) {
          return json(400, { success: false, error: "Dados da retirada inválidos" });
        }

        const { data, error } = await supabase.rpc("request_withdrawal", {
          p_amount: Number(payload.amount),
          p_bank_id: String(payload.bank_id).trim(),
          p_pin: String(payload.pin).trim(),
        });

        if (error) throw error;
        result = data;
        break;
      }

      case 310: {
        if (!mustBePositiveNumber(payload.amount_usd)) {
          return json(400, { success: false, error: "Dados de conversão inválidos" });
        }
        const { data, error } = await supabase.rpc("transfer_reproducao_to_balance", {
          p_amount_usd: Number(payload.amount_usd),
        });
        if (error) throw error;
        result = data;
        break;
      }

      case 311: {
        const { data, error } = await supabase.rpc("get_withdrawal_records");
        if (error) throw error;
        result = data;
        break;
      }

      case 412: {
        if (
          !mustBeNonEmptyString(payload.bank_name) ||
          !mustBeNonEmptyString(payload.holder_name) ||
          !mustBeNonEmptyString(payload.iban)
        ) {
          return json(400, { success: false, error: "Dados bancários inválidos" });
        }

        const { data, error } = await supabase.rpc("add_bank_account", {
          p_bank_name: String(payload.bank_name).trim(),
          p_holder_name: String(payload.holder_name).trim(),
          p_iban: String(payload.iban).trim(),
        });

        if (error) throw error;
        if (data && typeof data === "object" && data.success === false) {
          return json(400, { success: false, error: data.message });
        }
        result = data;
        break;
      }

      case 413: {
        if (
          !mustBeNonEmptyString(payload.bank_name) ||
          !mustBeNonEmptyString(payload.holder_name) ||
          !mustBeNonEmptyString(payload.iban)
        ) {
          return json(400, { success: false, error: "Dados bancários inválidos" });
        }

        const { data, error } = await supabase.rpc("update_bank_account", {
          p_bank_name: String(payload.bank_name).trim(),
          p_holder_name: String(payload.holder_name).trim(),
          p_iban: String(payload.iban).trim(),
        });

        if (error) throw error;
        result = data;
        break;
      }

      case 414: {
        if (!mustBeNonEmptyString(payload.id)) {
          return json(400, { success: false, error: "Conta bancária não encontrada." });
        }

        const { data, error } = await supabase.rpc("delete_client_bank", {
          p_id: String(payload.id).trim(),
        });

        if (error) throw error;
        result = data;
        break;
      }

      case 415: {
        if (!mustBeNonEmptyString(payload.new_pin)) {
          return json(400, { success: false, error: "O novo código de pagamento é inválido. Tente novamente." });
        }

        const { data, error } = await supabase.rpc("update_payment_pin", {
          p_new_pin: String(payload.new_pin).trim(),
          p_old_pin: payload.old_pin ? String(payload.old_pin).trim() : null,
        });

        if (error) throw error;

        if (data && data.success === false) {
          return json(400, { success: false, error: data.message });
        }

        result = data;
        break;
      }

      case 511: {
        const productId = String(payload.product_id || "").trim();
        if (!mustBeNonEmptyString(productId)) {
          return json(400, { success: false, error: "Produto inválido" });
        }

        const { data, error } = await supabase.rpc("purchase_product", {
          p_product_id: productId,
        });

        if (error) throw error;

        if (data && typeof data === "object" && data.success === false) {
          return json(400, data);
        }

        result = data;
        break;
      }


      case 512: {
        const { data, error } = await supabase.rpc("get_active_products");
        if (error) throw error;
        result = data;
        break;
      }

      case 513: {
        const { data, error } = await supabase.rpc("get_user_posts");
        if (error) throw error;
        result = data;
        break;
      }

      case 701: {
        if (!mustBeNonEmptyString(payload.code)) {
          return json(400, { success: false, error: "Código de oferta inválido. Verifique e tente novamente." });
        }

        const { data, error } = await supabase.rpc("redeem_gift_code", {
          p_code: String(payload.code).trim(),
        });

        if (error) throw error;
        result = data;
        break;
      }

      case 601: {
        const { data, error } = await supabase.rpc("get_user_shop_items");
        if (error) throw error;
        result = data;
        break;
      }

      case 602: {
        if (!payload.shop_id) return json(400, { success: false, error: "Artigo não encontrado. Tente novamente." });
        const { data, error } = await supabase.rpc("claim_daily_task", { p_shop_id: payload.shop_id });
        if (error) throw error;
        if (!data?.success) return json(400, data);
        result = data;
        break;
      }

      case 603: {
        if (!payload.tarefa_agd_id) return json(400, { success: false, error: "Tarefa não encontrada. Tente novamente." });
        const { data, error } = await supabase.rpc("complete_daily_task", { p_tarefa_agd_id: payload.tarefa_agd_id });
        if (error) throw error;
        if (!data?.success) return json(400, data);
        result = data;
        break;
      }

      case 604: {
        const { data, error } = await supabase
          .from("tarefa_agd")
          .select("*")
          .eq("uid_agdor", user.id)
          .eq("status_transformando", "transformação")
          .order("data_criada", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 605: {
        const { data, error } = await supabase
          .from("tarefas_diarias")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "concluido")
          .order("data_atribuicao", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 606: {
        const { data, error } = await supabase
          .from("tarefas_diarias")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "falhado")
          .order("data_atribuicao", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 607: {
        const { data, error } = await supabase.rpc("get_gravar_summary");
        if (error) throw error;
        result = data;
        break;
      }

      case 801: {
        const { data, error } = await supabase.rpc("get_my_team");
        if (error) throw error;
        result = data;
        break;
      }

      case 802: {
        const { data, error } = await supabase.rpc("get_weekly_income");
        if (error) throw error;
        result = data;
        break;
      }

      case 803: {
        const { data, error } = await supabase
          .from("history_bonus")
          .select("*")
          .eq("user_id", user.id)
          .order("data_recebimento", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 804: {
        const { data, error } = await supabase
          .from("notificacoes_nivel")
          .select("*");
        if (error) throw error;
        result = data;
        break;
      }

      case 901: {
        const { data, error } = await supabase.rpc("get_support");
        if (error) throw error;
        result = data?.[0] || null;
        break;
      }

      case 902: {
        const { data, error } = await supabaseAdmin.from("support_link").select("splash_message").limit(1).maybeSingle();
        if (error) throw error;
        result = data;
        break;
      }

      case 416: {
        const { data, error } = await supabaseAdmin.from("bnking_saques").select("iban").eq("user_id", user!.id).maybeSingle();
        if (error) throw error;
        result = data;
        break;
      }

      case 903: {
        const { data, error } = await supabaseAdmin.rpc('check_ip_availability', { p_ip: payload?.p_ip || '' });
        if (error) throw error;
        result = data;
        break;
      }

      default:
        return json(400, { success: false, error: "Pedido inválido. Tente novamente." });
    }

    return encryptedJson(200, {
      success: true,
      result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));

    // SESSION_EXPIRED: sinal para o frontend forçar logout
    if (errorMessage.includes("SESSION_EXPIRED")) {
      return json(401, {
        success: false,
        error: errorMessage.replace("SESSION_EXPIRED: ", ""),
        force_logout: true
      });
    }

    // Erros de banco de dados ou lógica de negócio com mensagem segura
    return json(500, {
      success: false,
      error: errorMessage,
    });
  }
});
