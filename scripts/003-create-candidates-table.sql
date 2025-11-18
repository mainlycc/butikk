-- Updated candidates table to match new Google Sheets structure
-- Create candidates table (synced from Google Sheets)
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_row_number INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  role TEXT,
  seniority TEXT,
  rate TEXT,
  technologies TEXT,
  cv TEXT,
  guardian TEXT,
  previous_contact TEXT,
  project_description TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view candidates
CREATE POLICY "Authenticated users can view candidates"
  ON candidates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only system can insert/update candidates (from sync)
CREATE POLICY "System can manage candidates"
  ON candidates FOR ALL
  USING (true);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(role);
CREATE INDEX IF NOT EXISTS idx_candidates_seniority ON candidates(seniority);
CREATE INDEX IF NOT EXISTS idx_candidates_guardian ON candidates(guardian);
CREATE INDEX IF NOT EXISTS idx_candidates_sheet_row ON candidates(sheet_row_number);

-- Create full text search index
CREATE INDEX IF NOT EXISTS idx_candidates_search ON candidates 
  USING gin(to_tsvector('english', 
    coalesce(first_name, '') || ' ' || 
    coalesce(role, '') || ' ' || 
    coalesce(technologies, '')
  ));
