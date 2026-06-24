ALTER PUBLICATION supabase_realtime ADD TABLE public.public_survey_responses;
ALTER TABLE public.public_survey_responses REPLICA IDENTITY FULL;