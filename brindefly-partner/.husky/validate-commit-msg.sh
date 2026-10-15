#!/bin/sh

echo "🔍 Validando mensagem de commit..."
commit_msg_file=$1
commit_msg=$(head -n 1 "$commit_msg_file")

# Merge e revert automáticos passam direto
if echo "$commit_msg" | grep -Eq '^(Merge|Revert) '; then
  echo "✅ Commit automático - pulando validação"
  exit 0
fi

echo "📝 Mensagem: $commit_msg"

# Padrão da Brindefly: tipo(DEV-1234): mensagem
if ! echo "$commit_msg" | grep -Eq '^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)\(DEV-[0-9]+\): .+'; then
  echo "❌ Mensagem de commit inválida!"
  echo "O padrão deve ser: tipo(DEV-1234): mensagem"
  echo "Tipos: feat fix docs style refactor test chore perf ci build revert"
  exit 1
fi

echo "✅ Mensagem válida!"
