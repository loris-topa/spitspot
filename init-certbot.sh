docker-compose -f docker-compose-production.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --staging \
    --email paperino@example.org \
    -d gis.example.org \
    --rsa-key-size 4096\
    --agree-tos \
    --force-renewal" certbot
