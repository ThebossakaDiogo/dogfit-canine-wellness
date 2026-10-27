CREATE TABLE public.dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  breed text,
  size text NOT NULL DEFAULT 'mediano',
  life_stage text NOT NULL DEFAULT 'adulto',
  weight_kg numeric,
  allergies text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dogs TO authenticated;
GRANT ALL ON public.dogs TO service_role;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dogs select" ON public.dogs FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own dogs insert" ON public.dogs FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own dogs update" ON public.dogs FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own dogs delete" ON public.dogs FOR DELETE TO authenticated USING (owner_id = auth.uid());