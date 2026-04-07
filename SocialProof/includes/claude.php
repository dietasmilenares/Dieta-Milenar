<?php
// ============================================================
// claude.php — Integração com API do Claude (Anthropic)
// Versão final unificada
// ============================================================

require_once __DIR__ . '/config.php';

class ClaudeAPI {

    private string $apiKey;
    private string $model;

    public function __construct() {
        $this->apiKey = getSetting('claude_api_key');
        $this->model  = getSetting('claude_model') ?: CLAUDE_MODEL;
    }

    // ----------------------------------------------------------
    // Chamada principal à API
    // ----------------------------------------------------------
    public function complete(string $systemPrompt, string $userPrompt, int $maxTokens = 4096): ?string {
        if (empty($this->apiKey)) {
            throw new RuntimeException('Claude API Key não configurada. Acesse Configurações e insira sua chave sk-ant-...');
        }

        $payload = [
            'model'      => $this->model,
            'max_tokens' => $maxTokens,
            'system'     => $systemPrompt,
            'messages'   => [
                ['role' => 'user', 'content' => $userPrompt],
            ],
        ];

        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-api-key: '          . $this->apiKey,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            throw new RuntimeException('Erro de rede ao chamar Claude API: ' . $curlErr);
        }

        if ($httpCode !== 200) {
            $err = json_decode($response, true);
            throw new RuntimeException('Erro Claude API (' . $httpCode . '): ' . ($err['error']['message'] ?? $response));
        }

        $data = json_decode($response, true);
        return $data['content'][0]['text'] ?? null;
    }

    // ----------------------------------------------------------
    // Gera timeline completa para um bloco
    // ----------------------------------------------------------
    public function generateTimeline(array $block, array $bots, int $messageCount = 20): array {

        $botsDesc = [];
        foreach ($bots as $b) {
            $botsDesc[] = "- BOT_ID:{$b['id']} | Nome: {$b['name']} | Arquétipo: {$b['archetype_name']} | Estilo: {$b['speaking_style']}";
        }
        $botsStr = implode("\n", $botsDesc);

        $systemPrompt = <<<SYS
Você é um especialista em criar conversas hiper-realistas de chat para social proof em páginas de vendas.
Seu objetivo é criar conversas que pareçam 100% orgânicas, humanas e espontâneas.
NUNCA revele que são bots. NUNCA use linguagem corporativa ou de marketing óbvio.
SYS;

        $userPrompt = <<<USR
Crie uma timeline de {$messageCount} mensagens de chat sobre o seguinte tema:
TEMA: {$block['topic']}
SALA: {$block['name']}

BOTS DISPONÍVEIS PARA ESSA CONVERSA:
{$botsStr}

REGRAS OBRIGATÓRIAS:
1. Cada mensagem deve usar exatamente o estilo de fala do arquétipo do bot
2. A conversa deve fluir naturalmente, com respostas coerentes ao contexto anterior
3. Inclua variação de tipos: afirmações, perguntas, respostas, dicas, reações emotivas
4. Algumas perguntas podem ficar SEM RESPOSTA (vacuum_question) — isso é realista
5. Os bots podem discordar levemente entre si
6. Resultados pessoais devem ser específicos e realistas (não exagerados demais)
7. Inclua erros de digitação ocasionais conforme o arquétipo
8. Varie o delay entre mensagens (2 a 60 segundos) para parecer humano
9. A conversa deve girar exclusivamente em torno do tema: {$block['topic']}

TIPOS DE MENSAGEM DISPONÍVEIS:
- statement: afirmação/comentário geral
- question: pergunta direcionada ao grupo
- answer: resposta a uma mensagem anterior
- tip: dica ou conselho
- reaction: reação emocional curta (uau, que isso!, etc)
- vacuum_question: pergunta que ninguém vai responder

FORMATO DE RESPOSTA — retorne APENAS um JSON válido, sem markdown, sem explicações:
{
  "messages": [
    {
      "sequence": 1,
      "bot_id": 123,
      "type": "statement",
      "content": "texto da mensagem aqui",
      "reply_to_sequence": null,
      "delay_seconds": 5
    },
    {
      "sequence": 2,
      "bot_id": 456,
      "type": "answer",
      "content": "resposta aqui",
      "reply_to_sequence": 1,
      "delay_seconds": 12
    }
  ]
}
USR;

        $raw = $this->complete($systemPrompt, $userPrompt, 6000);

        // Remove possíveis blocos markdown que a IA às vezes adiciona
        $raw = preg_replace('/^```json\s*/m', '', $raw);
        $raw = preg_replace('/^```\s*/m', '', $raw);
        $raw = trim($raw);

        $data = json_decode($raw, true);
        if (!$data || !isset($data['messages']) || !is_array($data['messages'])) {
            throw new RuntimeException(
                'Resposta inválida da IA. Tente novamente. Início da resposta: ' . substr($raw, 0, 300)
            );
        }

        return $data['messages'];
    }

    // ----------------------------------------------------------
    // Gera variação de uma mensagem mantendo o estilo do arquétipo
    // ----------------------------------------------------------
    public function generateVariation(string $originalMessage, array $archetype): string {
        $prompt = "Reescreva esta mensagem mantendo o mesmo sentido mas com palavras diferentes,
        no estilo: {$archetype['speaking_style']}.
        Mensagem original: {$originalMessage}
        Responda APENAS com o texto reescrito, sem explicações.";

        return trim($this->complete(
            'Você reescreve mensagens mantendo o estilo de um arquétipo humano.',
            $prompt,
            500
        ));
    }
}
