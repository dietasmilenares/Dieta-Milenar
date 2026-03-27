CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('acesso','pagamento','conteudo','tecnico','outro') COLLATE utf8mb4_unicode_ci DEFAULT 'outro',
  `priority` enum('baixa','media','alta') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `status` enum('aberto','em_atendimento','resolvido','fechado') COLLATE utf8mb4_unicode_ci DEFAULT 'aberto',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ticket_id` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
