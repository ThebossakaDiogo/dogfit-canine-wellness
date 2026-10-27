CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  kind text NOT NULL,
  xp integer NOT NULL DEFAULT 10,
  day date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, day)
);
GRANT SELECT, INSERT ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activities select" ON public.activities FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own activities insert" ON public.activities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND xp BETWEEN 0 AND 50);

CREATE TABLE public.weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  dog_id uuid NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  weight_kg numeric NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 120),
  logged_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.weight_logs TO authenticated;
GRANT ALL ON public.weight_logs TO service_role;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weights select" ON public.weight_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own weights insert" ON public.weight_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own weights delete" ON public.weight_logs FOR DELETE TO authenticated USING (user_id = auth.uid());