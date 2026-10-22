FROM php:8.2-apache

# Install mysqli and pdo_mysql
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable apache headers and rewrite
RUN a2enmod headers rewrite

# Copy backend files
COPY farmlink/ /var/www/html/farmlink/

# Set working directory
WORKDIR /var/www/html/farmlink

EXPOSE 80
