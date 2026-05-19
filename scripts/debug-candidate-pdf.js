const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

function loadEnvFile(filePath) {
  const txt = fs.readFileSync(filePath, "utf8")
  const env = {}

  for (const line of txt.split(/\r?\n/)) {
    if (!line || /^\s*#/.test(line)) continue
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2]
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }

  return env
}

function redactUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`
  } catch {
    return `${String(url).slice(0, 80)}...`
  }
}

async function main() {
  const candidateId = process.argv[2]
  if (!candidateId) {
    console.error("Usage: node scripts/debug-candidate-pdf.js <candidateId>")
    process.exit(1)
  }

  const envPath = path.join(process.cwd(), ".env.local")
  const env = loadEnvFile(envPath)

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env in .env.local", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase
    .from("candidates")
    .select("id, first_name, last_name, sheet_row_number, cv_pdf_url, cv")
    .eq("id", candidateId)
    .single()

  if (error) {
    console.error("Query error:", error)
    process.exit(2)
  }

  console.log(
    JSON.stringify(
      {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        sheet_row_number: data.sheet_row_number,
        cv_pdf_url: data.cv_pdf_url,
        cv_pdf_url_redacted: redactUrl(data.cv_pdf_url),
        has_cv_text_fallback: Boolean(data.cv && String(data.cv).trim().length > 0),
      },
      null,
      2
    )
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(99)
})

