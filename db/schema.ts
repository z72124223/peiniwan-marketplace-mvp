import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`);
const updatedAt = () =>
  text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`);
const jsonStrings = (name: string) =>
  text(name, { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`);

export const regions = sqliteTable("regions", {
  code: text("code").primaryKey(),
  displayName: text("display_name").notNull(),
  defaultLocale: text("default_locale").notNull(),
  currency: text("currency").notNull(),
  timeZone: text("time_zone").notNull(),
  dataPlane: text("data_plane", { enum: ["global", "cn"] }).notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const regionPolicies = sqliteTable(
  "region_policies",
  {
    id: text("id").primaryKey(),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code, { onDelete: "cascade" }),
    minimumAge: integer("minimum_age").notNull().default(18),
    allowedCategoryKeys: jsonStrings("allowed_category_keys"),
    kycRequired: integer("kyc_required", { mode: "boolean" })
      .notNull()
      .default(true),
    transactionRetentionDays: integer("transaction_retention_days")
      .notNull()
      .default(1095),
    paymentAdapter: text("payment_adapter").notNull(),
    identityAdapter: text("identity_adapter").notNull(),
    storageAdapter: text("storage_adapter").notNull(),
    captchaAdapter: text("captcha_adapter").notNull(),
    notificationAdapter: text("notification_adapter").notNull(),
    messagingAdapter: text("messaging_adapter").notNull(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("region_policies_region_idx").on(table.regionCode)]
);

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    role: text("role", { enum: ["player", "provider", "owner"] }).notNull(),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    email: text("email"),
    displayName: text("display_name").notNull(),
    ageVerifiedAt: text("age_verified_at"),
    status: text("status", { enum: ["active", "suspended", "closed"] })
      .notNull()
      .default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_status_idx").on(table.role, table.status),
  ]
);

export const games = sqliteTable(
  "games",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    displayNameZhCn: text("display_name_zh_cn"),
    category: text("category").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("games_slug_idx").on(table.slug)]
);

export const gameServers = sqliteTable(
  "game_servers",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    regionCode: text("region_code").references(() => regions.code),
    name: text("name").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [uniqueIndex("game_servers_game_name_idx").on(table.gameId, table.name)]
);

export const serviceCategories = sqliteTable("service_categories", {
  key: text("key").primaryKey(),
  displayName: text("display_name").notNull(),
  minimumAge: integer("minimum_age").notNull().default(18),
  allowedRegions: jsonStrings("allowed_regions"),
  riskLevel: text("risk_level", { enum: ["low", "medium", "high"] }).notNull(),
  requiresGame: integer("requires_game", { mode: "boolean" })
    .notNull()
    .default(false),
  requiresSkillProof: integer("requires_skill_proof", { mode: "boolean" })
    .notNull()
    .default(false),
  allowsVoiceSample: integer("allows_voice_sample", { mode: "boolean" })
    .notNull()
    .default(true),
  moderationRules: text("moderation_rules").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const providerApplications = sqliteTable(
  "provider_applications",
  {
    id: text("id").primaryKey(),
    applicantName: text("applicant_name").notNull(),
    email: text("email").notNull(),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    publicGender: text("public_gender", {
      enum: ["female", "male", "non_binary", "not_disclosed"],
    }).notNull(),
    serviceAxes: jsonStrings("service_axes"),
    gameIds: jsonStrings("game_ids"),
    personaTags: jsonStrings("persona_tags"),
    biography: text("biography").notNull(),
    externalContact: text("external_contact").notNull().default(""),
    profilePhotoUrl: text("profile_photo_url"),
    voiceSampleUrl: text("voice_sample_url"),
    skillProofNote: text("skill_proof_note"),
    ageConfirmed: integer("age_confirmed", { mode: "boolean" }).notNull(),
    policyAcceptedAt: text("policy_accepted_at").notNull(),
    status: text("status", {
      enum: ["draft", "submitted", "needs_changes", "approved", "rejected"],
    })
      .notNull()
      .default("submitted"),
    reviewNotes: text("review_notes"),
    reviewedAt: text("reviewed_at"),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: updatedAt(),
  },
  (table) => [index("provider_applications_status_idx").on(table.status, table.submittedAt)]
);

export const providerProfiles = sqliteTable(
  "provider_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: text("application_id").references(() => providerApplications.id),
    displayName: text("display_name").notNull(),
    publicGender: text("public_gender", {
      enum: ["female", "male", "non_binary", "not_disclosed"],
    }).notNull(),
    primaryPhotoUrl: text("primary_photo_url").notNull(),
    photoVerificationStatus: text("photo_verification_status", {
      enum: ["pending", "verified", "rejected"],
    })
      .notNull()
      .default("pending"),
    voiceSampleUrl: text("voice_sample_url"),
    voiceVerificationStatus: text("voice_verification_status", {
      enum: ["pending", "verified", "rejected"],
    })
      .notNull()
      .default("pending"),
    voiceTags: jsonStrings("voice_tags"),
    personaTags: jsonStrings("persona_tags"),
    interactionStyleTags: jsonStrings("interaction_style_tags"),
    emotionalStrength: integer("emotional_strength").notNull().default(0),
    technicalStrength: integer("technical_strength").notNull().default(0),
    biography: text("biography").notNull(),
    languages: jsonStrings("languages"),
    regions: jsonStrings("regions"),
    onlineStatus: text("online_status", {
      enum: ["online", "busy", "offline"],
    })
      .notNull()
      .default("offline"),
    lastActiveAt: text("last_active_at"),
    responseTimeMinutes: integer("response_time_minutes"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["active", "paused", "banned"] })
      .notNull()
      .default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("provider_profiles_user_idx").on(table.userId),
    index("provider_profiles_discovery_idx").on(
      table.status,
      table.onlineStatus,
      table.featured
    ),
  ]
);

export const providerMedia = sqliteTable(
  "provider_media",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id, { onDelete: "cascade" }),
    mediaType: text("media_type", {
      enum: ["profile_photo", "voice_sample", "skill_proof", "dispute_evidence"],
    }).notNull(),
    storageKey: text("storage_key").notNull(),
    publicUrl: text("public_url"),
    contentType: text("content_type").notNull(),
    verificationStatus: text("verification_status", {
      enum: ["pending", "verified", "rejected"],
    })
      .notNull()
      .default("pending"),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [index("provider_media_provider_type_idx").on(table.providerId, table.mediaType)]
);

export const providerGameSkills = sqliteTable(
  "provider_game_skills",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id),
    serverId: text("server_id").references(() => gameServers.id),
    rank: text("rank"),
    skillProofFiles: jsonStrings("skill_proof_files"),
    skillVerificationStatus: text("skill_verification_status", {
      enum: ["not_required", "pending", "verified", "rejected"],
    })
      .notNull()
      .default("not_required"),
    coachingSupported: integer("coaching_supported", { mode: "boolean" })
      .notNull()
      .default(false),
    resultGuaranteePolicy: text("result_guarantee_policy"),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("provider_game_skills_unique_idx").on(table.providerId, table.gameId, table.serverId)]
);

export const providerServices = sqliteTable(
  "provider_services",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id, { onDelete: "cascade" }),
    categoryKey: text("category_key")
      .notNull()
      .references(() => serviceCategories.key),
    gameId: text("game_id").references(() => games.id),
    serviceAxis: text("service_axis", {
      enum: ["emotional", "technical", "hybrid"],
    }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    billingUnit: text("billing_unit", {
      enum: ["per_game", "per_30_minutes", "per_60_minutes", "package"],
    }).notNull(),
    priceAmountMinor: integer("price_amount_minor").notNull(),
    currency: text("currency").notNull(),
    packageDetails: text("package_details"),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("provider_services_discovery_idx").on(
      table.enabled,
      table.serviceAxis,
      table.gameId
    ),
  ]
);

export const availabilitySlots = sqliteTable(
  "availability_slots",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id, { onDelete: "cascade" }),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    timeZone: text("time_zone").notNull(),
    status: text("status", { enum: ["open", "held", "booked", "cancelled"] })
      .notNull()
      .default("open"),
  },
  (table) => [index("availability_provider_time_idx").on(table.providerId, table.startsAt)]
);

export const pricingSuggestions = sqliteTable(
  "pricing_suggestions",
  {
    id: text("id").primaryKey(),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    gameId: text("game_id").references(() => games.id),
    serviceAxis: text("service_axis", {
      enum: ["emotional", "technical", "hybrid"],
    }).notNull(),
    billingUnit: text("billing_unit", {
      enum: ["per_game", "per_30_minutes", "per_60_minutes", "package"],
    }).notNull(),
    minimumSuggestedAmountMinor: integer("minimum_suggested_amount_minor").notNull(),
    maximumSuggestedAmountMinor: integer("maximum_suggested_amount_minor").notNull(),
    currency: text("currency").notNull(),
    effectiveFrom: text("effective_from").notNull(),
    effectiveTo: text("effective_to"),
    createdAt: createdAt(),
  },
  (table) => [index("pricing_suggestions_lookup_idx").on(table.regionCode, table.gameId, table.serviceAxis)]
);

export const commissionRules = sqliteTable(
  "commission_rules",
  {
    id: text("id").primaryKey(),
    acquisitionSource: text("acquisition_source", {
      enum: [
        "provider_first_orders",
        "provider_referred",
        "organic_platform",
        "promoted_platform",
        "partner_channel",
      ],
    }).notNull(),
    regionCode: text("region_code").references(() => regions.code),
    platformFeeRateBps: integer("platform_fee_rate_bps").notNull(),
    firstCompletedOrderLimit: integer("first_completed_order_limit"),
    effectiveFrom: text("effective_from").notNull(),
    effectiveTo: text("effective_to"),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [index("commission_rules_lookup_idx").on(table.acquisitionSource, table.regionCode, table.enabled)]
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => users.id),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id),
    providerServiceId: text("provider_service_id")
      .notNull()
      .references(() => providerServices.id),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    requestedStartAt: text("requested_start_at").notNull(),
    requestedDurationMinutes: integer("requested_duration_minutes"),
    status: text("status", {
      enum: ["draft", "pending_payment", "paid", "confirmed", "in_service", "completed", "cancelled", "refunded", "disputed"],
    })
      .notNull()
      .default("draft"),
    acquisitionSource: text("acquisition_source", {
      enum: ["provider_first_orders", "provider_referred", "organic_platform", "promoted_platform", "partner_channel"],
    }).notNull(),
    currency: text("currency").notNull(),
    grossAmountMinor: integer("gross_amount_minor").notNull(),
    platformFeeRateBpsSnapshot: integer("platform_fee_rate_bps_snapshot").notNull(),
    platformFeeAmountMinorSnapshot: integer("platform_fee_amount_minor_snapshot").notNull(),
    paymentProcessingFeeMinorSnapshot: integer("payment_processing_fee_minor_snapshot").notNull(),
    providerNetAmountMinorSnapshot: integer("provider_net_amount_minor_snapshot").notNull(),
    paymentReference: text("payment_reference"),
    externalVoiceContact: text("external_voice_contact"),
    completedAt: text("completed_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("orders_player_idx").on(table.playerId, table.createdAt),
    index("orders_provider_idx").on(table.providerId, table.status, table.requestedStartAt),
  ]
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => users.id),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id),
    emotionalValueScore: integer("emotional_value_score"),
    technicalSkillScore: integer("technical_skill_score"),
    communicationScore: integer("communication_score").notNull(),
    punctualityScore: integer("punctuality_score").notNull(),
    descriptionAccuracyScore: integer("description_accuracy_score").notNull(),
    overallScore: integer("overall_score").notNull(),
    comment: text("comment"),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("reviews_order_idx").on(table.orderId)]
);

export const favorites = sqliteTable(
  "favorites",
  {
    playerId: text("player_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.providerId] })]
);

export const conciergeRequests = sqliteTable(
  "concierge_requests",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").references(() => users.id),
    contactName: text("contact_name").notNull(),
    contactMethod: text("contact_method").notNull(),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    gameId: text("game_id").references(() => games.id),
    preferredGender: text("preferred_gender"),
    preferredPersonaTags: jsonStrings("preferred_persona_tags"),
    preferredVoiceTags: jsonStrings("preferred_voice_tags"),
    serviceAxis: text("service_axis", {
      enum: ["emotional", "technical", "hybrid"],
    }).notNull(),
    budgetMinMinor: integer("budget_min_minor"),
    budgetMaxMinor: integer("budget_max_minor"),
    currency: text("currency").notNull(),
    requestedStartAt: text("requested_start_at").notNull(),
    requestedDurationMinutes: integer("requested_duration_minutes").notNull(),
    notes: text("notes").notNull(),
    ageConfirmed: integer("age_confirmed", { mode: "boolean" }).notNull(),
    ownerStatus: text("owner_status", {
      enum: ["new", "reviewing", "matched", "awaiting_player", "converted", "closed"],
    })
      .notNull()
      .default("new"),
    matchedProviderId: text("matched_provider_id").references(() => providerProfiles.id),
    convertedOrderId: text("converted_order_id").references(() => orders.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("concierge_owner_queue_idx").on(table.ownerStatus, table.createdAt)]
);

export const supportCases = sqliteTable(
  "support_cases",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").references(() => orders.id),
    openedByUserId: text("opened_by_user_id").references(() => users.id),
    caseType: text("case_type", {
      enum: ["order_help", "refund", "complaint", "safety", "other"],
    }).notNull(),
    description: text("description").notNull(),
    externalContact: text("external_contact"),
    riskLevel: text("risk_level", { enum: ["low", "medium", "high", "urgent"] })
      .notNull()
      .default("low"),
    status: text("status", {
      enum: ["open", "waiting_user", "investigating", "resolved", "closed"],
    })
      .notNull()
      .default("open"),
    ownerNotes: text("owner_notes"),
    dueAt: text("due_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("support_cases_queue_idx").on(table.status, table.riskLevel, table.createdAt)]
);

export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    supportCaseId: text("support_case_id").references(() => supportCases.id),
    reporterUserId: text("reporter_user_id").references(() => users.id),
    reportedUserId: text("reported_user_id").references(() => users.id),
    category: text("category").notNull(),
    description: text("description").notNull(),
    duplicateGroupKey: text("duplicate_group_key"),
    status: text("status", { enum: ["submitted", "reviewing", "actioned", "dismissed"] })
      .notNull()
      .default("submitted"),
    createdAt: createdAt(),
  },
  (table) => [index("reports_status_idx").on(table.status, table.createdAt)]
);

export const disputes = sqliteTable(
  "disputes",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    supportCaseId: text("support_case_id").references(() => supportCases.id),
    openedByUserId: text("opened_by_user_id").references(() => users.id),
    reason: text("reason").notNull(),
    status: text("status", {
      enum: ["open", "evidence_requested", "under_review", "resolved_player", "resolved_provider", "closed"],
    })
      .notNull()
      .default("open"),
    payoutFrozen: integer("payout_frozen", { mode: "boolean" }).notNull().default(true),
    resolution: text("resolution"),
    resolvedAt: text("resolved_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("disputes_queue_idx").on(table.status, table.createdAt)]
);

export const disputeEvidence = sqliteTable(
  "dispute_evidence",
  {
    id: text("id").primaryKey(),
    disputeId: text("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    submittedByUserId: text("submitted_by_user_id").references(() => users.id),
    storageKey: text("storage_key").notNull(),
    contentType: text("content_type").notNull(),
    description: text("description"),
    createdAt: createdAt(),
  },
  (table) => [index("dispute_evidence_dispute_idx").on(table.disputeId, table.createdAt)]
);

export const moderationActions = sqliteTable(
  "moderation_actions",
  {
    id: text("id").primaryKey(),
    targetUserId: text("target_user_id").references(() => users.id),
    providerServiceId: text("provider_service_id").references(() => providerServices.id),
    disputeId: text("dispute_id").references(() => disputes.id),
    actionType: text("action_type", {
      enum: ["pause_provider", "hide_service", "freeze_payout", "refund", "request_evidence", "close_case", "restore"],
    }).notNull(),
    reason: text("reason").notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [index("moderation_actions_target_idx").on(table.targetUserId, table.createdAt)]
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    previousValueJson: text("previous_value_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    nextValueJson: text("next_value_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    reason: text("reason"),
    requestId: text("request_id"),
    createdAt: createdAt(),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId, table.createdAt)]
);

export const ownerPresence = sqliteTable("owner_presence", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { enum: ["online", "busy", "offline"] })
    .notNull()
    .default("offline"),
  statusMessage: text("status_message"),
  expectedResponseMinutes: integer("expected_response_minutes"),
  updatedAt: updatedAt(),
});

export const staffRoles = sqliteTable("staff_roles", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  displayName: text("display_name").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  description: text("description").notNull(),
  createdAt: createdAt(),
});

export const staffRolePermissions = sqliteTable(
  "staff_role_permissions",
  {
    staffRoleId: text("staff_role_id")
      .notNull()
      .references(() => staffRoles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.staffRoleId, table.permissionId] })]
);
