-- Optimize RLS policies: wrap auth.uid()/auth.role() in scalar subqueries.
--
-- Supabase's performance advisor (lint 0003 auth_rls_initplan) flags policies
-- that call auth.uid()/auth.role() directly: Postgres re-evaluates the function
-- once PER ROW. Wrapping it as (select auth.uid()) turns it into an InitPlan
-- that runs ONCE per query and is cached, which is dramatically faster on large
-- scans. Behavior is identical — same value, same access decisions.
--
-- Each policy below is dropped and recreated with the wrapped form. Roles,
-- commands, and predicate logic are preserved exactly as they existed in prod;
-- only auth.uid() -> (select auth.uid()) and auth.role() -> (select auth.role()).
-- Runs in a single transaction (no window where a policy is missing).

-- ── audit_logs ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow inserts for audit logging" ON public.audit_logs;
CREATE POLICY "Allow inserts for audit logging" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ── conversations ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = ANY (participants));

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = ANY (participants));

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = ANY (participants));

-- ── dispute_messages ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Dispute parties can send messages" ON public.dispute_messages;
CREATE POLICY "Dispute parties can send messages" ON public.dispute_messages
  FOR INSERT TO public
  WITH CHECK (
    ((select auth.uid()) = sender_id)
    AND (EXISTS (
      SELECT 1 FROM disputes d
      WHERE ((d.id = dispute_messages.dispute_id)
        AND ((d.opened_by = (select auth.uid())) OR (d.against_user = (select auth.uid()))))
    ))
  );

DROP POLICY IF EXISTS "Dispute parties can view messages" ON public.dispute_messages;
CREATE POLICY "Dispute parties can view messages" ON public.dispute_messages
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM disputes d
    WHERE ((d.id = dispute_messages.dispute_id)
      AND ((d.opened_by = (select auth.uid())) OR (d.against_user = (select auth.uid()))))
  ));

-- ── disputes ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can open disputes" ON public.disputes;
CREATE POLICY "Authenticated users can open disputes" ON public.disputes
  FOR INSERT TO public
  WITH CHECK ((select auth.uid()) = opened_by);

DROP POLICY IF EXISTS "Dispute parties can update disputes" ON public.disputes;
CREATE POLICY "Dispute parties can update disputes" ON public.disputes
  FOR UPDATE TO public
  USING (((select auth.uid()) = opened_by) OR ((select auth.uid()) = against_user));

DROP POLICY IF EXISTS "Users can view disputes they are party to" ON public.disputes;
CREATE POLICY "Users can view disputes they are party to" ON public.disputes
  FOR SELECT TO public
  USING (((select auth.uid()) = opened_by) OR ((select auth.uid()) = against_user));

-- ── equipment ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "equipment_owner_select" ON public.equipment;
CREATE POLICY "equipment_owner_select" ON public.equipment
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = owner_id);

-- ── id_verification_documents ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can submit verification docs" ON public.id_verification_documents;
CREATE POLICY "Users can submit verification docs" ON public.id_verification_documents
  FOR INSERT TO public
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own verification docs" ON public.id_verification_documents;
CREATE POLICY "Users can view their own verification docs" ON public.id_verification_documents
  FOR SELECT TO public
  USING ((select auth.uid()) = user_id);

-- ── messages ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
CREATE POLICY "Participants can insert messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    ((select auth.uid()) = sender_id)
    AND (EXISTS (
      SELECT 1 FROM conversations c
      WHERE ((c.id = messages.conversation_id) AND ((select auth.uid()) = ANY (c.participants)))
    ))
  );

DROP POLICY IF EXISTS "Participants can update message read status" ON public.messages;
CREATE POLICY "Participants can update message read status" ON public.messages
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE ((c.id = messages.conversation_id) AND ((select auth.uid()) = ANY (c.participants)))
  ));

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE ((c.id = messages.conversation_id) AND ((select auth.uid()) = ANY (c.participants)))
  ));

-- ── notification_logs ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Service role full access to notification_logs" ON public.notification_logs;
CREATE POLICY "Service role full access to notification_logs" ON public.notification_logs
  FOR ALL TO public
  USING ((select auth.role()) = 'service_role'::text);

-- ── notifications ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── push_subscriptions ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Service role full access to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Service role full access to push_subscriptions" ON public.push_subscriptions
  FOR ALL TO public
  USING ((select auth.role()) = 'service_role'::text);

-- ── recurring_rentals ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Parties can update recurring rentals" ON public.recurring_rentals;
CREATE POLICY "Parties can update recurring rentals" ON public.recurring_rentals
  FOR UPDATE TO public
  USING (((select auth.uid()) = renter_id) OR ((select auth.uid()) = owner_id));

DROP POLICY IF EXISTS "Renter can create recurring rentals" ON public.recurring_rentals;
CREATE POLICY "Renter can create recurring rentals" ON public.recurring_rentals
  FOR INSERT TO public
  WITH CHECK ((select auth.uid()) = renter_id);

DROP POLICY IF EXISTS "Renter can view their recurring rentals" ON public.recurring_rentals;
CREATE POLICY "Renter can view their recurring rentals" ON public.recurring_rentals
  FOR SELECT TO public
  USING (((select auth.uid()) = renter_id) OR ((select auth.uid()) = owner_id));

-- ── rental_agreements ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Agreement parties can view agreements" ON public.rental_agreements;
CREATE POLICY "Agreement parties can view agreements" ON public.rental_agreements
  FOR SELECT TO public
  USING (((select auth.uid()) = owner_id) OR ((select auth.uid()) = renter_id));

DROP POLICY IF EXISTS "Parties can sign agreements" ON public.rental_agreements;
CREATE POLICY "Parties can sign agreements" ON public.rental_agreements
  FOR UPDATE TO public
  USING (((select auth.uid()) = owner_id) OR ((select auth.uid()) = renter_id));

DROP POLICY IF EXISTS "System can create agreements" ON public.rental_agreements;
CREATE POLICY "System can create agreements" ON public.rental_agreements
  FOR INSERT TO public
  WITH CHECK (((select auth.uid()) = owner_id) OR ((select auth.uid()) = renter_id));

-- ── reviews ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT TO public
  WITH CHECK ((select auth.uid()) = reviewer_id);

DROP POLICY IF EXISTS "Equipment owners can respond to reviews" ON public.reviews;
CREATE POLICY "Equipment owners can respond to reviews" ON public.reviews
  FOR UPDATE TO public
  USING ((select auth.uid()) IN (
    SELECT equipment.owner_id FROM equipment WHERE (equipment.id = reviews.equipment_id)
  ));

DROP POLICY IF EXISTS "Reviewers can update own reviews" ON public.reviews;
CREATE POLICY "Reviewers can update own reviews" ON public.reviews
  FOR UPDATE TO public
  USING (((select auth.uid()) = reviewer_id) AND (created_at > (now() - '48:00:00'::interval)));
