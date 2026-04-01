-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 01/04/2026 às 01:01
-- Versão do servidor: 8.0.45-0ubuntu0.24.04.1
-- Versão do PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `dieta_milenar`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `affiliate_clicks`
--

CREATE TABLE `affiliate_clicks` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliate_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `landing_page` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bonuses`
--

CREATE TABLE `bonuses` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `download_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `target_audience` enum('MEMBRO','REVENDA','VIP','ADMIN','VISITANTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MEMBRO',
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
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `is_mandatory` tinyint(1) DEFAULT '0',
  `drip_days` int DEFAULT '0',
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
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bonus_category_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `download_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `drip_days` int DEFAULT '0',
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
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `persona` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `region` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_mandatory` tinyint(1) DEFAULT '0',
  `drip_days` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `cover_image`, `sort_order`, `is_mandatory`, `drip_days`, `active`) VALUES
('cat-fundacao', 'Fundação', 'A base obrigatória de toda transformação. Antes de queimar gordura, você precisa limpar o organismo.', NULL, 1, 1, 0, 1),
('cat-vitalidade', 'Vitalidade', 'Depois de limpar, você precisa restaurar energia para dar continuidade na transformação corporal.', '/e-books/file_0000000084f4720ea1bc549211931d2d.png.pdf', 2, 0, 0, 1),
('cat-queima', 'Queima de Gordura', 'Protocolos ancestrais para eliminar gordura corporal, secar barriga e definir o corpo.', '/e-books/file_000000002340720ea3f7ca2e54240452.png.pdf', 3, 0, 0, 1),
('cat-musculo', 'Construção Muscular', 'Ganhe massa magra, força e músculos definidos usando apenas alimentos naturais.', '/e-books/file_0000000084e8720ea46f7ebfda0c35e3.png.pdf', 4, 0, 0, 1),
('cat-equilibrio', 'Equilíbrio Interno', 'Hormônios e intestino: os dois fatores internos que mais impactam emagrecimento e definição.', '/e-books/file_00000000e3c0720e85b050f86952566c.png.pdf', 5, 0, 0, 1),
('cat-bonus', 'Bônus Complementares', 'Materiais extras que complementam sua jornada: beleza natural, longevidade e mais.', NULL, 6, 0, 0, 1),
('83419602-e17e-4133-82de-af74306e699e', 'EMAGRECIMENTO SOBERANO', 'Sistema de emagrecimento soberano', NULL, 7, 0, 0, 1),
('a9d57858-c46e-4db3-9ebf-b28faa4c9b67', 'Valentim', 'Sou lindo.', NULL, 1, 1, 0, 1),
('dca693f4-a924-46e4-9f37-d0c950afb132', 'Teste', 'Teste', NULL, 9, 0, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `commissions`
--

CREATE TABLE `commissions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliate_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected','paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `release_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ebooks`
--

CREATE TABLE `ebooks` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategory_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `download_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `drip_days` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `ebooks`
--

INSERT INTO `ebooks` (`id`, `category_id`, `subcategory_id`, `title`, `description`, `cover_image`, `content`, `download_url`, `sort_order`, `drip_days`, `active`, `created_at`) VALUES
('eb-detox-f1', 'cat-fundacao', 'saga-detox', 'Fase 1: Despertar do Organismo', 'Os primeiros 7 dias de limpeza profunda. Elimine toxinas superficiais, reduza inchaço e prepare o corpo para queimar gordura.', '/img/capa.png', '', '/e-books/Fundacao/HTML_E-BOOKS/___Saga_Detox___Editor_EBOOK.html', 1, 0, 1, '2026-03-17 11:51:02'),
('eb-detox-f2', 'cat-fundacao', 'saga-detox', 'Fase 2: Purificação Profunda', 'Dias 8 a 14: Limpe o fígado em profundidade, acelere queima de gordura e regenere órgãos de eliminação.', '/img/capa.png', '', '/e-books/Fundacao/HTML_E-BOOKS/___Saga_Detox___Fase_2__Purificação_Profunda_EBOOK.html', 2, 7, 1, '2026-03-17 11:51:02'),
('eb-detox-f3', 'cat-fundacao', 'saga-detox', 'Fase 3: Renascimento Celular', 'Dias 15 a 21: Consolide resultados, regenere células e sele a transformação. Organismo pronto para próximas jornadas.', '/img/capa.png', '', '/e-books/Fundacao/HTML_E-BOOKS/___Saga_Detox___Fase_3__Renascimento_Celular_EBOOK.html', 3, 14, 1, '2026-03-17 11:51:02'),
('eb-detox-bonus', 'cat-fundacao', 'saga-detox', 'BÔNUS: Águas Medicinais dos Faraós', 'Receitas exclusivas de águas detox, infusões e elixires que os faraós consumiam para manter corpo puro.', '/img/capa.png', '', '/e-books/Fundacao/HTML_E-BOOKS/___Saga_Detox___BÔNUS__Águas_Medicinais_dos_Faraós_EBOOK.html', 4, 21, 1, '2026-03-17 11:51:02'),
('eb-energia-f1', 'cat-vitalidade', 'saga-energia', 'Fase 1: Despertar Força Interior', 'Elimine fadiga pós-detox em 7 dias. Restaure energia mitocondrial e vitalidade celular para continuar firme.', '/img/capa.png', '', '/e-books/ Energia/HTML_E-BOOKS/___Saga_Energia___Editor_EBOOK.html', 1, 0, 1, '2026-03-17 11:51:02'),
('eb-energia-f2', 'cat-vitalidade', 'saga-energia', 'Fase 2: Energia Inabalável', 'Dias 8 a 14: Construa energia sustentada o dia todo. Disposição para treinar, trabalhar e viver intensamente.', '/img/capa.png', '', '/e-books/ Energia/HTML_E-BOOKS/___Saga_Energia___Editor_EBOOK.html', 2, 7, 1, '2026-03-17 11:51:02'),
('eb-energia-f3', 'cat-vitalidade', 'saga-energia', 'Fase 3: Resistência Divina', 'Dias 15 a 21: Consolide resistência física e mental. Energia dos sacerdotes que trabalhavam 12 horas sob sol.', '/img/capa.png', '', '/e-books/ Energia/HTML_E-BOOKS/___Saga_Energia___Editor_EBOOK.html', 3, 14, 1, '2026-03-17 11:51:02'),
('eb-energia-bonus', 'cat-vitalidade', 'saga-energia', 'BÔNUS: Tônicos Energéticos Milenares', 'Bebidas que aumentam energia instantânea, foco prolongado e resistência sem cafeína ou estimulantes artificiais.', '/img/capa.png', '', '/e-books/ Energia/HTML_E-BOOKS/___Saga_Energia___Editor_EBOOK.html', 4, 21, 1, '2026-03-17 11:51:02'),
('eb-meta-f1', 'cat-queima', 'saga-metabolismo', 'Fase 1: Acender a Chama Metabólica', 'Desperte metabolismo adormecido em 7 dias. Termogênicos naturais que aumentam queima de calorias em até 20%.', '/img/capa.png', '', '/e-books/Metabolismo/HTML_E-BOOKS/___Saga_Metabolismo_Fase1_Acender_Chama_Metabolica___Editor_EBOOK.html', 1, 0, 1, '2026-03-17 11:51:02'),
('eb-meta-f2', 'cat-queima', 'saga-metabolismo', 'Fase 2: Acelerar a Fornalha Interna', 'Dias 8 a 14: Potencialize queima com alimentos que transformam corpo em máquina de emagrecer 24h por dia.', '/img/capa.png', '', '/e-books/Metabolismo/HTML_E-BOOKS/___Saga_Metabolismo_Fase2_Acelerar_Fornalha_Interna___Editor_EBOOK.html', 2, 7, 1, '2026-03-17 11:51:02'),
('eb-meta-f3', 'cat-queima', 'saga-metabolismo', 'Fase 3: Metabolismo Imparável', 'Dias 15 a 21: Consolide metabolismo rápido permanente. Você nunca mais voltará ao metabolismo lento.', '/img/capa.png', '', '/e-books/Metabolismo/HTML_E-BOOKS/___Saga_Metabolismo_Fase3_Metabolismo_Imparavel___Editor_EBOOK.html', 3, 14, 1, '2026-03-17 11:51:02'),
('eb-meta-bonus', 'cat-queima', 'saga-metabolismo', 'BÔNUS: Chás Termogênicos Ancestrais', 'Receitas secretas de chás que aceleram metabolismo, queimam gordura e dão energia sustentada.', '/img/capa.png', '', '/e-books/Metabolismo/HTML_E-BOOKS/___Saga_Metabolismo_BONUS_Chas_Termogenicos_Ancestrais___Editor_EBOOK.html', 4, 21, 1, '2026-03-17 11:51:02'),
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
('eb-bonus-4', 'cat-bonus', 'saga-bonus', 'EXTRA 4: Receituário Completo Faraônico', 'Mais de 100 receitas ancestrais completas para aplicar todos os protocolos da Dieta Milenar.', '/img/capa.png', '', NULL, 4, 0, 1, '2026-03-17 11:51:02'),
('d3eb25b2-f8a5-4f03-bd44-a74ebbe1800e', 'a9d57858-c46e-4db3-9ebf-b28faa4c9b67', '0.9296745695681038', 'Lindão ', 'Quero ficar mais lindo.', '/img/capa.png', 'Conteúdo HTML', NULL, 1, 0, 1, '2026-03-29 05:28:24');

-- --------------------------------------------------------

--
-- Estrutura para tabela `executions`
--

CREATE TABLE `executions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timeline_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_block_index` int DEFAULT '0',
  `status` enum('running','finished','stopped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'running',
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int NOT NULL DEFAULT '1',
  `app_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Dieta Milenar',
  `primary_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#D4AF37',
  `stripe_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pixel_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `terms_of_use` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `support_whatsapp` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '5511999999999',
  `support_email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_video_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `commission_rate` decimal(5,4) DEFAULT '0.5000',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pix_key` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pix_key_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `global_settings`
--

INSERT INTO `global_settings` (`id`, `app_name`, `primary_color`, `stripe_key`, `pixel_id`, `logo_url`, `terms_of_use`, `support_whatsapp`, `support_email`, `hero_video_url`, `commission_rate`, `updated_at`, `pix_key`, `pix_key_type`) VALUES
(1, 'Dieta Milenar', '#D4AF37', 'admin12', 'admin@dietasmilenares.com', NULL, NULL, '5511999999999', 'suporte@dietasmilenares.com', NULL, 0.5000, '2026-03-23 16:30:57', '(99) 99999-9999', 'phone');

-- --------------------------------------------------------

--
-- Estrutura para tabela `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('commission','rejection','system','proof') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `type`, `is_read`, `created_at`) VALUES
('dd74f36b-c9de-4d97-b20a-41c4b7b0c97f', 'd7a13929-427d-4be2-a8c8-f864e34bbfff', 'Seu comprovante de pagamento foi recusado. Motivo: Não informado', 'rejection', 0, '2026-03-24 01:16:01'),
('07f99736-b3c5-4af8-98c1-5a7720267697', '47de8866-a1d5-4185-8aaa-35251be5ad5a', 'Seu comprovante de pagamento foi recusado. Motivo: Não informado', 'rejection', 1, '2026-03-24 02:04:54'),
('a91beb78-5817-443a-af6f-3f0db991bd08', 'admin-default-001', 'Comprovante recebido!\n\nNome: Marcos Silva\nE-mail: marcossilva@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-24 02:05:46'),
('aeb4cb51-072c-4d68-af9c-5b50fd083ee1', 'admin-default-001', 'Comprovante recebido!\n\nNome: Marcos Silva\nE-mail: marcossilva@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-24 02:30:00'),
('03641d96-92f5-4263-bc30-4bb277a5e54b', '47de8866-a1d5-4185-8aaa-35251be5ad5a', 'Seu comprovante de pagamento foi recusado. Motivo: Teste 123', 'rejection', 1, '2026-03-24 02:30:35'),
('cd37fe9c-5ea8-4a31-94ef-0f90b17454b4', 'admin-default-001', 'Comprovante recebido!\n\nNome: Marcos Silva\nE-mail: marcossilva@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-24 02:49:54'),
('e71b67e4-b072-4fed-8709-3a010d481e06', '47de8866-a1d5-4185-8aaa-35251be5ad5a', '🏆 Bem-vindo à Ordem dos Iniciados, Faraó!\n\nSeu acesso ao Protocolo Essencial foi confirmado e seu portal está aberto.\n\nVocê acaba de dar o primeiro passo de uma jornada que poucos têm a coragem de iniciar. A Dieta Milenar não é apenas um método — é um sistema ancestral de transformação que atravessou séculos para chegar até você.\n\n✨ O que espera por você agora:\n• Protocolos exclusivos usados por sacerdotes e guerreiros do Egito Antigo\n• Acesso completo à biblioteca de e-books e sagas de conhecimento\n• Uma comunidade de pessoas que escolheram a transformação real\n\nA transformação começa hoje. O seu corpo tem memória ancestral — e agora você vai despertá-la.\n\nSeja bem-vindo ao seu novo capítulo. 🌟', 'system', 1, '2026-03-24 02:50:49'),
('95ccad86-ed8f-4154-95d2-26732cdf84a3', 'admin-default-001', 'Comprovante recebido!\n\nNome: Marcos Silva\nE-mail: marcossilva@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-24 03:53:02'),
('32afd77e-890e-4433-91ca-0861c0203d33', '47de8866-a1d5-4185-8aaa-35251be5ad5a', 'Seu comprovante de pagamento foi recusado. Motivo: Teste', 'rejection', 1, '2026-03-24 03:53:54'),
('4b4c0977-4eb6-4207-9440-d27e38089796', 'admin-default-001', 'Comprovante recebido!\n\nNome: Marcos Silva\nE-mail: marcossilva@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-24 03:54:34'),
('066f1bc9-e78b-427b-9b3b-82f9c4ad5597', '47de8866-a1d5-4185-8aaa-35251be5ad5a', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 1, '2026-03-24 03:54:57'),
('38ce4abf-87e5-4241-a8b6-85d1a4c4c730', 'admin-default-001', 'Comprovante recebido!\n\nNome: Marcos Silva\nE-mail: marcossilva@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-24 03:56:23'),
('36ef49a2-f8ee-4866-8289-2028c11ee8e9', '47de8866-a1d5-4185-8aaa-35251be5ad5a', '🏆 Bem-vindo à Ordem dos Iniciados, Faraó!\n\nSeu acesso ao Protocolo Essencial foi confirmado e seu portal está aberto.\n\nVocê acaba de dar o primeiro passo de uma jornada que poucos têm a coragem de iniciar. A Dieta Milenar não é apenas um método — é um sistema ancestral de transformação que atravessou séculos para chegar até você.\n\n✨ O que espera por você agora:\n• Protocolos exclusivos usados por sacerdotes e guerreiros do Egito Antigo\n• Acesso completo à biblioteca de e-books e sagas de conhecimento\n• Uma comunidade de pessoas que escolheram a transformação real\n\nA transformação começa hoje. O seu corpo tem memória ancestral — e agora você vai despertá-la.\n\nSeja bem-vindo ao seu novo capítulo. 🌟', 'system', 1, '2026-03-24 03:56:44'),
('a9da394f-021f-4b61-a2ed-dd4bbd6fd476', 'admin-default-001', 'Comprovante recebido!\n\nNome:  conta membro de teste\nE-mail: Membroteste@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-27 02:50:05'),
('f7ca1c75-3117-4bed-8c5f-263f1d7d8f5a', 'd5102e09-4041-4dce-b0b7-9594946b39eb', 'Seu comprovante de pagamento foi recusado. Motivo: Teste', 'rejection', 1, '2026-03-27 03:01:36'),
('1c5ff5ae-275f-43d5-8f5a-2231c9e52f5f', 'admin-default-001', 'Comprovante recebido!\n\nNome:  conta membro de teste\nE-mail: Membroteste@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-27 03:06:29'),
('513df080-59ea-4d15-b10a-c97fc8592d60', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome:  conta membro de teste\nE-mail: Membroteste@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-27 03:06:29'),
('3f767e88-7ba2-4dc4-aed1-dff9ca7f054b', 'd5102e09-4041-4dce-b0b7-9594946b39eb', '🏆 Bem-vindo à Ordem dos Iniciados, Faraó!\n\nSeu acesso ao Protocolo Essencial foi confirmado e seu portal está aberto.\n\nVocê acaba de dar o primeiro passo de uma jornada que poucos têm a coragem de iniciar. A Dieta Milenar não é apenas um método — é um sistema ancestral de transformação que atravessou séculos para chegar até você.\n\n✨ O que espera por você agora:\n• Protocolos exclusivos usados por sacerdotes e guerreiros do Egito Antigo\n• Acesso completo à biblioteca de e-books e sagas de conhecimento\n• Uma comunidade de pessoas que escolheram a transformação real\n\nA transformação começa hoje. O seu corpo tem memória ancestral — e agora você vai despertá-la.\n\nSeja bem-vindo ao seu novo capítulo. 🌟', 'system', 1, '2026-03-27 03:06:55'),
('7dbdbb55-6596-4470-a862-434a7fac0d09', 'admin-default-001', 'Comprovante recebido!\n\nNome:  conta membro de teste\nE-mail: Membroteste@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-28 22:15:13'),
('d4ba860c-746d-43f3-804d-4a0c17f23cb1', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome:  conta membro de teste\nE-mail: Membroteste@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-28 22:15:13'),
('8adc171d-5acf-4591-be31-ac34cf4ab691', 'admin-default-001', 'Comprovante recebido!\n\nNome: João Batista \nE-mail: tirulipa@bol.com\nWhatsapp: 32985648965\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-29 04:31:59'),
('89ecb570-3f08-4cae-a583-ef9915485241', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: João Batista \nE-mail: tirulipa@bol.com\nWhatsapp: 32985648965\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-29 04:31:59'),
('2c5879f1-a50b-418a-b4e8-151ed6eb603e', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', 'Seu comprovante de pagamento foi recusado. Motivo: Olá tudo bem?', 'rejection', 1, '2026-03-29 04:57:32'),
('a8d74b72-5424-489b-9e2b-a8fb25b966de', 'admin-default-001', 'Comprovante recebido!\n\nNome: João Batista \nE-mail: tirulipa@bol.com\nWhatsapp: 32985648965\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-29 04:59:05'),
('47f4de9f-7222-4911-93e8-42237b12421f', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: João Batista \nE-mail: tirulipa@bol.com\nWhatsapp: 32985648965\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-29 04:59:05'),
('1fe40e87-3460-4f9e-979b-75c8dd4fdc02', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', '🏆 Bem-vindo à Ordem dos Iniciados, Faraó!\n\nSeu acesso ao Protocolo Essencial foi confirmado e seu portal está aberto.\n\nVocê acaba de dar o primeiro passo de uma jornada que poucos têm a coragem de iniciar. A Dieta Milenar não é apenas um método — é um sistema ancestral de transformação que atravessou séculos para chegar até você.\n\n✨ O que espera por você agora:\n• Protocolos exclusivos usados por sacerdotes e guerreiros do Egito Antigo\n• Acesso completo à biblioteca de e-books e sagas de conhecimento\n• Uma comunidade de pessoas que escolheram a transformação real\n\nA transformação começa hoje. O seu corpo tem memória ancestral — e agora você vai despertá-la.\n\nSeja bem-vindo ao seu novo capítulo. 🌟', 'system', 1, '2026-03-29 05:00:12'),
('24f41236-c364-4f4a-ac4b-69ff8ec712ea', 'admin-default-001', 'Comprovante recebido!\n\nNome: João Batista \nE-mail: tirulipa@bol.com\nWhatsapp: 32985648965\n\nAdquiriu o \"Membro VIP - Mensal\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-29 05:07:42'),
('55da57e2-1e97-46c7-aac3-b377738c7888', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: João Batista \nE-mail: tirulipa@bol.com\nWhatsapp: 32985648965\n\nAdquiriu o \"Membro VIP - Mensal\"\nValor de: R$ 29,90', 'proof', 0, '2026-03-29 05:07:42'),
('d0d28954-dfdd-4429-8de8-94d8ad56cfb9', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-03-29 14:47:37'),
('c9b839c2-e7f1-462b-af70-8fc888ab31cf', 'admin-default-001', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:09:46'),
('4d37a511-99f1-4620-aecb-dc2662ef500e', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:09:46'),
('aaa832b0-9ade-4682-aa65-efb27aef51bb', 'admin-default-001', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Membro VIP - Mensal\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:10:37'),
('7abb29aa-5617-4d53-bb46-6ba66d3e0c37', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Membro VIP - Mensal\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:10:37'),
('a07671ac-5a79-4775-bdf1-689646951371', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-04-01 00:11:13'),
('ca98113a-fba9-42f5-af2f-05c1716701e2', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-04-01 00:11:20'),
('27bbc6f1-b4a9-4fbc-9e04-325f7987864d', 'admin-default-001', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Membro VIP - Mensal\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:23:50'),
('aaff0d6a-bba8-417b-bda1-9935e6c7ef48', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Membro VIP - Mensal\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:23:50'),
('3df605f1-1434-4358-ae27-7b126bc79ee1', 'admin-default-001', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:24:09'),
('4cb2611b-fc68-40d0-bc1e-eb2608d2f8f6', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Comprovante recebido!\n\nNome: Membro - Sistema\nE-mail: Membro@admin.com\nWhatsapp: Não informado\n\nAdquiriu o \"Protocolo Essencial\"\nValor de: R$ 29,90', 'proof', 0, '2026-04-01 00:24:09'),
('47246b57-10da-4d12-a988-fabb6e643b4f', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-04-01 00:24:40'),
('135ff9d8-b057-4b1a-a6e8-1ecb3cdaea35', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-04-01 00:31:54'),
('2d31ccd6-57b2-4300-b3f3-2c92b4e8bb64', '904c0d9f-6961-4975-bf73-a115f6b43605', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-04-01 00:31:58'),
('1ecee6ee-ee48-42ab-acb7-620bd4e8874e', 'd5102e09-4041-4dce-b0b7-9594946b39eb', 'Seu comprovante de pagamento foi recusado. Por favor, verifique o valor e a legibilidade do comprovante e envie novamente.', 'rejection', 0, '2026-04-01 00:32:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `affiliate_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_gateway_id` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','paid','refunded','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `proof_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `product_id`, `affiliate_id`, `plan_name`, `total_amount`, `payment_gateway_id`, `status`, `created_at`, `proof_url`, `rejection_reason`, `product_name`) VALUES
('407f7708-3078-47e7-b501-971cb153be04', 'd7a13929-427d-4be2-a8c8-f864e34bbfff', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-23 21:45:57', NULL, NULL, NULL),
('01506d7c-cb88-4f56-b6a4-a785ea5e41e8', '6b272a43-d14f-4fa7-8279-02c105b2ed20', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'paid', '2026-03-23 21:56:51', NULL, NULL, NULL),
('6933a386-8813-45c8-9797-6442085dffa5', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-24 01:33:42', NULL, NULL, NULL),
('5453cdd1-b6db-4449-a90d-41344ef65c9a', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'paid', '2026-03-24 02:05:46', '/proofs/proof_1774317946640_y6rzn64s68.png', NULL, NULL),
('0a222148-595f-4316-b695-febedb2109ff', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-24 02:30:00', '/proofs/proof_1774319400558_6nurqlrberh.jpg', 'Teste 123', NULL),
('be3883fb-b29b-4ab2-8d41-1ef6384c4a4c', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'paid', '2026-03-24 02:49:54', '/proofs/proof_1774320594508_yrt5ahgv2zg.jpg', NULL, NULL),
('af69c6b3-7a36-45e9-aeea-467f46e76502', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-24 03:53:02', '/proofs/proof_1774324382426_iefqvwjutwm.jpg', 'Teste', NULL),
('cc011aa9-146c-42fb-9681-0398c6f727f4', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-24 03:54:34', '/proofs/proof_1774324473916_gh27amo60ms.png', NULL, NULL),
('4591ada9-3392-4c4b-9db4-25ff4106b5d4', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'paid', '2026-03-24 03:56:23', '/proofs/proof_1774324583633_7cq6wuu2zgg.png', NULL, NULL),
('75dc5d09-07ab-4eb4-9573-099ce4f7fdd2', 'd5102e09-4041-4dce-b0b7-9594946b39eb', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-27 02:50:05', '/proofs/proof_1774579803199_v4whu22m199.png', 'Teste', NULL),
('7c2290d4-d2ca-4bca-9fa7-e92adf1f9d45', 'd5102e09-4041-4dce-b0b7-9594946b39eb', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'paid', '2026-03-27 03:06:29', '/proofs/proof_1774580787264_8lcs8jbx94k.png', NULL, NULL),
('3a0d6177-d71e-48de-9065-690bf23121db', 'd5102e09-4041-4dce-b0b7-9594946b39eb', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-28 22:15:13', '/proofs/proof_1774736112131_i96b332s2ej.jpg', NULL, NULL),
('8dfbc84a-fb75-47af-ab7b-5288826487fc', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-03-29 04:31:59', '/proofs/proof_1774758719666_ilbwngkwkvh.jpg', 'Olá tudo bem?', NULL),
('827131f9-5e25-48fa-aa84-760ac91206e7', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'paid', '2026-03-29 04:59:05', '/proofs/proof_1774760345693_vczfolg4vq8.jpg', NULL, NULL),
('8c744b66-75ad-4618-8835-520718c15791', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', 'fac9d7ec-fd02-46a3-9099-d0176d133616', NULL, 'Membro VIP - Mensal', 29.90, NULL, 'cancelled', '2026-03-29 05:07:42', '/proofs/proof_1774760862197_s050y4xtjua.pdf', NULL, 'Membro VIP - Mensal'),
('19de7991-5a4b-460e-b3d1-d6fba7934136', '904c0d9f-6961-4975-bf73-a115f6b43605', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-04-01 00:09:46', '/proofs/proof_1775002186649_babnntfa9jg.gif', NULL, NULL),
('fee7e3c4-1bed-4db2-9f52-94c34a5d2a90', '904c0d9f-6961-4975-bf73-a115f6b43605', 'fac9d7ec-fd02-46a3-9099-d0176d133616', NULL, 'Membro VIP - Mensal', 29.90, NULL, 'cancelled', '2026-04-01 00:10:37', '/proofs/proof_1775002237113_uh03j7xvg7.png', NULL, 'Membro VIP - Mensal'),
('de0692de-c1a8-40fd-83b9-0962556da9dc', '904c0d9f-6961-4975-bf73-a115f6b43605', 'fac9d7ec-fd02-46a3-9099-d0176d133616', NULL, 'Membro VIP - Mensal', 29.90, NULL, 'cancelled', '2026-04-01 00:23:50', '/proofs/proof_1775003030201_1zlsk3xze0x.png', NULL, 'Membro VIP - Mensal'),
('39d97630-14ab-435b-8629-831faaba2ba6', '904c0d9f-6961-4975-bf73-a115f6b43605', NULL, NULL, 'Protocolo Essencial', 29.90, NULL, 'cancelled', '2026-04-01 00:24:09', '/proofs/proof_1775003049020_qix44squf7.png', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `plans`
--

CREATE TABLE `plans` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `period` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'único',
  `is_popular` tinyint(1) DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `features` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `checkout_url` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `plans`
--

INSERT INTO `plans` (`id`, `name`, `price`, `old_price`, `period`, `is_popular`, `active`, `features`, `created_at`, `checkout_url`, `payment_link`) VALUES
('plan-essential', 'Protocolo Essencial', 29.90, 297.90, 'único', 1, 1, '[\"Guia Completo da Dieta Milenar\", \"Lista de Alimentos Sagrados\", \"Protocolo de Desintoxicação de 7 dias\", \"Acesso vitalício à plataforma\", \"Suporte via comunidade\"]', '2026-03-11 22:27:02', 'https://pay.infinitepay.io/Ri0x-IU1vzEVMn-29,90', 'https://pay.infinitepay.io/Ri0x-IU1vzEVMn-29,90'),
('plan-imperial', 'Protocolo Imperial', 147.00, 297.00, 'único', 0, 1, '[\"Tudo do Protocolo Essencial\", \"Receitas Milenares Exclusivas\", \"Guia de Chás e Elixires Egípcios\", \"Protocolo de Jejum Intermitente Sagrado\", \"Bônus: Mentalidade de Aço\", \"Acesso Prioritário ao Suporte\"]', '2026-03-11 22:27:02', NULL, ''),
('plan-divine', 'Protocolo Divino', 197.00, 598.00, 'único', 0, 1, '[\"Tudo do Protocolo Imperial\", \"Mentoria Mensal em Grupo\", \"Análise de Papiro Nutricional\", \"Acesso a Eventos Presenciais\", \"Certificado de Mestre da Longevidade\"]', '2026-03-11 22:27:02', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `products`
--

CREATE TABLE `products` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `offer_price` decimal(10,2) DEFAULT NULL,
  `cover_image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) DEFAULT '1',
  `drip_enabled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pix_key` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pix_key_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `offer_price`, `cover_image`, `active`, `drip_enabled`, `created_at`, `payment_link`, `pix_key`, `pix_key_type`) VALUES
('fac9d7ec-fd02-46a3-9099-d0176d133616', 'Membro VIP - Mensal', 'teste', 'Teste descrição', 29.90, 99.90, '/img/capa.png', 1, 1, '2026-03-13 19:09:54', 'https://pay.infinitepay.io/Ri0x-IU1vzEVMn-29,90', 'Teste@123.com.br', 'email'),
('2c220545-8681-4002-b4ad-b70203f99c9f', 'Fjvc', '', 'Fhhh', 80.00, 880.00, '/img/capa.png', 0, 0, '2026-03-14 14:47:20', 'Google.com', '', 'random');

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_chapters`
--

CREATE TABLE `product_chapters` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `product_modules`
--

CREATE TABLE `product_modules` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reseller_requests`
--

CREATE TABLE `reseller_requests` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
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
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `drip_days` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `description`, `cover_image`, `sort_order`, `drip_days`, `active`) VALUES
('saga-detox', 'cat-fundacao', 'SAGA DETOX - A Purificação dos Templos Sagrados', 'A trilogia fundadora. Limpe fígado, intestino e rins para despertar o poder de queima de gordura do seu organismo.', NULL, 1, 0, 1),
('saga-energia', 'cat-vitalidade', 'SAGA ENERGIA - O Poder Vital dos Sacerdotes', 'Depois de limpar, restaure energia, disposição e vitalidade para dar continuidade na transformação corporal sem cansaço.', NULL, 1, 0, 1),
('saga-metabolismo', 'cat-queima', 'SAGA METABOLISMO - O Fogo Digestivo dos Guerreiros Núbios', 'Acelere seu metabolismo em até 40% e transforme seu corpo em uma máquina de queimar gordura 24 horas por dia.', NULL, 1, 0, 1),
('saga-definicao', 'cat-queima', 'SAGA DEFINIÇÃO - A Dieta do Abdômen Faraônico', 'Destrua a pochete, seque a barriga e esculpa um abdômen definido usando apenas alimentação estratégica ancestral.', NULL, 2, 0, 1),
('saga-localizada', 'cat-queima', 'SAGA GORDURA LOCALIZADA - Queima Estratégica Faraônica', 'Ataque gordura teimosa em regiões específicas: coxas, braços, costas e culotes. Queima direcionada e eficaz.', NULL, 3, 0, 1),
('saga-forca', 'cat-musculo', 'SAGA FORÇA - Músculos de Guerreiro sem Academia', 'Ganhe força real e músculos densos com os alimentos que os construtores das pirâmides consumiam.', NULL, 1, 0, 1),
('saga-hipertrofia', 'cat-musculo', 'SAGA HIPERTROFIA - Massa Magra dos Faraós', 'Protocolo completo para ganhar massa muscular magra naturalmente, sem whey, sem creatina, apenas comida ancestral.', NULL, 2, 0, 1),
('saga-hormonal', 'cat-equilibrio', 'SAGA HORMONAL - O Equilíbrio dos Deuses', 'Regule hormônios naturalmente. Testosterona, cortisol, insulina e hormônios femininos que controlam acúmulo de gordura.', NULL, 1, 0, 1),
('saga-intestinal', 'cat-equilibrio', 'SAGA INTESTINAL - O Protocolo da Barriga Desinchada', 'Intestino inflamado = barriga inchada e gordura que não sai. Regenere flora, elimine inchaço e destrave emagrecimento.', NULL, 2, 0, 1),
('saga-bonus', 'cat-bonus', 'BÔNUS EXTRAS - Sabedoria Complementar', 'Materiais complementares: beleza de dentro pra fora, longevidade, clareza mental e outros conhecimentos ancestrais.', NULL, 1, 0, 1),
('0.9296745695681038', 'a9d57858-c46e-4db3-9ebf-b28faa4c9b67', 'Tião ', 'Fica saudável ', NULL, 1, 0, 1),
('0.8508115545083379', '0.36651827174565266', 'Teste3', 'Teste2', NULL, 1, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tickets`
--

CREATE TABLE `tickets` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `category` varchar(50) DEFAULT 'outro',
  `priority` varchar(20) DEFAULT 'media',
  `status` varchar(20) DEFAULT 'open',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` varchar(36) NOT NULL,
  `ticket_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `message` text NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timelines`
--

CREATE TABLE `timelines` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bot_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `page_route` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trigger_type` enum('onLoad','onScroll','onExitIntent','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'manual'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `timeline_blocks`
--

CREATE TABLE `timeline_blocks` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timeline_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bot_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('objection','proof','result','question','urgency') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'result',
  `script` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `delay_ms` int DEFAULT '1000',
  `typing_time_ms` int DEFAULT '2000',
  `random_variations` json DEFAULT NULL,
  `condition_type` enum('scroll','time','exit','click','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'time',
  `condition_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('VISITANTE','MEMBRO','VIP','REVENDA','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VISITANTE',
  `status` enum('active','blocked','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `referral_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referred_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wallet_balance` decimal(12,2) DEFAULT '0.00',
  `pix_key` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pix_key_type` enum('cpf','email','phone','random') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `referral_code`, `referred_by`, `wallet_balance`, `pix_key`, `pix_key_type`, `created_at`) VALUES
('admin-default-001', 'Admin Faraó', 'admin@admin.com', '123456', 'ADMIN', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-11 22:27:02'),
('904c0d9f-6961-4975-bf73-a115f6b43605', 'Membro - Sistema', 'Membro@admin.com', '123456', 'MEMBRO', 'active', 'REFU6HF33', NULL, 0.00, NULL, NULL, '2026-03-12 00:04:23'),
('489d27ce-f0f4-4408-bb6f-077cb9555549', 'Visitante - Sistema', 'visitante@admin.com', '123456', 'VISITANTE', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 10:38:52'),
('d7a13929-427d-4be2-a8c8-f864e34bbfff', 'Membro VIP - Sistema', 'membrovip@admin.com', '123456', 'VIP', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 13:02:48'),
('280f726b-f8e4-41ff-875b-1a3275fe1fc4', 'Revenda - Sistema', 'revenda@admin.com', '123456', 'REVENDA', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-16 13:04:12'),
('d5102e09-4041-4dce-b0b7-9594946b39eb', ' conta membro de teste', 'Membroteste@admin.com', '123456', 'MEMBRO', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-27 02:49:34'),
('95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', 'Gustavo Oliveira Valentim ', 'gustavo.valentim.500@gmail.com', 'Tipocolombia890@', 'ADMIN', 'active', NULL, NULL, 0.00, NULL, NULL, '2026-03-27 02:50:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('masculino','feminino','outro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` tinyint UNSIGNED DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` smallint UNSIGNED DEFAULT NULL,
  `activity_level` enum('sedentario','leve','moderado','intenso') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goal` enum('perda','ganho','saude','energia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `restrictions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `phone`, `gender`, `age`, `weight`, `height`, `activity_level`, `goal`, `restrictions`, `created_at`, `updated_at`) VALUES
('6345d430-1739-11f1-88ec-b6a721b01145', '2115baaa-0aca-4a9a-bc2c-3843213d4801', '11919211370', 'masculino', 36, 110.00, 186, 'leve', 'perda', 'Tijolos', '2026-03-03 19:44:27', '2026-03-03 19:44:27'),
('cbfd933d-2178-11f1-88ec-b6a721b01145', 'f2cf4956-60e1-4f5d-bb49-a1395fe28cff', '9999999999', 'outro', 35, 120.00, 185, 'intenso', 'energia', 'Ovo', '2026-03-16 20:43:32', '2026-03-16 21:08:35'),
('435d59b1-26f9-11f1-ac67-a2aa5c947423', '6b272a43-d14f-4fa7-8279-02c105b2ed20', '333333333333', 'masculino', 36, 130.00, 186, 'sedentario', 'perda', 'Nada', '2026-03-23 20:45:44', '2026-03-23 20:45:44'),
('94395818-271f-11f1-9b6b-bbcfdce0cc5e', '08b5cd05-9d50-45a5-9827-e4d32847c3dd', NULL, 'masculino', 35, 120.00, 186, 'sedentario', 'perda', 'Nada', '2026-03-24 01:20:00', '2026-03-24 01:20:00'),
('671dd714-2721-11f1-9b6b-bbcfdce0cc5e', '47de8866-a1d5-4185-8aaa-35251be5ad5a', NULL, 'masculino', 36, 120.00, 186, NULL, NULL, NULL, '2026-03-24 01:33:04', '2026-03-24 01:33:04'),
('968cf9a4-2987-11f1-ad7c-0a314055eec3', 'd5102e09-4041-4dce-b0b7-9594946b39eb', NULL, 'feminino', 25, 800.00, 199, 'sedentario', 'perda', 'Arroz', '2026-03-27 02:49:34', '2026-03-27 02:49:34'),
('aa5b8198-2987-11f1-ad7c-0a314055eec3', '95f0e7e6-ec8d-4cf5-a557-1de51d0ef134', '31995341547', 'masculino', 32, 86.00, 176, NULL, 'ganho', NULL, '2026-03-27 02:50:08', '2026-03-27 02:50:08'),
('c46fc205-2b27-11f1-9028-0a65a6f9c6a5', '2c9fd63b-c14a-48f0-bfaa-0380daf26be8', '32985648965', NULL, 38, 60.00, 178, 'sedentario', 'perda', 'Taioba, cobe pipoca ', '2026-03-29 04:28:42', '2026-03-29 04:28:42');

-- --------------------------------------------------------

--
-- Estrutura para tabela `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pix_key` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('requested','approved','paid','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'requested',
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
-- Índices de tabela `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tickets_user` (`user_id`),
  ADD KEY `idx_tickets_status` (`status`);

--
-- Índices de tabela `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ticket_messages_ticket` (`ticket_id`);

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
