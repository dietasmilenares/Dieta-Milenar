-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 19/03/2026 às 21:53
-- Versão do servidor: 5.7.34
-- Versão do PHP: 8.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `dm`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `affiliate_clicks`
--

CREATE TABLE `affiliate_clicks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliate_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `landing_page` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonuses`
--

CREATE TABLE `bonuses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image` text COLLATE utf8mb4_unicode_ci,
  `download_url` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `target_audience` enum('MEMBRO','REVENDA','VIP','ADMIN','VISITANTE') COLLATE utf8mb4_unicode_ci DEFAULT 'MEMBRO',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `bonuses`
--

INSERT INTO `bonuses` (`id`, `title`, `description`, `cover_image`, `download_url`, `content`, `target_audience`, `active`, `created_at`) VALUES
('7433e476-764f-42e0-a9c3-b076420d5f8d', 'Título de bônus teste', 'Descrição HTML teste', '/img/capa.png', '/e-books/1773438404342_1.4DietaEgipcia-main__1_.zip.pdf', NULL, 'MEMBRO', 1, '2026-03-13 21:47:10');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonus_categories`
--

CREATE TABLE `bonus_categories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `is_mandatory` tinyint(1) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `bonus_categories`
--

INSERT INTO `bonus_categories` (`id`, `name`, `description`, `sort_order`, `is_mandatory`, `drip_days`, `active`) VALUES
('0.9331570473023678', 'Teste', 'Teste', 1, 1, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonus_items`
--

CREATE TABLE `bonus_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bonus_category_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `download_url` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `bonus_items`
--

INSERT INTO `bonus_items` (`id`, `bonus_category_id`, `title`, `description`, `cover_image`, `content`, `download_url`, `sort_order`, `drip_days`, `active`, `created_at`) VALUES
('e4d04fa7-e65b-415b-890d-8de7142be7b3', '0bec2286-de7d-4327-9071-d267cb8d9f6b', 'Título do e-book bônus', 'Descrição do e-book de bônus', '/img/capa.png', 'Conteúdo HTML do bomnes', NULL, 1, 0, 1, '2026-03-13 17:37:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bots`
--

CREATE TABLE `bots` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `persona` text COLLATE utf8mb4_unicode_ci,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `is_mandatory` tinyint(1) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `sort_order`, `is_mandatory`, `drip_days`, `active`) VALUES
('cat-fundacao', 'Fundação', 'A base obrigatória de toda transformação. Antes de queimar gordura, você precisa limpar o organismo.', 1, 1, 0, 1),
('cat-vitalidade', 'Vitalidade', 'Depois de limpar, você precisa restaurar energia para dar continuidade na transformação corporal.', 2, 0, 0, 1),
('cat-queima', 'Queima de Gordura', 'Protocolos ancestrais para eliminar gordura corporal, secar barriga e definir o corpo.', 3, 0, 0, 1),
('cat-musculo', 'Construção Muscular', 'Ganhe massa magra, força e músculos definidos usando apenas alimentos naturais.', 4, 0, 0, 1),
('cat-equilibrio', 'Equilíbrio Interno', 'Hormônios e intestino: os dois fatores internos que mais impactam emagrecimento e definição.', 5, 0, 0, 1),
('cat-bonus', 'Bônus Complementares', 'Materiais extras que complementam sua jornada: beleza natural, longevidade e mais.', 6, 0, 0, 1),
('e06c3719-583b-4062-a169-9f856954d485', 'Teste', 'Teste', 7, 0, 0, 0),
('3a606ee9-a271-4d1d-b487-4a8393c5efe2', 'BUSCAPE', 'Teste', 7, 0, 0, 0),
('ab48a62a-4744-4b5d-bc64-84e050252581', 'Fhc', 'Gghf', 8, 0, 0, 0),
('a1faa59b-c635-4ad1-82af-20831442a52d', 'Teste', 'Yedte', 7, 0, 0, 0),
('236c5f3d-080d-4350-a3aa-84b18711201e', 'Teste', 'Teste', 7, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `commissions`
--

CREATE TABLE `commissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliate_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `release_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ebooks`
--

CREATE TABLE `ebooks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategory_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `download_url` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `ebooks`
--

INSERT INTO `ebooks` (`id`, `category_id`, `subcategory_id`, `title`, `description`, `cover_image`, `content`, `download_url`, `sort_order`, `drip_days`, `active`, `created_at`) VALUES
('eb-detox-f1', 'cat-fundacao', 'saga-detox', 'Fase 1: Despertar do Organismo', 'Os primeiros 7 dias de limpeza profunda. Elimine toxinas superficiais, reduza inchaço e prepare o corpo para queimar gordura.', '/img/capa.png', '', '/e-books/Detox/1Fase-Saga_Detox_Despertar_do_Organismo.pdf', 1, 0, 1, '2026-03-17 11:51:02'),
('eb-detox-f2', 'cat-fundacao', 'saga-detox', 'Fase 2: Purificação Profunda', 'Dias 8 a 14: Limpe o fígado em profundidade, acelere queima de gordura e regenere órgãos de eliminação.', '/img/capa.png', '', '/e-books/Detox/2Fase-Saga_Detox_Purificacao_Profunda.pdf', 2, 7, 1, '2026-03-17 11:51:02'),
('eb-detox-f3', 'cat-fundacao', 'saga-detox', 'Fase 3: Renascimento Celular', 'Dias 15 a 21: Consolide resultados, regenere células e sele a transformação. Organismo pronto para próximas jornadas.', '/img/capa.png', '', '/e-books/Detox/3Fase-Saga_Detox__Renascimento_Celular.pdf', 3, 14, 1, '2026-03-17 11:51:02'),
('eb-detox-bonus', 'cat-fundacao', 'saga-detox', 'BÔNUS: Águas Medicinais dos Faraós', 'Receitas exclusivas de águas detox, infusões e elixires que os faraós consumiam para manter corpo puro.', '/img/capa.png', '', '/e-books/Detox/4Bonus-Saga_Detox_Aguas_Medicinais_dos_Faraos.pdf', 4, 21, 1, '2026-03-17 11:51:02'),
('eb-energia-f1', 'cat-vitalidade', 'saga-energia', 'Fase 1: Despertar Força Interior', 'Elimine fadiga pós-detox em 7 dias. Restaure energia mitocondrial e vitalidade celular para continuar firme.', '/img/capa.png', '', '/e-books/ Energia/1Fase-Saga_Energia_Despertar_Forca_Interior.pdf', 1, 0, 1, '2026-03-17 11:51:02'),
('eb-energia-f2', 'cat-vitalidade', 'saga-energia', 'Fase 2: Energia Inabalável', 'Dias 8 a 14: Construa energia sustentada o dia todo. Disposição para treinar, trabalhar e viver intensamente.', '/img/capa.png', '', '/e-books/ Energia/2Fase-Saga_Energia_Energia_Inavalavel.pdf', 2, 7, 1, '2026-03-17 11:51:02'),
('eb-energia-f3', 'cat-vitalidade', 'saga-energia', 'Fase 3: Resistência Divina', 'Dias 15 a 21: Consolide resistência física e mental. Energia dos sacerdotes que trabalhavam 12 horas sob sol.', '/img/capa.png', '', '/e-books/ Energia/3Fase-Saga_Energia_Resistencia_Divina.pdf', 3, 14, 1, '2026-03-17 11:51:02'),
('eb-energia-bonus', 'cat-vitalidade', 'saga-energia', 'BÔNUS: Tônicos Energéticos Milenares', 'Bebidas que aumentam energia instantânea, foco prolongado e resistência sem cafeína ou estimulantes artificiais.', '/img/capa.png', '', '/e-books/ Energia/4Bonus-Saga_Energia_Tonicos_Energeticos_Milenares.pdf', 4, 21, 1, '2026-03-17 11:51:02'),
('eb-meta-f1', 'cat-queima', 'saga-metabolismo', 'Fase 1: Acender a Chama Metabólica', 'Desperte metabolismo adormecido em 7 dias. Termogênicos naturais que aumentam queima de calorias em até 20%.', '/img/capa.png', '', '/e-books/Metabolismo/1Fase-Saga_Metabolismo_Acender_Chama_Metabolica.pdf', 1, 0, 1, '2026-03-17 11:51:02'),
('eb-meta-f2', 'cat-queima', 'saga-metabolismo', 'Fase 2: Acelerar a Fornalha Interna', 'Dias 8 a 14: Potencialize queima com alimentos que transformam corpo em máquina de emagrecer 24h por dia.', '/img/capa.png', '', '/e-books/Metabolismo/2Fase-Saga_Metabolismo_Acelerar_Fornalha_Interna.pdf', 2, 7, 1, '2026-03-17 11:51:02'),
('eb-meta-f3', 'cat-queima', 'saga-metabolismo', 'Fase 3: Metabolismo Imparável', 'Dias 15 a 21: Consolide metabolismo rápido permanente. Você nunca mais voltará ao metabolismo lento.', '/img/capa.png', '', '/e-books/Metabolismo/3Fase-Saga_Metabolismo_Metabolismo_Imparavel.pdf', 3, 14, 1, '2026-03-17 11:51:02'),
('eb-meta-bonus', 'cat-queima', 'saga-metabolismo', 'BÔNUS: Chás Termogênicos Ancestrais', 'Receitas secretas de chás que aceleram metabolismo, queimam gordura e dão energia sustentada.', '/img/capa.png', '', '/e-books/Metabolismo/4Bonus-Saga_Metabolismo_Chas_Termogenicos_Ancestrais.pdf', 4, 21, 1, '2026-03-17 11:51:02'),
('eb-def-f1', 'cat-queima', 'saga-definicao', 'Fase 1: Despertar Abdominal', 'Desinche barriga em 7 dias. Elimine líquidos, reduza inflamação abdominal e veja músculos aparecerem.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-def-f2', 'cat-queima', 'saga-definicao', 'Fase 2: Queima Profunda', 'Dias 8 a 14: Destrua gordura visceral teimosa com alimentos que atacam especificamente região abdominal.', '/img/capa.png', '', NULL, 2, 7, 1, '2026-03-17 11:51:02'),
('eb-def-f3', 'cat-queima', 'saga-definicao', 'Fase 3: Definição Esculpida', 'Dias 15 a 21: Esculpa abdômen faraônico. Músculos definidos, cintura fina, barriga chapada e forte.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-17 11:51:02'),
('eb-def-bonus', 'cat-queima', 'saga-definicao', 'BÔNUS: Os 7 Exercícios Sagrados dos Guerreiros', 'Movimentos corporais simples que guerreiros faziam para manter abdômen de pedra sem equipamentos.', '/img/capa.png', '', NULL, 4, 21, 1, '2026-03-17 11:51:02'),
('eb-local-f1', 'cat-queima', 'saga-localizada', 'Fase 1: Mapeamento da Gordura Teimosa', 'Identifique suas zonas de gordura teimosa em 7 dias. Coxas, braços, costas ou culotes - ataque estratégico.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-local-f2', 'cat-queima', 'saga-localizada', 'Fase 2: Queima Direcionada', 'Dias 8 a 14: Alimentos e ervas que atacam receptores específicos de gordura localizada. Queima precisa.', '/img/capa.png', '', NULL, 2, 7, 1, '2026-03-17 11:51:02'),
('eb-local-f3', 'cat-queima', 'saga-localizada', 'Fase 3: Eliminação Total', 'Dias 15 a 21: Destrua até a última célula de gordura teimosa. Corpo harmonioso e proporcionado.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-17 11:51:02'),
('eb-local-bonus', 'cat-queima', 'saga-localizada', 'BÔNUS: Massagens Egípcias Modeladoras', 'Técnicas de automassagem que rainhas egípcias usavam para drenar e modelar regiões específicas.', '/img/capa.png', '', NULL, 4, 21, 1, '2026-03-17 11:51:02'),
('eb-forca-f1', 'cat-musculo', 'saga-forca', 'Fase 1: Fundação Proteica Natural', 'Construa base muscular com proteínas que construtores das pirâmides consumiam para força sobre-humana.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-forca-f2', 'cat-musculo', 'saga-forca', 'Fase 2: Construção Muscular Ancestral', 'Dias 8 a 14: Ganhe massa magra com alimentos que estimulam crescimento muscular sem suplementos químicos.', '/img/capa.png', '', NULL, 2, 7, 1, '2026-03-17 11:51:02'),
('eb-forca-f3', 'cat-musculo', 'saga-forca', 'Fase 3: Força do Deus Hórus', 'Dias 15 a 21: Consolide músculos fortes, densos e resistentes. Corpo de guerreiro construído pela natureza.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-17 11:51:02'),
('eb-forca-bonus', 'cat-musculo', 'saga-forca', 'BÔNUS: Alimentos Construtores do Nilo', 'Guia completo dos alimentos que constroem músculo, aumentam força e aceleram recuperação naturalmente.', '/img/capa.png', '', NULL, 4, 21, 1, '2026-03-17 11:51:02'),
('eb-hiper-f1', 'cat-musculo', 'saga-hipertrofia', 'Fase 1: Despertar Anabolismo Natural', 'Ative vias de crescimento muscular em 7 dias com alimentos que elevam hormônios anabólicos naturalmente.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-hiper-f2', 'cat-musculo', 'saga-hipertrofia', 'Fase 2: Ganho de Massa Acelerado', 'Dias 8 a 14: Protocolo completo para hipertrofia limpa. Ganhe músculo sem acumular gordura extra.', '/img/capa.png', '', NULL, 2, 7, 1, '2026-03-17 11:51:02'),
('eb-hiper-f3', 'cat-musculo', 'saga-hipertrofia', 'Fase 3: Massa Magra Faraônica', 'Dias 15 a 21: Consolide ganhos musculares permanentes. Corpo volumoso, definido e proporcional.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-17 11:51:02'),
('eb-hiper-bonus', 'cat-musculo', 'saga-hipertrofia', 'BÔNUS: Timing Nutricional dos Faraós', 'Quando comer o quê para maximizar ganho muscular. Estratégias de horários que faraós atletas usavam.', '/img/capa.png', '', NULL, 4, 21, 1, '2026-03-17 11:51:02'),
('eb-horm-f1', 'cat-equilibrio', 'saga-hormonal', 'Fase 1: Reset Hormonal Completo', 'Reinicie sistema endócrino em 7 dias. Regule insulina, cortisol, leptina e hormônios sexuais naturalmente.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-horm-f2', 'cat-equilibrio', 'saga-hormonal', 'Fase 2: Otimização Hormonal', 'Dias 8 a 14: Potencialize hormônios que queimam gordura e bloqueie hormônios que acumulam gordura.', '/img/capa.png', '', NULL, 2, 7, 1, '2026-03-17 11:51:02'),
('eb-horm-f3', 'cat-equilibrio', 'saga-hormonal', 'Fase 3: Equilíbrio Divino', 'Dias 15 a 21: Consolide equilíbrio hormonal permanente. Corpo que regula peso sozinho automaticamente.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-17 11:51:02'),
('eb-horm-bonus', 'cat-equilibrio', 'saga-hormonal', 'BÔNUS: Ervas Adaptógenas Faraônicas', 'Plantas que regulam sistema endócrino, combatem estresse e equilibram todos os hormônios do corpo.', '/img/capa.png', '', NULL, 4, 21, 1, '2026-03-17 11:51:02'),
('eb-int-f1', 'cat-equilibrio', 'saga-intestinal', 'Fase 1: Limpar o Templo Digestivo', 'Elimine inchaço abdominal em 7 dias. Limpe intestino, elimine gases e reduza até 3cm de cintura.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-int-f2', 'cat-equilibrio', 'saga-intestinal', 'Fase 2: Regenerar Flora Sagrada', 'Dias 8 a 14: Cultive bactérias boas, elimine ruins e construa flora que potencializa imunidade e emagrecimento.', '/img/capa.png', '', NULL, 2, 7, 1, '2026-03-17 11:51:02'),
('eb-int-f3', 'cat-equilibrio', 'saga-intestinal', 'Fase 3: Intestino de Pedra', 'Dias 15 a 21: Consolide intestino forte, regular e saudável que nunca mais dará problemas digestivos.', '/img/capa.png', '', NULL, 3, 14, 1, '2026-03-17 11:51:02'),
('eb-int-bonus', 'cat-equilibrio', 'saga-intestinal', 'BÔNUS: Prebióticos Milenares', 'Alimentos que alimentam bactérias boas, melhoram digestão e fortalecem sistema imunológico naturalmente.', '/img/capa.png', '', NULL, 4, 21, 1, '2026-03-17 11:51:02'),
('eb-bonus-1', 'cat-bonus', 'saga-bonus', 'EXTRA 1: Beleza de Dentro Pra Fora', 'Pele luminosa, cabelos fortes, unhas saudáveis. Nutrição que constrói beleza estrutural natural.', '/img/capa.png', '', NULL, 1, 0, 1, '2026-03-17 11:51:02'),
('eb-bonus-2', 'cat-bonus', 'saga-bonus', 'EXTRA 2: Longevidade Faraônica', 'Alimentos que desaceleram envelhecimento, protegem células e aumentam expectativa de vida saudável.', '/img/capa.png', '', NULL, 2, 0, 1, '2026-03-17 11:51:02'),
('eb-bonus-3', 'cat-bonus', 'saga-bonus', 'EXTRA 3: Clareza Mental dos Escribas', 'Nootrópicos naturais que aumentam foco, memória e capacidade cognitiva sem químicos.', '/img/capa.png', '', NULL, 3, 0, 1, '2026-03-17 11:51:02'),
('eb-bonus-4', 'cat-bonus', 'saga-bonus', 'EXTRA 4: Receituário Completo Faraônico', 'Mais de 100 receitas ancestrais completas para aplicar todos os protocolos da Dieta Milenar.', '/img/capa.png', '', NULL, 4, 0, 1, '2026-03-17 11:51:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `executions`
--

CREATE TABLE `executions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timeline_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_block_index` int(11) DEFAULT '0',
  `status` enum('running','finished','stopped') COLLATE utf8mb4_unicode_ci DEFAULT 'running',
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int(11) NOT NULL DEFAULT '1',
  `app_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Dieta Milenar',
  `primary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#D4AF37',
  `stripe_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pixel_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` text COLLATE utf8mb4_unicode_ci,
  `terms_of_use` text COLLATE utf8mb4_unicode_ci,
  `support_whatsapp` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '5511999999999',
  `support_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_video_url` text COLLATE utf8mb4_unicode_ci,
  `commission_rate` decimal(5,4) DEFAULT '0.5000',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `global_settings`
--

INSERT INTO `global_settings` (`id`, `app_name`, `primary_color`, `stripe_key`, `pixel_id`, `logo_url`, `terms_of_use`, `support_whatsapp`, `support_email`, `hero_video_url`, `commission_rate`, `updated_at`) VALUES
(1, 'Dieta Milenar', '#D4AF37', NULL, NULL, NULL, NULL, '5511999999999', 'suporte@dietasmilenares.com', NULL, 0.5000, '2026-03-11 22:27:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('commission','rejection','system') COLLATE utf8mb4_unicode_ci DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `affiliate_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_gateway_id` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','paid','refunded','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `plans`
--

CREATE TABLE `plans` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `period` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'único',
  `is_popular` tinyint(1) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `features` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `plans`
--

INSERT INTO `plans` (`id`, `name`, `price`, `old_price`, `period`, `is_popular`, `active`, `features`, `created_at`) VALUES
('plan-essential', 'Protocolo Essencial', 29.90, 297.90, 'único', 0, 1, '[\"Guia Completo da Dieta Milenar\", \"Lista de Alimentos Sagrados\", \"Protocolo de Desintoxicação de 7 dias\", \"Acesso vitalício à plataforma\", \"Suporte via comunidade\"]', '2026-03-11 22:27:02'),
('plan-imperial', 'Protocolo Imperial', 147.00, 297.00, 'único', 1, 1, '[\"Tudo do Protocolo Essencial\", \"Receitas Milenares Exclusivas\", \"Guia de Chás e Elixires Egípcios\", \"Protocolo de Jejum Intermitente Sagrado\", \"Bônus: Mentalidade de Aço\", \"Acesso Prioritário ao Suporte\"]', '2026-03-11 22:27:02'),
('plan-divine', 'Protocolo Divino', 197.00, 598.00, 'único', 0, 1, '[\"Tudo do Protocolo Imperial\", \"Mentoria Mensal em Grupo\", \"Análise de Papiro Nutricional\", \"Acesso a Eventos Presenciais\", \"Certificado de Mestre da Longevidade\"]', '2026-03-11 22:27:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `products`
--

CREATE TABLE `products` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `offer_price` decimal(10,2) DEFAULT NULL,
  `cover_image` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) DEFAULT '1',
  `drip_enabled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_link` text COLLATE utf8mb4_unicode_ci,
  `pix_key` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pix_key_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `offer_price`, `cover_image`, `active`, `drip_enabled`, `created_at`, `payment_link`, `pix_key`, `pix_key_type`) VALUES
('fac9d7ec-fd02-46a3-9099-d0176d133616', 'Membro VIP - Mensal', 'teste', 'Teste descrição', 29.90, 99.90, '/img/capa.png', 1, 1, '2026-03-13 19:09:54', 'https://pay.infinitepay.io/Ri0x-IU1vzEVMn-29,90', '', 'random'),
('2c220545-8681-4002-b4ad-b70203f99c9f', 'Fjvc', '', 'Fhhh', 80.00, 880.00, '/img/capa.png', 0, 0, '2026-03-14 14:47:20', 'Google.com', '', 'random');

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_chapters`
--

CREATE TABLE `product_chapters` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_modules`
--

CREATE TABLE `product_modules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int(11) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reseller_requests`
--

CREATE TABLE `reseller_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `reseller_requests`
--

INSERT INTO `reseller_requests` (`id`, `user_id`, `name`, `email`, `phone`, `status`, `created_at`) VALUES
('f65f03c6-b4c2-4373-be47-50cc053280b3', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Membro - Sistema', 'Membro@admin.com', NULL, 'approved', '2026-03-16 22:59:07');

-- --------------------------------------------------------

--
-- Estrutura para tabela `subcategories`
--

CREATE TABLE `subcategories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `drip_days` int(11) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `description`, `sort_order`, `drip_days`, `active`) VALUES
('saga-detox', 'cat-fundacao', 'SAGA DETOX - A Purificação dos Templos Sagrados', 'A trilogia fundadora. Limpe fígado, intestino e rins para despertar o poder de queima de gordura do seu organismo.', 1, 0, 1),
('saga-energia', 'cat-vitalidade', 'SAGA ENERGIA - O Poder Vital dos Sacerdotes', 'Depois de limpar, restaure energia, disposição e vitalidade para dar continuidade na transformação corporal sem cansaço.', 1, 0, 1),
('saga-metabolismo', 'cat-queima', 'SAGA METABOLISMO - O Fogo Digestivo dos Guerreiros Núbios', 'Acelere seu metabolismo em até 40% e transforme seu corpo em uma máquina de queimar gordura 24 horas por dia.', 1, 0, 1),
('saga-definicao', 'cat-queima', 'SAGA DEFINIÇÃO - A Dieta do Abdômen Faraônico', 'Destrua a pochete, seque a barriga e esculpa um abdômen definido usando apenas alimentação estratégica ancestral.', 2, 0, 1),
('saga-localizada', 'cat-queima', 'SAGA GORDURA LOCALIZADA - Queima Estratégica Faraônica', 'Ataque gordura teimosa em regiões específicas: coxas, braços, costas e culotes. Queima direcionada e eficaz.', 3, 0, 1),
('saga-forca', 'cat-musculo', 'SAGA FORÇA - Músculos de Guerreiro sem Academia', 'Ganhe força real e músculos densos com os alimentos que os construtores das pirâmides consumiam.', 1, 0, 1),
('saga-hipertrofia', 'cat-musculo', 'SAGA HIPERTROFIA - Massa Magra dos Faraós', 'Protocolo completo para ganhar massa muscular magra naturalmente, sem whey, sem creatina, apenas comida ancestral.', 2, 0, 1),
('saga-hormonal', 'cat-equilibrio', 'SAGA HORMONAL - O Equilíbrio dos Deuses', 'Regule hormônios naturalmente. Testosterona, cortisol, insulina e hormônios femininos que controlam acúmulo de gordura.', 1, 0, 1),
('saga-intestinal', 'cat-equilibrio', 'SAGA INTESTINAL - O Protocolo da Barriga Desinchada', 'Intestino inflamado = barriga inchada e gordura que não sai. Regenere flora, elimine inchaço e destrave emagrecimento.', 2, 0, 1),
('saga-bonus', 'cat-bonus', 'BÔNUS EXTRAS - Sabedoria Complementar', 'Materiais complementares: beleza de dentro pra fora, longevidade, clareza mental e outros conhecimentos ancestrais.', 1, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `timelines`
--

CREATE TABLE `timelines` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bot_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `page_route` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trigger_type` enum('onLoad','onScroll','onExitIntent','manual') COLLATE utf8mb4_unicode_ci DEFAULT 'manual'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timeline_blocks`
--

CREATE TABLE `timeline_blocks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timeline_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bot_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('objection','proof','result','question','urgency') COLLATE utf8mb4_unicode_ci DEFAULT 'result',
  `script` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `delay_ms` int(11) DEFAULT '1000',
  `typing_time_ms` int(11) DEFAULT '2000',
  `random_variations` json DEFAULT NULL,
  `condition_type` enum('scroll','time','exit','click','manual') COLLATE utf8mb4_unicode_ci DEFAULT 'time',
  `condition_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int(11) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('VISITANTE','MEMBRO','VIP','REVENDA','ADMIN') COLLATE utf8mb4_unicode_ci DEFAULT 'VISITANTE',
  `status` enum('active','blocked','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `referral_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referred_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wallet_balance` decimal(12,2) DEFAULT '0.00',
  `pix_key` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pix_key_type` enum('cpf','email','phone','random') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `referral_code`, `referred_by`, `wallet_balance`, `pix_key`, `pix_key_type`, `created_at`) VALUES
('admin-default-001', 'Admin Faraó', 'admin@dietasmilenares.com', 'admin123', 'ADMIN', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-11 22:27:02'),
('904c0d9f-6961-4975-bf73-a115f6b43605', 'Membro - Sistema', 'Membro@admin.com', '123456', 'REVENDA', 'active', 'REFU6HF33', NULL, 0.00, NULL, NULL, '2026-03-12 00:04:23'),
('489d27ce-f0f4-4408-bb6f-077cb9555549', 'Visitante - Sistema', 'visitante@admin.com', '123456', 'VISITANTE', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 10:38:52'),
('d7a13929-427d-4be2-a8c8-f864e34bbfff', 'Membro VIP - Sistema', 'membrovip@admin.com', '123456', 'VIP', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 13:02:48'),
('280f726b-f8e4-41ff-875b-1a3275fe1fc4', 'Revenda - Sistema', 'revenda@admin.com', '123456', 'REVENDA', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 13:04:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('masculino','feminino','outro') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` tinyint(3) UNSIGNED DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` smallint(5) UNSIGNED DEFAULT NULL,
  `activity_level` enum('sedentario','leve','moderado','intenso') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goal` enum('perda','ganho','saude','energia') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `restrictions` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `phone`, `gender`, `age`, `weight`, `height`, `activity_level`, `goal`, `restrictions`, `created_at`, `updated_at`) VALUES
('6345d430-1739-11f1-88ec-b6a721b01145', '2115baaa-0aca-4a9a-bc2c-3843213d4801', '11919211370', 'masculino', 36, 110.00, 186, 'leve', 'perda', 'Tijolos', '2026-03-03 19:44:27', '2026-03-03 19:44:27'),
('cbfd933d-2178-11f1-88ec-b6a721b01145', 'f2cf4956-60e1-4f5d-bb49-a1395fe28cff', '9999999999', 'outro', 35, 120.00, 185, 'intenso', 'energia', 'Ovo', '2026-03-16 20:43:32', '2026-03-16 21:08:35');

-- --------------------------------------------------------

--
-- Estrutura para tabela `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pix_key` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('requested','approved','paid','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'requested',
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `affiliate_clicks`
--
ALTER TABLE `affiliate_clicks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_id` (`affiliate_id`);

--
-- Índices de tabela `bonuses`
--
ALTER TABLE `bonuses`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `bonus_categories`
--
ALTER TABLE `bonus_categories`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `bonus_items`
--
ALTER TABLE `bonus_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bonus_category_id` (`bonus_category_id`);

--
-- Índices de tabela `bots`
--
ALTER TABLE `bots`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_id` (`affiliate_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Índices de tabela `ebooks`
--
ALTER TABLE `ebooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `subcategory_id` (`subcategory_id`);

--
-- Índices de tabela `executions`
--
ALTER TABLE `executions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timeline_id` (`timeline_id`);

--
-- Índices de tabela `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `affiliate_id` (`affiliate_id`);

--
-- Índices de tabela `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices de tabela `product_chapters`
--
ALTER TABLE `product_chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`);

--
-- Índices de tabela `product_modules`
--
ALTER TABLE `product_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Índices de tabela `reseller_requests`
--
ALTER TABLE `reseller_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`);

--
-- Índices de tabela `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Índices de tabela `timelines`
--
ALTER TABLE `timelines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `bot_id` (`bot_id`);

--
-- Índices de tabela `timeline_blocks`
--
ALTER TABLE `timeline_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timeline_id` (`timeline_id`),
  ADD KEY `bot_id` (`bot_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD KEY `referred_by` (`referred_by`);

--
-- Índices de tabela `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Índices de tabela `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
