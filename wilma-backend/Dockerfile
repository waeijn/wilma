# PHP 8.3 + Apache
FROM php:8.3-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    default-mysql-client \
    nodejs \
    npm \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install pdo_mysql mysqli mbstring exif pcntl bcmath gd zip \
 && a2enmod rewrite \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Verify Composer installation
RUN /usr/local/bin/composer --version

# Configure Apache for Laravel
RUN echo '<VirtualHost *:80>' > /etc/apache2/sites-available/000-default.conf \
 && echo '    DocumentRoot /var/www/html/public' >> /etc/apache2/sites-available/000-default.conf \
 && echo '    <Directory /var/www/html/public>' >> /etc/apache2/sites-available/000-default.conf \
 && echo '        AllowOverride All' >> /etc/apache2/sites-available/000-default.conf \
 && echo '        Require all granted' >> /etc/apache2/sites-available/000-default.conf \
 && echo '    </Directory>' >> /etc/apache2/sites-available/000-default.conf \
 && echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/000-default.conf \
 && echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/000-default.conf \
 && echo '</VirtualHost>' >> /etc/apache2/sites-available/000-default.conf

# Permissions for Apache
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Expose Apache port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
