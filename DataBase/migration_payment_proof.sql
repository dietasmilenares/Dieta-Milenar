-- Adiciona campos de comprovante de pagamento na tabela orders
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `proof_url` VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `rejection_reason` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `product_name` VARCHAR(200) DEFAULT NULL;

-- Cria pasta de comprovantes (handled by server on first upload)
