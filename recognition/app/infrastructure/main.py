from typing import List

import requests
from flask import Flask

from app.application import RecognitionService
from app.application.impl import RecognitionServiceImpl
from app.domain.core.rules import IntrusionRule
from app.domain.core.utils import is_intrusion_rule_active
from app.infrastructure.events.RecognitionEventsHubImpl import RecognitionEventsHubImpl
from app.presentation import deserialize
from app.presentation.presentation import transform_keys, camel_to_snake
from app.utils.Logger import logger
from app.utils.env import RECOGNITION_BEARER_TOKEN, ALARM_PORT, ALARM_HOST
from app.utils.interval import set_interval

intrusion_rules: List[IntrusionRule] = []
recognition_service: RecognitionService = RecognitionServiceImpl(
    RecognitionEventsHubImpl()
)


def create_app():
    app = Flask(__name__)
    intrusion_rules.extend(get_intrusion_rules())
    logger.info("Intrusion Rules: " + str(intrusion_rules))
    enable_intrusion_rules()

    set_interval(check_rule_update, seconds=60)
    set_interval(check_rule_validity, seconds=60)
    return app


def get_intrusion_rules() -> List[IntrusionRule]:
    url: str = f"http://{ALARM_HOST}:{ALARM_PORT}/rules/intrusions"
    logger.info("URL: " + url)
    headers = {"Authorization": f"Bearer {RECOGNITION_BEARER_TOKEN}"}
    res = requests.get(url, headers=headers)
    rules: List[IntrusionRule] = []
    for intrusion_rule_dict in res.json():
        snake_rule_dict = transform_keys(intrusion_rule_dict, camel_to_snake)
        snake_rule_dict["validity"]["from_"] = snake_rule_dict["validity"]["from"]
        intrusion_rule = deserialize(snake_rule_dict, IntrusionRule)
        rules.append(intrusion_rule)

    return rules


def enable_intrusion_rules() -> None:
    for intrusion_rule in intrusion_rules:
        if is_intrusion_rule_active(intrusion_rule):
            recognition_service.start_recognizing(intrusion_rule.active_on)


def check_rule_update() -> None:
    new_intrusion_rules = get_intrusion_rules()
    intrusion_rules.clear()
    intrusion_rules.append(*new_intrusion_rules)
    recognition_service.stop_all_recognizing()
    enable_intrusion_rules()


def check_rule_validity() -> None:
    for intrusion_rule in intrusion_rules:
        if not is_intrusion_rule_active(intrusion_rule):
            recognition_service.stop_recognizing(intrusion_rule.active_on)
