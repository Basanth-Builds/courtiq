-- Create tournament_participants table for manually added players
CREATE TABLE tournament_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, name, email) -- Prevent duplicate entries
);

-- Enable Row Level Security
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Organizers can manage participants for their tournaments
CREATE POLICY "Organizers can manage tournament participants" ON tournament_participants FOR ALL USING (
  EXISTS (SELECT 1 FROM tournaments WHERE id = tournament_id AND organizer = auth.uid())
);

-- Anyone can view tournament participants
CREATE POLICY "Anyone can view tournament participants" ON tournament_participants FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_name ON tournament_participants(name);
CREATE INDEX idx_tournament_participants_created_at ON tournament_participants(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tournament_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_tournament_participants_updated_at
  BEFORE UPDATE ON tournament_participants
  FOR EACH ROW EXECUTE FUNCTION update_tournament_participants_updated_at();
