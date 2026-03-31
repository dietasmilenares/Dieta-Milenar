PUSH + INSTALAR SITE DIETA MILENAR

alias up='rm -rf /home/ubuntu/Dieta-Milenar && git clone https://github.com/dietasmilenares/Dieta-Milenar /home/ubuntu/Dieta-Milenar && sudo -i bash /home/ubuntu/Dieta-Milenar/install.sh'


DESINSTALAÇÃO DIETA MILENAR
alias RR='pm2 stop dieta-milenar 2>/dev/null; pm2 delete dieta-milenar 2>/dev/null; pm2 save --force 2>/dev/null; rm -rf /var/www/dieta-milenar /var/www/phpmyadmin /etc/nginx/sites-enabled/dieta-milenar /etc/nginx/sites-available/dieta-milenar /var/log/dieta-milenar /home/ubuntu/install.sh /home/ubuntu/Dieta-Milenar; mysql -u root -e "DROP DATABASE IF EXISTS dieta_milenar; DROP USER IF EXISTS \"dieta_user\"@\"127.0.0.1\"; DROP USER IF EXISTS \"dieta_user\"@\"localhost\"; FLUSH PRIVILEGES;" 2>/dev/null; nginx -t && systemctl reload nginx; echo -e "\033[0;32m[✔]\033[0m Ambiente limpo. Execute: up"'