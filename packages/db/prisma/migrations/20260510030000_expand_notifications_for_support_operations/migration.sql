ALTER TYPE "public"."notification_resource_type"
ADD VALUE IF NOT EXISTS 'SUPPORT_OPERATION';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUPPORT_OPERATION_COMPLETED';
