#!/bin/bash

# Ensure cache is cleared/warmed up
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod

# Execute Doctrine migrations proactively
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Start Apache in the foreground
apache2-foreground
