-- Create transactions table
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'failed', 'expired');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    tryout_id UUID REFERENCES tryouts(id) NOT NULL,
    amount NUMERIC NOT NULL,
    status transaction_status DEFAULT 'pending',
    snap_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_purchases table (What user owns)
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    tryout_id UUID REFERENCES tryouts(id) NOT NULL,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tryout_id)
);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can see their own transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can see their own purchases
CREATE POLICY "Users can view own purchases" 
ON user_purchases FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins can view all (assuming admin role check exists in app logic or via previous policies)
-- Adding a simple admin policy for completeness if needed, but sticking to basics for MVP
