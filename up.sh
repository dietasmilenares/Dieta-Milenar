# Etapa para deletar a pasta 'public' do repositório remoto no GitHub
echo "❌ Deletando a pasta 'public' do repositório no GitHub...";
cd /storage/emulated/0/Download/UPGITHUB/CommitVersion || exit;

# Adicionar a remoção da pasta 'public' ao Git
git rm -r --cached public;

# Fazer o commit e push para o repositório remoto
git commit -m "Removendo a pasta public do repositório remoto" >/dev/null 2>&1;
git push origin main --force;

echo "✅ Pasta 'public' deletada do repositório no GitHub!";