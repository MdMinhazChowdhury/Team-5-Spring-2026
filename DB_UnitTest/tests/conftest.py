
from typing import Any, Dict, Tuple, List
from src.db_api import DbClient


class DbClientStub(DbClient):
    def __init__(self):
        self.calls: List[Tuple[str, Dict[str, Any]]] = []
        self.fake_results: Dict[Tuple[str, Tuple[Tuple[str, Any], ...]], Any] = {}

    def set_fake_result(self, func_name: str, params: Dict[str, Any], result: Any):
        key = (func_name, tuple(sorted(params.items())))
        self.fake_results[key] = result

    def rpc(self, func_name: str, params: Dict[str, Any]) -> Any:
        key = (func_name, tuple(sorted(params.items())))
        self.calls.append((func_name, params))
        return self.fake_results.get(key)
