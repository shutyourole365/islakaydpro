SELECT kcu.table_name, kcu.column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc
  ON kcu.constraint_name = tc.constraint_name
  AND kcu.constraint_schema = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name IN (
    'fk_booking_payout',
    'conversations_booking_id_fkey',
    'conversations_equipment_id_fkey',
    'equipment_availability_booking_id_fkey',
    'platform_settings_updated_by_fkey',
    'verification_requests_reviewed_by_fkey'
  );
