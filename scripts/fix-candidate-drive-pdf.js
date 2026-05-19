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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

function safeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
}

async function main() {
  const candidateId = process.argv[2]
  const driveFileId = process.argv[3]

  if (!candidateId || !driveFileId) {
    console.error("Usage: node scripts/fix-candidate-drive-pdf.js <candidateUuid> <googleDriveFileId>")
    process.exit(1)
  }

  const env = loadEnvFile(path.join(process.cwd(), ".env.local"))
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) in .env.local")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { data: candidate, error: candErr } = await supabase
    .from("candidates")
    .select("id, first_name, last_name, sheet_row_number")
    .eq("id", candidateId)
    .single()

  if (candErr || !candidate) {
    console.error("Candidate query error:", candErr)
    process.exit(2)
  }

  const downloadUrl = "https://drive.google.com/uc?export=download&id=" + driveFileId
  const res = await fetch(downloadUrl, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } })
  if (!res.ok) {
    console.error("Download failed:", res.status, res.statusText, "final_url:", res.url)
    process.exit(3)
  }

  const buf = Buffer.from(await res.arrayBuffer())
  const magic5 = buf.subarray(0, 5).toString("utf8")
  if (magic5 !== "%PDF-") {
    console.error("Downloaded file is not a PDF. magic:", JSON.stringify(magic5), "final_url:", res.url)
    process.exit(4)
  }

  const fileName =
    String(candidate.sheet_row_number) +
    "_" +
    safeName(candidate.first_name || "unknown") +
    (candidate.last_name ? "_" + safeName(candidate.last_name) : "") +
    ".pdf"

  const bucket = "cv-pdfs"
  const { error: upErr } = await supabase.storage.from(bucket).upload(fileName, buf, {
    contentType: "application/pdf",
    upsert: true,
  })

  if (upErr) {
    console.error("Upload error:", upErr)
    process.exit(5)
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fileName)
  const publicUrl = pub.publicUrl

  const { error: updErr } = await supabase
    .from("candidates")
    .update({ cv_pdf_url: publicUrl })
    .eq("id", candidateId)

  if (updErr) {
    console.error("Candidate update error:", updErr)
    process.exit(6)
  }

  console.log(JSON.stringify({ ok: true, candidateId, fileName, publicUrl }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(99)
})

