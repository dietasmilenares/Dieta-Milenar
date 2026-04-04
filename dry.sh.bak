rm -rf /home/ubuntu/Dieta-Milenar
git clone https://github.com/dietasmilenares/Dieta-Milenar /home/ubuntu/Dieta-Milenar
echo -e "\n\033[1;33m  Qual ação deseja executar?\033[0m\n  [1] install.sh\n  [2] install2.sh\n  [3] Update S.O\n"
read -rp "  Escolha [1/2/3]: " _INS
case $_INS in
  1) sudo -i bash /home/ubuntu/Dieta-Milenar/install.sh ;;
  2) sudo -i bash /home/ubuntu/Dieta-Milenar/install2.sh ;;
  3)
    GOLD='\033[38;5;220m'; BOLD='\033[1m'; NC='\033[0m'
    GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; DIM='\033[2m'

    spin() {
      local pid=$1 msg=$2
      local frames='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      while kill -0 $pid 2>/dev/null; do
        for ((i=0; i<${#frames}; i++)); do
          printf "\r  ${CYAN}${frames:$i:1}${NC} $msg"
          sleep 0.1
        done
      done
      printf "\r  ${GREEN}[✔]${NC} $msg\n"
    }

    echo -e "\n${GOLD}${BOLD}  ── 🔄 ATUALIZANDO S.O ─────────────────────────────────────────${NC}\n"

    apt-get update -qq >/dev/null 2>&1 & spin $! "Atualizando repositórios..."
    apt-get upgrade -y -qq >/dev/null 2>&1 & spin $! "Instalando atualizações..."
    apt-get autoremove -y --purge -qq >/dev/null 2>&1 & spin $! "Removendo pacotes desnecessários..."

    echo -e "\n${GOLD}${BOLD}  ── 📋 DIAGNÓSTICO PÓS-UPDATE ──────────────────────────────────${NC}\n"
    if [ -f /var/run/reboot-required ]; then
      echo -e "  ${YELLOW}[⚠]${NC} ${BOLD}Reboot necessário para aplicar:${NC}\n"
      if [ -f /var/run/reboot-required.pkgs ]; then
        while IFS= read -r pkg; do
          echo -e "  ${YELLOW}•${NC} $pkg"
        done < /var/run/reboot-required.pkgs
      fi
      echo -e "\n  ${DIM}Reinicie com: reboot${NC}\n"
    else
      echo -e "  ${GREEN}[✔]${NC} Nenhum reboot necessário. Tudo em vigor.\n"
    fi
    ;;
  *) echo -e "\033[0;31m[✘]\033[0m Inválido." ;;
esac
