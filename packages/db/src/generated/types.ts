import type { ColumnType } from 'kysely';
export type Generated<T> =
    T extends ColumnType<infer S, infer I, infer U>
        ? ColumnType<S, I | undefined, U>
        : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const enrollment_request_status = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;
export type enrollment_request_status =
    (typeof enrollment_request_status)[keyof typeof enrollment_request_status];
export const subject_offering_status = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    ARCHIVED: 'ARCHIVED',
} as const;
export type subject_offering_status =
    (typeof subject_offering_status)[keyof typeof subject_offering_status];
export const aal_level = {
    aal1: 'aal1',
    aal2: 'aal2',
    aal3: 'aal3',
} as const;
export type aal_level = (typeof aal_level)[keyof typeof aal_level];
export const code_challenge_method = {
    s256: 's256',
    plain: 'plain',
} as const;
export type code_challenge_method =
    (typeof code_challenge_method)[keyof typeof code_challenge_method];
export const factor_status = {
    unverified: 'unverified',
    verified: 'verified',
} as const;
export type factor_status = (typeof factor_status)[keyof typeof factor_status];
export const factor_type = {
    totp: 'totp',
    webauthn: 'webauthn',
    phone: 'phone',
} as const;
export type factor_type = (typeof factor_type)[keyof typeof factor_type];
export const oauth_authorization_status = {
    pending: 'pending',
    approved: 'approved',
    denied: 'denied',
    expired: 'expired',
} as const;
export type oauth_authorization_status =
    (typeof oauth_authorization_status)[keyof typeof oauth_authorization_status];
export const oauth_client_type = {
    public: 'public',
    confidential: 'confidential',
} as const;
export type oauth_client_type = (typeof oauth_client_type)[keyof typeof oauth_client_type];
export const oauth_registration_type = {
    dynamic: 'dynamic',
    manual: 'manual',
} as const;
export type oauth_registration_type =
    (typeof oauth_registration_type)[keyof typeof oauth_registration_type];
export const oauth_response_type = {
    code: 'code',
} as const;
export type oauth_response_type = (typeof oauth_response_type)[keyof typeof oauth_response_type];
export const one_time_token_type = {
    confirmation_token: 'confirmation_token',
    reauthentication_token: 'reauthentication_token',
    recovery_token: 'recovery_token',
    email_change_token_new: 'email_change_token_new',
    email_change_token_current: 'email_change_token_current',
    phone_change_token: 'phone_change_token',
} as const;
export type one_time_token_type = (typeof one_time_token_type)[keyof typeof one_time_token_type];
export const user_status = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;
export type user_status = (typeof user_status)[keyof typeof user_status];
export const student_whitelist_status = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED',
} as const;
export type student_whitelist_status =
    (typeof student_whitelist_status)[keyof typeof student_whitelist_status];
export const question_type = {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    MULTIPLE_RESPONSE: 'MULTIPLE_RESPONSE',
    IDENTIFICATION: 'IDENTIFICATION',
    ESSAY: 'ESSAY',
    ENUMERATION: 'ENUMERATION',
    TRUE_FALSE: 'TRUE_FALSE',
    MATCHING: 'MATCHING',
    FILL_BLANK: 'FILL_BLANK',
} as const;
export type question_type = (typeof question_type)[keyof typeof question_type];
export const question_difficulty = {
    EASY: 'EASY',
    MODERATE: 'MODERATE',
    HARD: 'HARD',
} as const;
export type question_difficulty = (typeof question_difficulty)[keyof typeof question_difficulty];
export const exam_difficulty = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
} as const;
export type exam_difficulty = (typeof exam_difficulty)[keyof typeof exam_difficulty];
export const exam_status = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
    SCHEDULED: 'SCHEDULED',
    AVAILABLE: 'AVAILABLE',
    COMPLETED: 'COMPLETED',
    IN_PROGRESS: 'IN_PROGRESS',
    UPCOMING: 'UPCOMING',
    ACTIVE: 'ACTIVE',
} as const;
export type exam_status = (typeof exam_status)[keyof typeof exam_status];
export const proctor_assignment_status = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    SCHEDULED: 'SCHEDULED',
} as const;
export type proctor_assignment_status =
    (typeof proctor_assignment_status)[keyof typeof proctor_assignment_status];
