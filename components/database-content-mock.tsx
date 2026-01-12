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
  },
  {
    id: "13",
    first_name: "Marcin",
    last_name: "Jankowski",
    role: "Backend Developer",
    seniority: "Mid",
    rate: "130-150 PLN/h",
    location: "Poznań (Remote)",
    candidate_email: "marcin.jankowski@example.com",
    guardian: "Aleksandra Nowak",
    guardian_email: "aleksandra.nowak@example.com",
    cv: "Backend developer z doświadczeniem w REST API i mikroserwisach...",
    cv_pdf_url: null,
    technologies: "Node.js, Express, MongoDB, PostgreSQL, Redis, Docker",
    previous_contact: null,
    project_description: "API dla platformy e-commerce",
    skills: "API Design, Database Optimization, Microservices",
    languages: "Polski (native), Angielski (B2)",
    availability: "Od zaraz",
  },
  {
    id: "14",
    first_name: "Natalia",
    last_name: "Krawczyk",
    role: "Frontend Developer",
    seniority: "Mid",
    rate: "120-140 PLN/h",
    location: "Wrocław (Hybrid)",
    candidate_email: "natalia.krawczyk@example.com",
    guardian: "Tomasz Kowalski",
    guardian_email: "tomasz.kowalski@example.com",
    cv: "Frontend developer specjalizująca się w React i Vue.js...",
    cv_pdf_url: null,
    technologies: "React, Vue.js, TypeScript, CSS, Sass, Webpack, Vite",
    previous_contact: "2024-01-20",
    project_description: "Aplikacja webowa dla sektora finansowego",
    skills: "Component Architecture, State Management, Responsive Design",
    languages: "Polski (native), Angielski (B2)",
    availability: "1 miesiąc",
  },
  {
    id: "15",
    first_name: "Krzysztof",
    last_name: "Mazur",
    role: "Full Stack Developer",
    seniority: "Senior",
    rate: "150-180 PLN/h",
    location: "Gdańsk (Remote)",
    candidate_email: "krzysztof.mazur@example.com",
    guardian: "Monika Zielińska",
    guardian_email: "monika.zielinska@example.com",
    cv: "Full Stack Developer z 10-letnim doświadczeniem w projektach enterprise...",
    cv_pdf_url: null,
    technologies: "React, Node.js, TypeScript, PostgreSQL, GraphQL, AWS",
    previous_contact: null,
    project_description: "Platforma SaaS dla zarządzania zasobami",
    skills: "System Architecture, Code Review, Team Leadership",
    languages: "Polski (native), Angielski (C1)",
    availability: "2 tygodnie",
  },
  {
    id: "16",
    first_name: "Joanna",
    last_name: "Pawlak",
    role: "QA Engineer",
    seniority: "Mid",
    rate: "100-120 PLN/h",
    location: "Kraków (On-site)",
    candidate_email: "joanna.pawlak@example.com",
    guardian: "Robert Nowak",
    guardian_email: "robert.nowak@example.com",
    cv: "QA Engineer z doświadczeniem w testowaniu aplikacji webowych i mobilnych...",
    cv_pdf_url: null,
    technologies: "Selenium, Cypress, Postman, Jira, TestRail, SQL",
    previous_contact: "2024-02-10",
    project_description: "Test automation dla aplikacji fintech",
    skills: "Test Planning, Bug Tracking, Regression Testing",
    languages: "Polski (native), Angielski (B2)",
    availability: "Od zaraz",
  },
  {
    id: "17",
    first_name: "Bartosz",
    last_name: "Król",
    role: "DevOps Engineer",
    seniority: "Senior",
    rate: "140-170 PLN/h",
    location: "Warszawa (Hybrid)",
    candidate_email: "bartosz.krol@example.com",
    guardian: "Ewa Kowalczyk",
    guardian_email: "ewa.kowalczyk@example.com",
    cv: "DevOps Engineer z certyfikacjami AWS i Kubernetes...",
    cv_pdf_url: null,
    technologies: "AWS, Kubernetes, Docker, Terraform, Jenkins, GitLab CI/CD",
    previous_contact: null,
    project_description: "CI/CD pipeline dla platformy cloud",
    skills: "Infrastructure as Code, Monitoring, Security",
    languages: "Polski (native), Angielski (C1)",
    availability: "3 tygodnie",
  },
  {
    id: "18",
    first_name: "Aleksandra",
    last_name: "Wróbel",
    role: "UX Designer",
    seniority: "Mid",
    rate: "110-130 PLN/h",
    location: "Poznań (Remote)",
    candidate_email: "aleksandra.wrobel@example.com",
    guardian: "Michał Szymański",
    guardian_email: "michal.szymanski@example.com",
    cv: "UX Designer z portfolio aplikacji mobilnych i webowych...",
    cv_pdf_url: null,
    technologies: "Figma, Adobe XD, Sketch, InVision, Prototyping",
    previous_contact: "2024-01-30",
    project_description: "Redesign aplikacji mobilnej dla banku",
    skills: "User Research, Wireframing, Usability Testing",
    languages: "Polski (native), Angielski (B2)",
    availability: "1 miesiąc",
  },
  {
    id: "19",
    first_name: "Damian",
    last_name: "Sikora",
    role: "Backend Developer",
    seniority: "Senior",
    rate: "160-200 PLN/h",
    location: "Kraków (Remote)",
    candidate_email: "damian.sikora@example.com",
    guardian: "Anna Lewandowska",
    guardian_email: "anna.lewandowska@example.com",
    cv: "Backend Developer specjalizujący się w Java i Spring Boot...",
    cv_pdf_url: null,
    technologies: "Java, Spring Boot, Hibernate, PostgreSQL, RabbitMQ, Redis",
    previous_contact: null,
    project_description: "Mikroserwisy dla platformy e-commerce",
    skills: "System Design, Performance Tuning, Code Review",
    languages: "Polski (native), Angielski (C1)",
    availability: "2 tygodnie",
  },
  {
    id: "20",
    first_name: "Patrycja",
    last_name: "Górecka",
    role: "Frontend Developer",
    seniority: "Senior",
    rate: "150-180 PLN/h",
    location: "Warszawa (Hybrid)",
    candidate_email: "patrycja.gorecka@example.com",
    guardian: "Piotr Wiśniewski",
    guardian_email: "piotr.wisniewski@example.com",
    cv: "Senior Frontend Developer z doświadczeniem w React i Next.js...",
    cv_pdf_url: null,
    technologies: "React, Next.js, TypeScript, Tailwind CSS, GraphQL, Jest",
    previous_contact: "2024-02-05",
    project_description: "Aplikacja webowa dla sektora medycznego",
    skills: "Performance Optimization, Accessibility, Code Review",
    languages: "Polski (native), Angielski (C1)",
    availability: "Od zaraz",
  },
  {
    id: "21",
    first_name: "Rafał",
    last_name: "Baran",
    role: "Data Scientist",
    seniority: "Senior",
    rate: "170-200 PLN/h",
    location: "Gdańsk (Remote)",
    candidate_email: "rafal.baran@example.com",
    guardian: "Katarzyna Nowak",
    guardian_email: "katarzyna.nowak@example.com",
    cv: "Data Scientist z doświadczeniem w machine learning i data analysis...",
    cv_pdf_url: null,
    technologies: "Python, Pandas, NumPy, Scikit-learn, Jupyter, SQL, Tableau",
    previous_contact: null,
    project_description: "Analytics platform dla e-commerce",
    skills: "Statistical Analysis, Data Visualization, Model Building",
    languages: "Polski (native), Angielski (C1)",
    availability: "1 miesiąc",
    blurred: true,
  },
  {
    id: "22",
    first_name: "Sylwia",
    last_name: "Rutkowska",
    role: "Scrum Master",
    seniority: "Senior",
    rate: "130-160 PLN/h",
    location: "Wrocław (Hybrid)",
    candidate_email: "sylwia.rutkowska@example.com",
    guardian: "Łukasz Dąbrowski",
    guardian_email: "lukasz.dabrowski@example.com",
    cv: "Certyfikowany Scrum Master z doświadczeniem w zarządzaniu zespołami...",
    cv_pdf_url: null,
    technologies: "Jira, Confluence, Agile, Scrum, Kanban",
    previous_contact: "2024-01-25",
    project_description: "Zarządzanie zespołem developerskim w projekcie fintech",
    skills: "Agile Coaching, Sprint Planning, Stakeholder Management",
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
  const [visibleCandidatesCount, setVisibleCandidatesCount] = useState(10)
  const itemsPerPage = 50
  const expandStep = 10

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

  // Resetuj stronę i stan rozwijania gdy zmienia się filtrowanie lub sortowanie
  useEffect(() => {
    setCurrentPage(1)
    setVisibleCandidatesCount(10)
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

  // Ogranicz listę kandydatów do widocznych
  const visibleCandidates = useMemo(() => {
    return filteredCandidates.slice(0, visibleCandidatesCount)
  }, [filteredCandidates, visibleCandidatesCount])
  
  // Utwórz mapę która przechowuje informację o tym które rekordy są rozmyte
  // Zawsze ostatnie 2 kandydatów są rozmyte
  const blurredMap = useMemo(() => {
    const map = new Map<string, boolean>()
    const totalVisible = visibleCandidates.length
    for (let i = 0; i < visibleCandidates.length; i++) {
      const candidate = visibleCandidates[i]
      // Ostatnie 2 kandydatów są zawsze rozmyte
      map.set(candidate.id, totalVisible > 2 && i >= totalVisible - 2)
    }
    return map
  }, [visibleCandidates])

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
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={isBlurred ? "blur-sm" : ""}>
              <Checkbox
                checked={selectedCandidates.has(row.original.id)}
                onCheckedChange={() => toggleCandidate(row.original.id)}
              />
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "first_name",
        header: "Imię",
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={`font-medium ${isBlurred ? "blur-sm" : ""}`}>
              {row.original.first_name}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "role",
        header: "Rola",
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={isBlurred ? "blur-sm" : ""}>
              <Badge variant="secondary">{row.original.role || "-"}</Badge>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "seniority",
        header: "Seniority",
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={isBlurred ? "blur-sm" : ""}>
              <Badge>{row.original.seniority || "-"}</Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "rate",
        header: "Stawka",
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={`text-sm ${isBlurred ? "blur-sm" : ""}`}>
              {row.original.rate || "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "technologies",
        header: "Technologie",
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          const technologies = row.original.technologies || "-"
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-sm max-w-xs truncate cursor-help ${isBlurred ? "blur-sm" : ""}`}>
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
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={`text-sm text-muted-foreground ${isBlurred ? "blur-sm" : ""}`}>
              {row.original.location || "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "availability",
        header: "Dostępność",
        cell: ({ row }) => {
          const isBlurred = blurredMap.get(row.original.id) ?? false
          return (
            <div className={`text-sm ${isBlurred ? "blur-sm" : ""}`}>
              {row.original.availability || "-"}
            </div>
          )
        },
      },
    ],
    [selectedCandidates, filteredCandidates.length, toggleCandidate, toggleAll, blurredMap]
  )

  // Użyj useReactTable do sortowania wszystkich danych przed paginacją
  const table = useReactTable({
    data: visibleCandidates,
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
  
  // Funkcja do rozwijania kolejnych rekordów
  const handleExpand = useCallback(() => {
    setVisibleCandidatesCount(prev => Math.min(prev + expandStep, filteredCandidates.length))
  }, [filteredCandidates.length])

  // Sprawdź czy są jeszcze niewidoczne kandydaci
  const hasMoreCandidates = visibleCandidatesCount < filteredCandidates.length
  const allCandidatesVisible = visibleCandidatesCount >= filteredCandidates.length

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
              {hasMoreCandidates && (
                <div className="mt-4 text-center border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Zobacz więcej kandydatów</p>
                  <Button 
                    onClick={handleExpand}
                    size="default" 
                    className="h-10 px-6 text-sm font-semibold"
                  >
                    Rozwiń
                  </Button>
                </div>
              )}
              {allCandidatesVisible && (
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
      {sortedCandidates.length > itemsPerPage && (
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

