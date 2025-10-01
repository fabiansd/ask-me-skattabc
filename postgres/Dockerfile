FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=ask_me_skattabc_dev
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=dev_password

# Copy initialization scripts if any
COPY init-scripts/ /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 5432

# Volume for data persistence
VOLUME ["/var/lib/postgresql/data"]