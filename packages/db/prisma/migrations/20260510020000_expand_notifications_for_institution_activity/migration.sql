ALTER TYPE "public"."notification_resource_type"
ADD VALUE IF NOT EXISTS 'SECTION';

ALTER TYPE "public"."notification_resource_type"
ADD VALUE IF NOT EXISTS 'SUBJECT';

ALTER TYPE "public"."notification_resource_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_CLASSIFICATION';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SECTION_CREATED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SECTION_UPDATED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SECTION_DELETED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_CREATED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_UPDATED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_DELETED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_CLASSIFICATION_CREATED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_CLASSIFICATION_UPDATED';

ALTER TYPE "public"."notification_action_type"
ADD VALUE IF NOT EXISTS 'SUBJECT_CLASSIFICATION_DELETED';
