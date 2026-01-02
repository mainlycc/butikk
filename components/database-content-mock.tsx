"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Users } from "lucide-react"
import { DataTable } from "@/components/data-table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Candidate {
  id: string
  nr?: string | null
  first_name: string | null
  last_name?: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  location?: string | null
  candidate_email?: string | null
  guardian: string | null
  guardian_email?: string | null
  cv: string | null
  cv_pdf_url?: string | null
  technologies: string | null
  previous_contact: string | null
  project_description: string | null
  skills?: string | null
  languages?: string | null
  availability?: string | null
  blurred?: boolean
}

// Hipotetyczne dane kandydatów
const mockCandidates: Candidate[] = [
  {
    id: "1",
    first_name: "Jan",
    last_name: "Kowalski",
    role: "Senior Frontend Developer",
    seniority: "Senior",
    rate: "150-180 PLN/h",
    location: "Warszawa (Remote)",
    candidate_email: "jan.kowalski@example.com",
    guardian: "Anna Nowak",
    guardian_email: "anna.nowak@example.com",
    cv: "Doświadczony frontend developer z 8-letnim doświadczeniem...",
    cv_pdf_url: null,
    technologies: "React, TypeScript, Next.js, Node.js, GraphQL, Tailwind CSS, Jest",
    previous_contact: "2024-01-15",
    project_description: "E-commerce platform dla dużej firmy retail",
    skills: "Leadership, Code Review, Mentoring",
    languages: "Polski (native), Angielski (C1)",
    availability: "Od zaraz",
  },
  {
    id: "2",
    first_name: "Maria",
    last_name: "Wiśniewska",
    role: "DevOps Engineer",
    seniority: "Mid",
    rate: "120-140 PLN/h",
    location: "Kraków (Hybrid)",
    candidate_email: "maria.wisniewska@example.com",
    guardian: "Piotr Zieliński",
    guardian_email: "piotr.zielinski@example.com",
    cv: "Specjalistka DevOps z doświadczeniem w cloud infrastructure...",
    cv_pdf_url: null,
    technologies: "AWS, Docker, Kubernetes, Terraform, CI/CD, Python, Bash",
    previous_contact: null,
    project_description: "Infrastructure as Code dla startupu fintech",
    skills: "Cloud Architecture, Monitoring, Automation",
    languages: "Polski (native), Angielski (B2)",
    availability: "2 tygodnie",
  },
  {
    id: "3",
    first_name: "Piotr",
    last_name: "Nowak",
    role: "Backend Developer",
    seniority: "Senior",
    rate: "160-200 PLN/h",
    location: "Gdańsk (Remote)",
    candidate_email: "piotr.nowak@example.com",
    guardian: "Katarzyna Lewandowska",
    guardian_email: "katarzyna.lewandowska@example.com",
    cv: "Backend developer specjalizujący się w mikroserwisach...",
    cv_pdf_url: null,
    technologies: "Java, Spring Boot, PostgreSQL, Redis, Kafka, Microservices",
    previous_contact: "2023-12-20",
    project_description: "Mikroserwisy dla platformy SaaS",
    skills: "System Design, Performance Optimization",
    languages: "Polski (native), Angielski (C1)",
    availability: "1 miesiąc",
  },
  {
    id: "4",
    first_name: "Anna",
    last_name: "Zielińska",
    role: "Full Stack Developer",
    seniority: "Mid",
    rate: "130-150 PLN/h",
    location: "Wrocław (On-site)",
    candidate_email: "anna.zielinska@example.com",
    guardian: "Marek Szymański",
    guardian_email: "marek.szymanski@example.com",
    cv: "Full stack developer z doświadczeniem w nowoczesnych frameworkach...",
    cv_pdf_url: null,
    technologies: "React, Node.js, Express, MongoDB, TypeScript, REST API",
    previous_contact: null,
    project_description: "Platforma do zarządzania projektami",
    skills: "Agile, Scrum, Code Review",
    languages: "Polski (native), Angielski (B2)",
    availability: "Od zaraz",
  },
  {
    id: "5",
    first_name: "Tomasz",
    last_name: "Wójcik",
    role: "QA Engineer",
    seniority: "Senior",
    rate: "110-130 PLN/h",
    location: "Poznań (Remote)",
    candidate_email: "tomasz.wojcik@example.com",
    guardian: "Agnieszka Dąbrowska",
    guardian_email: "agnieszka.dabrowska@example.com",
    cv: "Doświadczony QA engineer z certyfikacjami ISTQB...",
    cv_pdf_url: null,
    technologies: "Selenium, Cypress, Playwright, Jest, Postman, SQL",
    previous_contact: "2024-02-01",
    project_description: "Test automation dla aplikacji webowych",
    skills: "Test Strategy, Test Automation, API Testing",
    languages: "Polski (native), Angielski (B2)",
    availability: "3 tygodnie",
  },
  {
    id: "6",
    first_name: "Katarzyna",
    last_name: "Kamińska",
    role: "UX/UI Designer",
    seniority: "Senior",
    rate: "120-150 PLN/h",
    location: "Warszawa (Hybrid)",
    candidate_email: "katarzyna.kaminska@example.com",
    guardian: "Łukasz Kowalczyk",
    guardian_email: "lukasz.kowalczyk@example.com",
    cv: "UX/UI Designer z portfolio produktów cyfrowych...",
    cv_pdf_url: null,
    technologies: "Figma, Sketch, Adobe XD, Prototyping, Design Systems",
    previous_contact: null,
    project_description: "Redesign aplikacji mobilnej",
    skills: "User Research, Usability Testing, Design Thinking",
    languages: "Polski (native), Angielski (C1)",
    availability: "Od zaraz",
  },
  {
    id: "7",
    first_name: "Michał",
    last_name: "Lewandowski",
    role: "Mobile Developer",
    seniority: "Mid",
    rate: "140-160 PLN/h",
    location: "Kraków (Remote)",
    candidate_email: "michal.lewandowski@example.com",
    guardian: "Joanna Wojciechowska",
    guardian_email: "joanna.wojciechowska@example.com",
    cv: "Mobile developer specjalizujący się w aplikacjach natywnych...",
    cv_pdf_url: null,
    technologies: "React Native, Swift, Kotlin, iOS, Android, Redux",
    previous_contact: "2024-01-10",
    project_description: "Aplikacja mobilna dla bankowości",
    skills: "App Store Optimization, Performance Tuning",
    languages: "Polski (native), Angielski (B2)",
    availability: "2 tygodnie",
  },
  {
    id: "8",
    first_name: "Agnieszka",
    last_name: "Zielińska",
    role: "Data Engineer",
    seniority: "Senior",
    rate: "150-180 PLN/h",
    location: "Gdańsk (Remote)",
    candidate_email: "agnieszka.zielinska@example.com",
    guardian: "Rafał Nowak",
    guardian_email: "rafal.nowak@example.com",
    cv: "Data Engineer z doświadczeniem w big data i data pipelines...",
    cv_pdf_url: null,
    technologies: "Python, Apache Spark, Airflow, Kafka, SQL, AWS Glue, Redshift",
    previous_contact: null,
    project_description: "Data pipeline dla analytics platform",
    skills: "ETL, Data Modeling, Data Warehousing",
    languages: "Polski (native), Angielski (C1)",
    availability: "1 miesiąc",
  },
  {
    id: "9",
    first_name: "Paweł",
    last_name: "Szymański",
    role: "Security Engineer",
    seniority: "Senior",
    rate: "170-200 PLN/h",
    location: "Warszawa (On-site)",
    candidate_email: "pawel.szymanski@example.com",
    guardian: "Monika Kowalczyk",
    guardian_email: "monika.kowalczyk@example.com",
    cv: "Security engineer z certyfikacjami CISSP i CEH...",
    cv_pdf_url: null,
    technologies: "Penetration Testing, OWASP, Security Audit, SIEM, Firewalls",
    previous_contact: "2023-11-15",
    project_description: "Security audit dla platformy fintech",
    skills: "Vulnerability Assessment, Incident Response, Compliance",
    languages: "Polski (native), Angielski (C1)",
    availability: "Od zaraz",
  },
  {
    id: "10",
    first_name: "Magdalena",
    last_name: "Woźniak",
    role: "Product Manager",
    seniority: "Senior",
    rate: "140-170 PLN/h",
    location: "Wrocław (Hybrid)",
    candidate_email: "magdalena.wozniak@example.com",
    guardian: "Krzysztof Jankowski",
    guardian_email: "krzysztof.jankowski@example.com",
    cv: "Product Manager z doświadczeniem w produktach B2B i B2C...",
    cv_pdf_url: null,
    technologies: "Agile, Scrum, Jira, Confluence, Analytics, A/B Testing",
    previous_contact: null,
    project_description: "Product roadmap dla platformy SaaS",
    skills: "Product Strategy, Stakeholder Management, Roadmapping",
    languages: "Polski (native), Angielski (C1)",
    availability: "3 tygodnie",
  },
  {
    id: "11",
    first_name: "Łukasz",
    last_name: "Kowalczyk",
    role: "Cloud Architect",
    seniority: "Senior",
    rate: "180-220 PLN/h",
    location: "Warszawa (Remote)",
    candidate_email: "lukasz.kowalczyk@example.com",
    guardian: "Ewa Nowak",
    guardian_email: "ewa.nowak@example.com",
    cv: "Cloud Architect z doświadczeniem w enterprise solutions...",
    cv_pdf_url: null,
    technologies: "AWS, Azure, GCP, Terraform, Kubernetes, Docker, Serverless",
    previous_contact: null,
    project_description: "Cloud migration dla korporacji",
    skills: "Cloud Strategy, Architecture Design, Cost Optimization",
    languages: "Polski (native), Angielski (C1)",
    availability: "1 miesiąc",
    blurred: true,
  },
  {
    id: "12",
    first_name: "Karolina",
    last_name: "Dąbrowska",
    role: "AI/ML Engineer",
    seniority: "Senior",
    rate: "160-190 PLN/h",
    location: "Kraków (Hybrid)",
    candidate_email: "karolina.dabrowska@example.com",
    guardian: "Marcin Wiśniewski",
    guardian_email: "marcin.wisniewski@example.com",
    cv: "AI/ML Engineer specjalizująca się w deep learning i NLP...",
    cv_pdf_url: null,
    technologies: "Python, TensorFlow, PyTorch, MLflow, Scikit-learn, NLP, Computer Vision",
    previous_contact: "2024-01-05",
    project_description: "Chatbot z AI dla customer service",
    skills: "Model Training, MLOps, Feature Engineering, A/B Testing",
    languages: "Polski (native), Angielski (C1)",
    availability: "2 tygodnie",
    blurred: true,
  },
]

