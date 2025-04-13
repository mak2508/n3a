import requests

url = "https://api.behavioralsignals.com/v5/clients/10000071/processes/audio"

files = { "file": ("./data/sample.wav", open("./data/sample.wav", "rb"), "audio/wav") }
payload = {
    "name": "SAMPLE",
    "embeddings": "true"
}
headers = {
    "accept": "application/json",
    "X-Auth-Token": "955084ac59c2a7889a2af3fc2caa7f3e"
}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.text)