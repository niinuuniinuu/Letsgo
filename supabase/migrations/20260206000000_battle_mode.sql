-- Battle Mode Schema

-- 1. Matches Table
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID REFERENCES auth.users(id) NOT NULL,
    player2_id UUID REFERENCES auth.users(id), -- Nullable initially
    tryout_id UUID REFERENCES public.tryouts(id) NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'abandoned')),
    scores JSONB DEFAULT '{"p1": 0, "p2": 0}',
    current_question_index INTEGER DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow reading matches if you are a player or if it's open (waiting)
CREATE POLICY "Public matches are viewable by everyone" ON public.matches
    FOR SELECT USING (true);

-- Allow creating a match (Player 1)
CREATE POLICY "Users can create matches" ON public.matches
    FOR INSERT WITH CHECK (auth.uid() = player1_id);

-- Allow updating a match (Player 2 joining or Players updating score)
CREATE POLICY "Players can update their matches" ON public.matches
    FOR UPDATE USING (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id OR 
        (player2_id IS NULL) -- Allow joining if empty
    );

-- 3. Realtime Enablement
-- We need to enable realtime for this table so clients can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