export default function DatabaseContentMock() {
  const [searchTerms, setSearchTerms] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [candidates] = useState<Candidate[]>(mockCandidates)
  const [currentPage, setCurrentPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])
  const itemsPerPage = 50

  const filteredCandidates = useMemo(() => {
    if (!searchTerms.trim()) return candidates

    const terms = searchTerms
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t)

    return candidates.filter((candidate) => {
      const searchableText = [
        candidate.first_name,
        candidate.last_name,
        candidate.role,
        candidate.seniority,
        candidate.rate,
        candidate.technologies,
        candidate.location,
        candidate.languages,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return terms.every((term) => searchableText.includes(term))
    })
  }, [candidates, searchTerms])

  // Resetuj stronę gdy zmienia się filtrowanie lub sortowanie
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerms, candidates, sorting])

  const toggleCandidate = useCallback((id: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCandidates(newSelected)
  }, [selectedCandidates])

  const toggleAll = useCallback(() => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map((c) => c.id)))
    }
  }, [filteredCandidates, selectedCandidates.size])

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={
              selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0
            }
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }) => (
          <div className={row.original.blurred ? "blur-sm" : ""}>
            <Checkbox
              checked={selectedCandidates.has(row.original.id)}
              onCheckedChange={() => toggleCandidate(row.original.id)}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "first_name",
        header: "Imię",
        cell: ({ row }) => (
          <div className={`font-medium ${row.original.blurred ? "blur-sm" : ""}`}>
            {row.original.first_name}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "role",
        header: "Rola",
        cell: ({ row }) => (
          <div className={row.original.blurred ? "blur-sm" : ""}>
            <Badge variant="secondary">{row.original.role || "-"}</Badge>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "seniority",
        header: "Seniority",
        cell: ({ row }) => (
          <div className={row.original.blurred ? "blur-sm" : ""}>
            <Badge>{row.original.seniority || "-"}</Badge>
          </div>
        ),
      },
      {
        accessorKey: "rate",
        header: "Stawka",
        cell: ({ row }) => (
          <div className={`text-sm ${row.original.blurred ? "blur-sm" : ""}`}>
            {row.original.rate || "-"}
          </div>
        ),
      },
      {
        accessorKey: "technologies",
        header: "Technologie",
        cell: ({ row }) => {
          const technologies = row.original.technologies || "-"
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-sm max-w-xs truncate cursor-help ${row.original.blurred ? "blur-sm" : ""}`}>
                  {technologies}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-md whitespace-pre-wrap">{technologies}</p>
              </TooltipContent>
            </Tooltip>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "location",
        header: "Lokalizacja",
        cell: ({ row }) => (
          <div className={`text-sm text-muted-foreground ${row.original.blurred ? "blur-sm" : ""}`}>
            {row.original.location || "-"}
          </div>
        ),
      },
      {
        accessorKey: "availability",
        header: "Dostępność",
        cell: ({ row }) => (
          <div className={`text-sm ${row.original.blurred ? "blur-sm" : ""}`}>
            {row.original.availability || "-"}
          </div>
        ),
      },
    ],
    [selectedCandidates, filteredCandidates.length, toggleCandidate, toggleAll]
  )

  // Użyj useReactTable do sortowania wszystkich danych przed paginacją
  const table = useReactTable({
    data: filteredCandidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
  })

  // Oblicz paginowane dane z posortowanych danych
  const sortedCandidates = table.getRowModel().rows.map((row) => row.original)
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Candidates Table */}
      <Card className="border-2">
        <CardContent className="p-0">
          {filteredCandidates.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Nie znaleziono kandydatów</p>
              <p className="text-sm">Spróbuj zmienić kryteria wyszukiwania</p>
            </div>
          ) : (
            <div className="p-4">
              <DataTable 
                columns={columns} 
                data={paginatedCandidates}
                sorting={sorting}
                onSortingChange={setSorting}
              />
              {paginatedCandidates.some(c => c.blurred) && (
                <div className="mt-4 text-center border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Chcesz zobaczyć więcej? Dołącz jako rekruter</p>
                  <Button asChild size="default" className="h-10 px-6 text-sm font-semibold">
                    <Link href="/main/rekruter">Korzystaj jako rekruter</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredCandidates.length > itemsPerPage && (
        <Card className="border-2">
          <CardContent className="pt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {(() => {
                  const pages: (number | "ellipsis")[] = []
                  
                  if (totalPages <= 7) {
                    // Jeśli jest mało stron, pokaż wszystkie
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // Zawsze pokaż pierwszą stronę
                    pages.push(1)
                    
                    if (currentPage <= 3) {
                      // Jesteśmy na początku
                      for (let i = 2; i <= 4; i++) {
                        pages.push(i)
                      }
                      pages.push("ellipsis")
                      pages.push(totalPages)
                    } else if (currentPage >= totalPages - 2) {
                      // Jesteśmy na końcu
                      pages.push("ellipsis")
                      for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      // Jesteśmy w środku
                      pages.push("ellipsis")
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i)
                      }
                      pages.push("ellipsis")
                      pages.push(totalPages)
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