export const announcement_status = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    SCHEDULED: 'SCHEDULED',
    ARCHIVED: 'ARCHIVED',
} as const;
export type announcement_status = (typeof announcement_status)[keyof typeof announcement_status];
export const message_status = {
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
} as const;
export type message_status = (typeof message_status)[keyof typeof message_status];
export const action_type = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
} as const;
export type action_type = (typeof action_type)[keyof typeof action_type];
export const incident_severity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
} as const;
export type incident_severity = (typeof incident_severity)[keyof typeof incident_severity];
export const incident_type = {
    FACE_NOT_VISIBLE: 'FACE_NOT_VISIBLE',
    MULTIPLE_FACES: 'MULTIPLE_FACES',
    TAB_SWITCH: 'TAB_SWITCH',
    AUDIO_DETECTED: 'AUDIO_DETECTED',
    SUSPICIOUS_MOVEMENT: 'SUSPICIOUS_MOVEMENT',
    SCREENSHOT: 'SCREENSHOT',
    SCREEN_RECORD: 'SCREEN_RECORD',
    GAZE: 'GAZE',
    APP_BACKGROUNDING: 'APP_BACKGROUNDING',
    ROOT_JAILBREAK_DETECTED: 'ROOT_JAILBREAK_DETECTED',
    APP_PINNING_VIOLATION: 'APP_PINNING_VIOLATION',
    NOTIFICATION_BLOCK_VIOLATION: 'NOTIFICATION_BLOCK_VIOLATION',
} as const;
export type incident_type = (typeof incident_type)[keyof typeof incident_type];
export const incident_platform = {
    WEB: 'WEB',
    MOBILE: 'MOBILE',
} as const;
export type incident_platform = (typeof incident_platform)[keyof typeof incident_platform];
export const telemetry_source = {
    CLIENT: 'CLIENT',
    SERVER: 'SERVER',
    AI: 'AI',
} as const;
export type telemetry_source = (typeof telemetry_source)[keyof typeof telemetry_source];
export const trend_direction = {
    UP: 'UP',
    DOWN: 'DOWN',
    NEUTRAL: 'NEUTRAL',
} as const;
export type trend_direction = (typeof trend_direction)[keyof typeof trend_direction];
export const room_type = {
    LECTURE: 'LECTURE',
    LABORATORY: 'LABORATORY',
    VIRTUAL: 'VIRTUAL',
} as const;
export type room_type = (typeof room_type)[keyof typeof room_type];
export type analytics_reports = {
    report_id: Generated<string>;
    title: string;
    type: string;
    generated_at: Generated<Timestamp | null>;
    format: Generated<string | null>;
    status: Generated<string | null>;
    file_url: string | null;
    created_by: string | null;
};
export type announcements = {
    announcement_id: Generated<string>;
    title: string;
    content: string;
    target_audience: string[];
    status: Generated<announcement_status | null>;
    published_at: Timestamp | null;
    author_id: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    institution_id: string | null;
};
export type audit_log_entries = {
    instance_id: string | null;
    id: string;
    payload: unknown | null;
    created_at: Timestamp | null;
    ip_address: Generated<string>;
};
export type audit_logs = {
    log_id: Generated<string>;
    user_id: string | null;
    action: string;
    resource_type: string | null;
    resource_id: string | null;
    details: unknown | null;
    ip_address: string | null;
    created_at: Generated<Timestamp | null>;
};
export type class_groups = {
    class_group_id: Generated<string>;
    subject_id: string | null;
    subject_offering_id: string | null;
    section_id: string | null;
    term_id: string | null;
    created_at: Generated<Timestamp | null>;
    institution_id: string | null;
};
export type class_roles = {
    class_group_id: string;
    user_id: string;
    role_id: number;
    assigned_at: Generated<Timestamp | null>;
};
export type conversation_participants = {
    conversation_id: string;
    user_id: string;
    joined_at: Generated<Timestamp | null>;
    last_read_at: Timestamp | null;
};
export type conversations = {
    conversation_id: Generated<string>;
    type: Generated<string | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type course_subjects = {
    course_id: string;
    subject_id: string;
    year_level: number | null;
    semester: string | null;
};
export type courses = {
    course_id: Generated<string>;
    code: string;
    title: string;
    department_id: string | null;
    description: string | null;
    created_by: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    updated_by: string | null;
    institution_id: string | null;
};
export type custom_oauth_providers = {
    id: Generated<string>;
    provider_type: string;
    identifier: string;
    name: string;
    client_id: string;
    client_secret: string;
    acceptable_client_ids: Generated<string[]>;
    scopes: Generated<string[]>;
    pkce_enabled: Generated<boolean>;
    attribute_mapping: Generated<unknown>;
    authorization_params: Generated<unknown>;
    enabled: Generated<boolean>;
    email_optional: Generated<boolean>;
    issuer: string | null;
    discovery_url: string | null;
    skip_nonce_check: Generated<boolean>;
    cached_discovery: unknown | null;
    discovery_cached_at: Timestamp | null;
    authorization_url: string | null;
    token_url: string | null;
    userinfo_url: string | null;
    jwks_uri: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type departments = {
    department_id: Generated<string>;
    department_name: string;
    department_code: string | null;
    created_at: Timestamp | null;
    created_by: string | null;
    updated_at: Timestamp | null;
    updated_by: string | null;
    institution_id: string | null;
};
export type enrollment_requests = {
    request_id: Generated<string>;
    class_group_id: string;
    user_id: string;
    status: Generated<enrollment_request_status>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    approved_by: string | null;
};
export type enrollments = {
    enrollment_id: Generated<string>;
    class_group_id: string | null;
    student_id: string | null;
    enrolled_at: Generated<Timestamp | null>;
};
export type exam_assigned_sections = {
    exam_id: string;
    section_id: string;
    created_at: Generated<Timestamp | null>;
};
export type exam_attempts = {
    attempt_id: Generated<string>;
    exam_id: string | null;
    student_id: string | null;
    started_at: Generated<Timestamp | null>;
    completed_at: Timestamp | null;
    score: number | null;
    total_score: number | null;
    status: Generated<exam_status | null>;
    time_spent_minutes: Generated<number | null>;
    is_verified: Generated<boolean | null>;
    created_at: Generated<Timestamp | null>;
};
export type exam_configurations = {
    config_id: Generated<string>;
    exam_id: string | null;
    shuffle_questions: Generated<boolean | null>;
    show_correct_answers: Generated<boolean | null>;
    allow_review: Generated<boolean | null>;
    randomize_choices: Generated<boolean | null>;
    max_reconnect_attempts: Generated<number | null>;
    strict_mode: Generated<boolean | null>;
    camera_required: Generated<boolean | null>;
    mic_required: Generated<boolean | null>;
    screen_lock: Generated<boolean | null>;
    auto_submit_timeout_minutes: Generated<number | null>;
    allowed_devices: string[];
    ai_rules: Generated<unknown | null>;
    web_security: Generated<unknown | null>;
    mobile_security: Generated<unknown | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type exam_questions = {
    question_id: Generated<string>;
    exam_id: string;
    exam_section_id: string | null;
    source_question_bank_question_id: string | null;
    source_collection_id: string | null;
    question_type: question_type;
    content: unknown;
    points: Generated<number>;
    order_index: Generated<number>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type exam_sections = {
    exam_section_id: Generated<string>;
    exam_id: string;
    title: string;
    order_index: Generated<number>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type exams = {
    exam_id: Generated<string>;
    title: string;
    subject_id: string | null;
    section_id: string | null;
    room_id: string | null;
    section_name: string | null;
    description: string | null;
    duration_minutes: Generated<number>;
    question_count: Generated<number | null>;
    passing_score: Generated<number | null>;
    difficulty: Generated<exam_difficulty | null>;
    scheduled_date: Timestamp | null;
    end_date_time: Timestamp | null;
    status: Generated<exam_status | null>;
    created_by: string | null;
    updated_by: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    published_at: Timestamp | null;
    institution_id: string | null;
};
export type flagged_incidents = {
    incident_id: Generated<string>;
    attempt_id: string | null;
    incident_type: incident_type;
    platform: incident_platform | null;
    source: telemetry_source | null;
    rule_key: string | null;
    severity: Generated<incident_severity | null>;
    details: string | null;
    timestamp: Generated<Timestamp | null>;
    evidence_url: string | null;
    status: Generated<string | null>;
    reviewed_by: string | null;
    reviewed_at: Timestamp | null;
    review_notes: string | null;
    configuration_snapshot: unknown | null;
    session_context: unknown | null;
    dedupe_key: string | null;
};
export type flow_state = {
    id: string;
    user_id: string | null;
    auth_code: string | null;
    code_challenge_method: code_challenge_method | null;
    code_challenge: string | null;
    provider_type: string;
    provider_access_token: string | null;
    provider_refresh_token: string | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    authentication_method: string;
    auth_code_issued_at: Timestamp | null;
    invite_token: string | null;
    referrer: string | null;
    oauth_client_state_id: string | null;
    linking_target_id: string | null;
    email_optional: Generated<boolean>;
};
export type identities = {
    provider_id: string;
    user_id: string;
    identity_data: unknown;
    provider: string;
    last_sign_in_at: Timestamp | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    email: Generated<string | null>;
    id: Generated<string>;
};
export type instances = {
    id: string;
    uuid: string | null;
    raw_base_config: string | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
};
export type institutions = {
    id: Generated<string>;
    name: string;
    code: string | null;
    created_at: Generated<Timestamp | null>;
    created_by: string | null;
    updated_at: Timestamp | null;
    updated_by: string | null;
};
export type instructor_courses = {
    instructor_id: string;
    course_id: string;
    created_at: Generated<Timestamp | null>;
};
export type instructors = {
    instructor_id: Generated<string>;
    user_id: string | null;
    employee_number: string;
    department_id: string | null;
    course_id: string | null;
    institution_id: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type messages = {
    message_id: Generated<string>;
    conversation_id: string | null;
    sender_id: string | null;
    content: string | null;
    status: Generated<message_status | null>;
    created_at: Generated<Timestamp | null>;
};
export type mfa_amr_claims = {
    session_id: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    authentication_method: string;
    id: string;
};
export type mfa_challenges = {
    id: string;
    factor_id: string;
    created_at: Timestamp;
    verified_at: Timestamp | null;
    ip_address: string;
    otp_code: string | null;
    web_authn_session_data: unknown | null;
};
export type mfa_factors = {
    id: string;
    user_id: string;
    friendly_name: string | null;
    factor_type: factor_type;
    status: factor_status;
    created_at: Timestamp;
    updated_at: Timestamp;
    secret: string | null;
    phone: string | null;
    last_challenged_at: Timestamp | null;
    web_authn_credential: unknown | null;
    web_authn_aaguid: string | null;
    last_webauthn_challenge_data: unknown | null;
};
export type oauth_authorizations = {
    id: string;
    authorization_id: string;
    client_id: string;
    user_id: string | null;
    redirect_uri: string;
    scope: string;
    state: string | null;
    resource: string | null;
    code_challenge: string | null;
    code_challenge_method: code_challenge_method | null;
    response_type: Generated<oauth_response_type>;
    status: Generated<oauth_authorization_status>;
    authorization_code: string | null;
    created_at: Generated<Timestamp>;
    expires_at: Generated<Timestamp>;
    approved_at: Timestamp | null;
    nonce: string | null;
};
export type oauth_client_states = {
    id: string;
    provider_type: string;
    code_verifier: string | null;
    created_at: Timestamp;
};
export type oauth_clients = {
    id: string;
    client_secret_hash: string | null;
    registration_type: oauth_registration_type;
    redirect_uris: string;
    grant_types: string;
    client_name: string | null;
    client_uri: string | null;
    logo_uri: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    client_type: Generated<oauth_client_type>;
    token_endpoint_auth_method: string;
};
export type oauth_consents = {
    id: string;
    user_id: string;
    client_id: string;
    scopes: string;
    granted_at: Generated<Timestamp>;
    revoked_at: Timestamp | null;
};
export type one_time_tokens = {
    id: string;
    user_id: string;
    token_type: one_time_token_type;
    token_hash: string;
    relates_to: string;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
};
export type proctor_assignments = {
    assignment_id: Generated<string>;
    exam_id: string | null;
    instructor_id: string | null;
    scheduled_at: Timestamp | null;
    status: Generated<proctor_assignment_status | null>;
    assigned_students_count: Generated<number | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type question_bank_collection_questions = {
    collection_id: string;
    question_bank_question_id: string;
    order_index: Generated<number>;
    added_at: Generated<Timestamp | null>;
};
export type question_bank_collections = {
    collection_id: Generated<string>;
    institution_id: string | null;
    created_by: string | null;
    updated_by: string | null;
    name: string;
    description: string | null;
    tags: Generated<string[]>;
    is_public: Generated<boolean>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type question_bank_questions = {
    question_bank_question_id: Generated<string>;
    subject_id: string | null;
    institution_id: string | null;
    created_by: string | null;
    updated_by: string | null;
    source_origin: Generated<string>;
    source_file_name: string | null;
    source_page_number: number | null;
    source_evidence: string | null;
    question_type: question_type;
    difficulty: Generated<question_difficulty>;
    content: unknown;
    points: Generated<number>;
    tags: Generated<string[]>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    archived_at: Timestamp | null;
};
export type rbac_permissions = {
    permission_id: Generated<string>;
    permission_key: string;
    module_key: string;
    action_key: string;
    category: string | null;
    scope: string | null;
    name: string;
    description: string | null;
    is_system: Generated<boolean | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type rbac_role_permissions = {
    role_id: number;
    permission_id: string;
    created_at: Generated<Timestamp | null>;
};
export type rbac_user_permission_overrides = {
    user_id: string;
    permission_id: string;
    effect: string;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type refresh_tokens = {
    instance_id: string | null;
    id: Generated<string>;
    token: string | null;
    user_id: string | null;
    revoked: boolean | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    parent: string | null;
    session_id: string | null;
};
export type roles = {
    role_id: Generated<number>;
    role_name: string;
    description: string | null;
    is_system: Generated<boolean | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type rooms = {
    room_id: Generated<string>;
    room_name: string;
    room_code: string | null;
    institution_id: string | null;
    created_at: Generated<Timestamp | null>;
    created_by: string | null;
    updated_at: Generated<Timestamp | null>;
    updated_by: string | null;
    room_type: Generated<room_type>;
};
export type saml_providers = {
    id: string;
    sso_provider_id: string;
    entity_id: string;
    metadata_xml: string;
    metadata_url: string | null;
    attribute_mapping: unknown | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    name_id_format: string | null;
};
export type saml_relay_states = {
    id: string;
    sso_provider_id: string;
    request_id: string;
    for_email: string | null;
    redirect_to: string | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    flow_state_id: string | null;
};
export type schema_migrations = {
    version: string;
};
export type sections = {
    section_id: Generated<string>;
    section_name: string;
    year_level: number | null;
    department_id: string | null;
    created_at: Generated<Timestamp | null>;
    course_id: string | null;
    updated_at: Timestamp | null;
    created_by: string | null;
    updated_by: string | null;
    institution_id: string | null;
};
export type sessions = {
    id: string;
    user_id: string;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    factor_id: string | null;
    aal: aal_level | null;
    not_after: Timestamp | null;
    refreshed_at: Timestamp | null;
    user_agent: string | null;
    ip: string | null;
    tag: string | null;
    oauth_client_id: string | null;
    refresh_token_hmac_key: string | null;
    refresh_token_counter: string | null;
    scopes: string | null;
};
export type sso_domains = {
    id: string;
    sso_provider_id: string;
    domain: string;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
};
export type sso_providers = {
    id: string;
    resource_id: string | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    disabled: boolean | null;
};
export type student_whitelist = {
    whitelist_id: Generated<string>;
    institution_id: string;
    department_id: string;
    course_id: string;
    student_number: string;
    last_name: string;
    first_name: string | null;
    status: Generated<student_whitelist_status | null>;
    claimed_user_id: string | null;
    claimed_at: Timestamp | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type students = {
    student_id: Generated<string>;
    user_id: string | null;
    student_number: string;
    department_id: string | null;
    course_id: string | null;
    institution_id: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
};
export type subject_classification_courses = {
    subject_classification_id: string;
    course_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_classification_subjects = {
    subject_classification_id: string;
    subject_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_classifications = {
    subject_classification_id: Generated<string>;
    name: string;
    classification_type: Generated<string>;
    description: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    created_by: string | null;
    updated_by: string | null;
    institution_id: string | null;
    department_id: string | null;
};
export type subject_departments = {
    subject_id: string;
    department_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_offering_courses = {
    subject_offering_id: string;
    course_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_offering_departments = {
    subject_offering_id: string;
    department_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_offering_sections = {
    subject_offering_id: string;
    section_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_offering_year_levels = {
    subject_offering_id: string;
    year_level: number;
    created_at: Generated<Timestamp | null>;
};
export type subject_offerings = {
    subject_offering_id: Generated<string>;
    subject_id: string;
    term_id: string;
    status: Generated<subject_offering_status | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    created_by: string | null;
    updated_by: string | null;
    institution_id: string | null;
};
export type subject_sections = {
    subject_id: string;
    section_id: string;
    created_at: Generated<Timestamp | null>;
};
export type subject_year_levels = {
    subject_id: string;
    year_level: number;
    created_at: Generated<Timestamp | null>;
};
export type subjects = {
    subject_id: Generated<string>;
    subject_code: string;
    subject_title: string;
    term_id: string | null;
    is_opened: Generated<boolean | null>;
    offering_start_date: Timestamp | null;
    offering_end_date: Timestamp | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    created_by: string | null;
    updated_by: string | null;
    institution_id: string | null;
};
export type system_settings = {
    system_setting_id: Generated<string>;
    category: string;
    setting_key: string;
    setting_value: unknown;
    description: string | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    updated_by: string | null;
};
export type terms = {
    term_id: Generated<string>;
    academic_year: string;
    semester: string;
    is_active: Generated<boolean | null>;
    start_date: Timestamp | null;
    end_date: Timestamp | null;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    institution_id: string | null;
};
export type user_profiles = {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    status: Generated<user_status | null>;
    created_at: Generated<Timestamp | null>;
    updated_at: Timestamp | null;
    institution_id: string | null;
    department_id: string | null;
    course_id: string | null;
    last_seen_at: Timestamp | null;
};
export type user_roles = {
    user_id: string;
    role_id: number;
    assigned_at: Generated<Timestamp | null>;
};
export type users = {
    instance_id: string | null;
    id: string;
    aud: string | null;
    role: string | null;
    email: string | null;
    encrypted_password: string | null;
    email_confirmed_at: Timestamp | null;
    invited_at: Timestamp | null;
    confirmation_token: string | null;
    confirmation_sent_at: Timestamp | null;
    recovery_token: string | null;
    recovery_sent_at: Timestamp | null;
    email_change_token_new: string | null;
    email_change: string | null;
    email_change_sent_at: Timestamp | null;
    last_sign_in_at: Timestamp | null;
    raw_app_meta_data: unknown | null;
    raw_user_meta_data: unknown | null;
    is_super_admin: boolean | null;
    created_at: Timestamp | null;
    updated_at: Timestamp | null;
    phone: string | null;
    phone_confirmed_at: Timestamp | null;
    phone_change: Generated<string | null>;
    phone_change_token: Generated<string | null>;
    phone_change_sent_at: Timestamp | null;
    confirmed_at: Generated<Timestamp | null>;
    email_change_token_current: Generated<string | null>;
    email_change_confirm_status: Generated<number | null>;
    banned_until: Timestamp | null;
    reauthentication_token: Generated<string | null>;
    reauthentication_sent_at: Timestamp | null;
    is_sso_user: Generated<boolean>;
    deleted_at: Timestamp | null;
    is_anonymous: Generated<boolean>;
};
export type DB = {
    analytics_reports: analytics_reports;
    announcements: announcements;
    audit_logs: audit_logs;
    'auth.audit_log_entries': audit_log_entries;
    'auth.custom_oauth_providers': custom_oauth_providers;
    'auth.flow_state': flow_state;
    'auth.identities': identities;
    'auth.instances': instances;
    'auth.mfa_amr_claims': mfa_amr_claims;
    'auth.mfa_challenges': mfa_challenges;
    'auth.mfa_factors': mfa_factors;
    'auth.oauth_authorizations': oauth_authorizations;
    'auth.oauth_client_states': oauth_client_states;
    'auth.oauth_clients': oauth_clients;
    'auth.oauth_consents': oauth_consents;
    'auth.one_time_tokens': one_time_tokens;
    'auth.refresh_tokens': refresh_tokens;
    'auth.saml_providers': saml_providers;
    'auth.saml_relay_states': saml_relay_states;
    'auth.schema_migrations': schema_migrations;
    'auth.sessions': sessions;
    'auth.sso_domains': sso_domains;
    'auth.sso_providers': sso_providers;
    'auth.users': users;
    class_groups: class_groups;
    class_roles: class_roles;
    conversation_participants: conversation_participants;
    conversations: conversations;
    course_subjects: course_subjects;
    courses: courses;
    departments: departments;
    enrollment_requests: enrollment_requests;
    enrollments: enrollments;
    exam_assigned_sections: exam_assigned_sections;
    exam_attempts: exam_attempts;
    exam_configurations: exam_configurations;
    exam_questions: exam_questions;
    exam_sections: exam_sections;
    exams: exams;
    flagged_incidents: flagged_incidents;
    institutions: institutions;
    instructor_courses: instructor_courses;
    instructors: instructors;
    messages: messages;
    proctor_assignments: proctor_assignments;
    question_bank_collection_questions: question_bank_collection_questions;
    question_bank_collections: question_bank_collections;
    question_bank_questions: question_bank_questions;
    rbac_permissions: rbac_permissions;
    rbac_role_permissions: rbac_role_permissions;
    rbac_user_permission_overrides: rbac_user_permission_overrides;
    roles: roles;
    rooms: rooms;
    sections: sections;
    student_whitelist: student_whitelist;
    students: students;
    subject_classification_courses: subject_classification_courses;
    subject_classification_subjects: subject_classification_subjects;
    subject_classifications: subject_classifications;
    subject_departments: subject_departments;
    subject_offering_courses: subject_offering_courses;
    subject_offering_departments: subject_offering_departments;
    subject_offering_sections: subject_offering_sections;
    subject_offering_year_levels: subject_offering_year_levels;
    subject_offerings: subject_offerings;
    subject_sections: subject_sections;
    subject_year_levels: subject_year_levels;
    subjects: subjects;
    system_settings: system_settings;
    terms: terms;
    user_profiles: user_profiles;
    user_roles: user_roles;
};
