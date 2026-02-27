-- 1. Tabel Profiles (Informasi User & Koneksi Pasangan)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  household_id UUID DEFAULT gen_random_uuid(), -- User dengan household_id yang sama berbagi data
  partner_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Tabel Targets
CREATE TABLE public.targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL, -- Diambil dari profile user
  name TEXT NOT NULL,
  category TEXT,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Individuals can view targets of their household." ON public.targets 
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE household_id = targets.household_id));
CREATE POLICY "Individuals can create targets for their household." ON public.targets 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE household_id = targets.household_id));
CREATE POLICY "Individuals can update targets of their household." ON public.targets 
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE household_id = targets.household_id));
CREATE POLICY "Individuals can delete targets of their household." ON public.targets 
  FOR DELETE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE household_id = targets.household_id));

-- 3. Tabel Transactions
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  target_id UUID REFERENCES public.targets(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('in', 'out')),
  amount BIGINT NOT NULL,
  note TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Individuals can view transactions of their household." ON public.transactions 
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE household_id = transactions.household_id));
CREATE POLICY "Individuals can create transactions for their household." ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE household_id = transactions.household_id));

-- Trigger untuk membuat profile otomatis saat user daftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, household_id)
  VALUES (new.id, new.email, gen_random_uuid());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
