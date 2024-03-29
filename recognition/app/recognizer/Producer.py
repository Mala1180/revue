import json
from datetime import datetime

from kafka3 import KafkaProducer

from app.utils.env import KAFKA_HOST, KAFKA_PORT


class Producer:

    def __init__(self):
        self._producer = KafkaProducer(bootstrap_servers=f"{KAFKA_HOST}:{KAFKA_PORT}")

    def produce(self, topic: str, recognized_object: str):
        self._producer.send(
            topic,
            json.dumps(
                {
                    "objectClass": recognized_object,
                    "timestamp": datetime.now().isoformat(),
                }
            ).encode("utf-8"),
        )
