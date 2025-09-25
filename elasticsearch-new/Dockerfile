FROM docker.elastic.co/elasticsearch/elasticsearch:8.5.0

# Set environment variables for single-node cluster  
ENV discovery.type=single-node
ENV xpack.security.enabled=true
ENV network.host=0.0.0.0
ENV http.port=9200
ENV ELASTIC_PASSWORD=FfRp1Q966K8CDpb

# Configure memory settings for Fly.io
ENV ES_JAVA_OPTS="-Xms512m -Xmx512m"

# Create keystore and set bootstrap password
RUN /usr/share/elasticsearch/bin/elasticsearch-keystore create && \
    echo "FfRp1Q966K8CDpb" | /usr/share/elasticsearch/bin/elasticsearch-keystore add -x "bootstrap.password"

EXPOSE 9200 9300