"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { inviteUser } from "@/app/actions/invite-user"
import { UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function AdminPanel() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"user" | "admin">("user")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleInvite = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Wprowadź adres email" })
      return
    }

    setLoading(true)
    setMessage(null)

    const result = await inviteUser(email, role)

    if (result.success) {
      setMessage({ type: "success", text: "Zaproszenie wysłane!" })
      setEmail("")
      setTimeout(() => {
        setOpen(false)
        setMessage(null)
      }, 2000)
    } else {
      setMessage({ type: "error", text: result.error || "Błąd" })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600">
          <UserPlus className="h-4 w-4" />
          Zaproś użytkownika
        </Button>
      </DialogTrigger>
      <DialogContent className="border-slate-700 bg-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wyślij zaproszenie</DialogTitle>
          <DialogDescription className="text-slate-400">Wyślij zaproszenie do aplikacji przez email</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-slate-300">
              Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="uzytkownik@example.com"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">
              Rola
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-white">
                <SelectItem value="user">Użytkownik</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message.text}
            </div>
          )}

          <Button onClick={handleInvite} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              "Wyślij zaproszenie"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
