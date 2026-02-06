-- Database Schema for SNBT & Seleksi Mandiri Tryout Platform

-- 1. Tryouts Table
CREATE TABLE public.tryouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active', -- active, inactive
    scoring_type TEXT DEFAULT 'irt', -- irt, classic
    duration_minutes INTEGER DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tryout_id UUID REFERENCES public.tryouts(id) ON DELETE CASCADE,
    content JSONB NOT NULL, -- Flexible structure for text, images, etc.
    options JSONB NOT NULL, -- List of choices
    correct_answer TEXT NOT NULL,
    irt_weight DECIMAL(5, 2) DEFAULT 1.0,
    explanation TEXT,
    category TEXT, -- e.g., Literasi Bahasa, Penalaran Matematika
    order_index INTEGER DEFAULT 0
);

-- 3. Student Exams (Attempts)
CREATE TABLE public.student_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL, -- Reference to auth.users.id
    tryout_id UUID REFERENCES public.tryouts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- in_progress, finished
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    raw_score DECIMAL(5, 2),
    weighted_score INTEGER,
    UNIQUE(student_id, tryout_id) -- Only one active attempt per student per tryout (can be revisited)
);

-- 4. User Answers
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_exam_id UUID REFERENCES public.student_exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_exam_id, question_id)
);

-- Row Level Security (RLS) Recommendations:
-- Tryouts: Read for everyone, Write for Admins
-- Questions: Read for everyone (authenticated), Write for Admins
-- Student Exams: Read/Write for the owner only
-- Answers: Read/Write for the owner only
