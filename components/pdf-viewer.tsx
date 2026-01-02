"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Loader2, Upload } from "lucide-react"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Konfiguracja worker dla pdfjs - tylko po stronie klienta
// PDF.js używa Web Workera do parsowania dokumentów PDF w osobnym wątku
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

interface PDFViewerProps {
  pdfUrl?: string
  candidateName: string
  fallbackText?: string | null
  allowFileUpload?: boolean
}

export default function PDFViewer({ pdfUrl: initialPdfUrl, candidateName, fallbackText, allowFileUpload = false }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl || null)
  const previousBlobUrlRef = useRef<string | null>(null)
  
  // Upewnij się, że komponent renderuje się tylko po stronie klienta
  useEffect(() => {
    setMounted(true)
  }, [])

  // Opóźnione pokazywanie spinnera, żeby uniknąć „mignięcia” przy bardzo szybkim ładowaniu
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setShowLoading(true)
      }, 400) // pokaż spinner dopiero po 400 ms
      return () => clearTimeout(timeout)
    } else {
      setShowLoading(false)
    }
  }, [loading])

  // Aktualizuj URL PDF gdy zmienia się prop (np. przy zmianie kandydata w slideshow)
  useEffect(() => {
    if (initialPdfUrl) {
      setPdfUrl(initialPdfUrl)
      setLoading(true)
      setError(null)
    }
  }, [initialPdfUrl])

  // Wczytywanie pliku przez użytkownika
  // Tworzy tymczasowy URL w pamięci przeglądarki - bez wysyłania na serwer
  const handleFileChange = useCallback((file: File) => {
    if (file && file.type === "application/pdf") {
      // Zwolnij poprzedni blob URL jeśli istnieje
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current)
        previousBlobUrlRef.current = null
      }
      
      const url = URL.createObjectURL(file) // Tworzy tymczasowy URL w pamięci
      previousBlobUrlRef.current = url
      setPdfUrl(url)
      setLoading(true)
      setError(null)
    }
  }, [])

  // Zwolnienie pamięci przy unmount
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current)
      }
    }
  }, [])
  
  const hasPdf = pdfUrl && pdfUrl.trim().length > 0

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error)
    setError("Nie udało się załadować pliku PDF")
    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!hasPdf && !fallbackText && !allowFileUpload) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Brak dostępnego CV</p>
      </div>
    )
  }

  if (!hasPdf && allowFileUpload) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="border-2 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <FileText className="w-16 h-16 text-muted-foreground" />
              <p className="text-muted-foreground text-center">Brak dostępnego CV</p>
              <label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(file)
                  }}
                  className="hidden"
                />
                <Button variant="outline" className="gap-2" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Wybierz plik PDF
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {hasPdf ? (
        <Card className="border-2 shadow-xl flex flex-col">
          <CardHeader className="flex-shrink-0 py-0.5 px-2 h-7 border-b bg-background">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-primary" />
                <CardTitle className="text-sm font-semibold leading-none">
                  CV{candidateName ? ` – ${candidateName}` : ""}
                </CardTitle>
                {numPages && (
                  <span className="text-xs text-muted-foreground">
                    {numPages} {numPages === 1 ? 'strona' : numPages < 5 ? 'strony' : 'stron'}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {allowFileUpload && (
                  <label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileChange(file)
                      }}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <span>
                        <Upload className="w-3 h-3" />
                        Zmień plik
                      </span>
                    </Button>
                  </label>
                )}
                {/* Nawigacja między stronami usunięta - wszystkie strony wyświetlane jednocześnie */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col items-center gap-4">
              {showLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Ładowanie PDF...</p>
                </div>
              )}
              {pdfUrl && !error && (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  className="flex flex-col items-center"
                >
                  {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <Page
                      key={pageNum}
                      pageNumber={pageNum}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="shadow-lg mb-4"
                      width={Math.min(800, typeof window !== "undefined" ? window.innerWidth - 100 : 800)}
                    />
                  ))}
                </Document>
              )}
              {error && pdfUrl && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-sm text-destructive mb-2">{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : fallbackText ? (
        /* Full CV Text (fallback jeśli nie ma PDF) */
        <Card className="border-2 shadow-xl flex-1">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Pełne CV</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-muted/30 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <p className="text-base leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {fallbackText}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

