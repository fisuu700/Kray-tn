#!/bin/bash

# Clear cache without warmup to avoid missing env var issues at startup
php bin/console cache:clear --env=prod --no-warmup || true

# Execute Doctrine migrations (allow failures gracefully)
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true

# Suppress the Apache ServerName warning
echo "ServerName kerya-api.onrender.com" >> /etc/apache2/apache2.conf

# Start Apache in the foreground
apache2-foreground
