"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { syncGoogleSheetsToSupabase } from "@/app/actions/sync-google-sheets"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setMessage(null)

    const result = await syncGoogleSheetsToSupabase()

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Synchronizacja zakończona" })
      // Reload the page to show updated data
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setMessage({ type: "error", text: result.error || "Błąd synchronizacji" })
    }

    setSyncing(false)
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant="outline"
        className="gap-2 border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Synchronizacja..." : "Synchronizuj z Google Sheets"}
      </Button>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}
    </div>
  )
}
