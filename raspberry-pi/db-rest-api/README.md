# Provide rest api for MQTT database

## API
Access data with HTTP GET `"/history/<table_id>"` where `<table_id>` is the value of the `db_table` property in [publishers.db](/raspberry-pi/mqtt-db/default.publishers.js).