
-- Comments on the Vision/Mission page
CREATE TABLE public.gov_vision_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gov_vision_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vision comments are publicly viewable"
  ON public.gov_vision_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create vision comments"
  ON public.gov_vision_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own vision comments"
  ON public.gov_vision_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any vision comment"
  ON public.gov_vision_comments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Upvotes on vision comments
CREATE TABLE public.gov_vision_comment_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.gov_vision_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

ALTER TABLE public.gov_vision_comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vision comment votes are publicly viewable"
  ON public.gov_vision_comment_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote"
  ON public.gov_vision_comment_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own upvote"
  ON public.gov_vision_comment_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
