const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvLocal(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function main() {
  const root = process.cwd();
  const env = loadEnvLocal(path.join(root, ".env.local"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const report = { ok: true, errors: [], steps: {} };

  if (!url) {
    report.ok = false;
    report.errors.push("Brak NEXT_PUBLIC_SUPABASE_URL w .env.local");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  if (!serviceKey) {
    report.ok = false;
    report.errors.push("Brak SUPABASE_SERVICE_ROLE_KEY w .env.local");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  report.steps.url = url;

  // REST reachability (service role on a real table endpoint)
  try {
    const res = await fetch(`${url}/rest/v1/candidates?select=id&limit=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    report.steps.restApi = {
      reachable: res.ok,
      httpStatus: res.status,
      statusText: res.statusText,
    };
    if (!report.steps.restApi.reachable) {
      report.ok = false;
      report.errors.push(`REST API: HTTP ${res.status} ${res.statusText}`);
    }
  } catch (e) {
    report.ok = false;
    report.steps.restApi = { reachable: false, error: String(e.message || e) };
    report.errors.push(`REST API: ${e.message || e}`);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count: candidatesCount, error: candidatesErr } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  if (candidatesErr) {
    report.ok = false;
    report.errors.push(`candidates count: ${candidatesErr.message} (${candidatesErr.code || "no code"})`);
    report.steps.candidatesCount = null;
  } else {
    report.steps.candidatesCount = candidatesCount;
  }

  const { count: usersCount, error: usersErr } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (usersErr) {
    report.ok = false;
    report.errors.push(`users count: ${usersErr.message} (${usersErr.code || "no code"})`);
    report.steps.usersCount = null;
  } else {
    report.steps.usersCount = usersCount;
  }

  const { data: recentCandidates, error: recentErr } = await supabase
    .from("candidates")
    .select("id, sheet_row_number, created_at, updated_at")
    .order("sheet_row_number", { ascending: false })
    .limit(3);

  if (recentErr) {
    report.ok = false;
    report.errors.push(`recent candidates: ${recentErr.message} (${recentErr.code || "no code"})`);
    report.steps.recentCandidates = null;
  } else {
    report.steps.recentCandidates = recentCandidates;
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, errors: [String(e.message || e)] }, null, 2));
  process.exit(1);
});

