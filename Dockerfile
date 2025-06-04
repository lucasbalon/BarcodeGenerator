# Utiliser une image Nginx légère
FROM nginx:alpine

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre propre configuration Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers du site web dans le répertoire par défaut de Nginx
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY icons8-barcode-outline-hand-drawn-16.png /usr/share/nginx/html/
COPY icons8-barcode-outline-hand-drawn-32.png /usr/share/nginx/html/

# Exposer le port 80
EXPOSE 80

# Commande pour démarrer Nginx quand le conteneur se lance
CMD ["nginx", "-g", "daemon off;"]