FROM php:8.2-apache

# Install dependencies and extensions for PostgreSQL, Zip, and Intl
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    libicu-dev \
    && docker-php-ext-install pdo pdo_pgsql zip intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Replace default Apache config with our custom one
COPY vhost.conf /etc/apache2/sites-available/000-default.conf

# Copy Symfony application files into container
COPY . /var/www/html

# Set permissions for Symfony cache and logs
RUN mkdir -p var/cache var/log && chown -R www-data:www-data var public

# Create a fallback .env if not tracked in Git to prevent Dotenv crashes
RUN touch .env

# Install composer dependencies (optimized for production)
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader

# Expose port (Render uses dynamic PORT env var, but defaults to 80/10000; Apache listens on 80)
EXPOSE 80

# Make start script executable and fix Windows CRLF line endings
RUN chmod +x start.sh && sed -i 's/\r$//' start.sh

# Run migrations and start Apache
CMD ["./start.sh"]
