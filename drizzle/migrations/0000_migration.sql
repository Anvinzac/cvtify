CREATE TABLE public.user_credits (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 30 CHECK (balance >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own credits" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_usage TO authenticated;
GRANT ALL ON public.credit_usage TO service_role;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON public.credit_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_credits (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_credits
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Atomic spend: returns new balance, or -1 if insufficient
CREATE OR REPLACE FUNCTION public.spend_credits(_user uuid, _amount integer, _feature text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_balance integer;
BEGIN
  INSERT INTO public.user_credits (user_id) VALUES (_user) ON CONFLICT DO NOTHING;
  UPDATE public.user_credits SET balance = balance - _amount, updated_at = now()
    WHERE user_id = _user AND balance >= _amount RETURNING balance INTO new_balance;
  IF new_balance IS NULL THEN RETURN -1; END IF;
  INSERT INTO public.credit_usage (user_id, feature, amount) VALUES (_user, _feature, _amount);
  RETURN new_balance;
END; $$;

CREATE OR REPLACE FUNCTION public.refund_credits(_user uuid, _amount integer)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.user_credits SET balance = balance + _amount, updated_at = now() WHERE user_id = _user;
$$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer) TO service_role;