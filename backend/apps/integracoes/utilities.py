from decouple import config
import requests


class Monday:

    @staticmethod
    def create_task(task_name: str) -> int:

        url: str = r'https://api.monday.com/v2'

        query: str = """mutation {
                create_item (board_id: "7942876723",
                group_id: "topics",
                item_name: """ + f'"{task_name}"'+ """) {id}}"""

        headers: dict = {"Authorization": config('MONDAY_TOKEN'),
                         'Content-Type': 'application/json'}

        payload: dict = {"query": query}

        response = requests.post(url, headers=headers, json=payload)

        return response.status_code


if __name__ == '__main__':
    ...
