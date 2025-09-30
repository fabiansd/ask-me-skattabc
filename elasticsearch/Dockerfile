FROM docker.elastic.co/elasticsearch/elasticsearch:8.12.2

ENV discovery.type=single-node
ENV xpack.security.enabled=true
ENV network.host=0.0.0.0

EXPOSE 9200 9300

VOLUME ["/usr/share/elasticsearch/data"]
