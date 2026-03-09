-- Make company column nullable in recruiter_registrations table
-- Company is not a required field in the registration form
ALTER TABLE recruiter_registrations ALTER COLUMN company DROP NOT NULL;
