import sqlite3, json, urllib.request
from pathlib import Path

def get_openrouter_key():
    conn = sqlite3.connect('/home/ubuntu/.9router/db/data.sqlite')
    cur = conn.cursor()
    cur.execute("SELECT data FROM providerConnections WHERE provider='openrouter'")
    data = json.loads(cur.fetchone()[0])
    return data['apiKey']

OPENROUTER_KEY = get_openrouter_key()

def call_claude(prompt, system="", model="anthropic/claude-sonnet-5.5", max_tokens=4000, temperature=0.7):
    url = "https://openrouter.ai/api/v1/chat/completions"
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json"
        }
    )

    with urllib.request.urlopen(req, timeout=180) as resp:
        res = json.loads(resp.read().decode())
        msg = res['choices'][0]['message']
        content = msg.get('content') or ""
        return content

if __name__ == "__main__":
    test_out = call_claude("Respond with: 'Claude Sonnet 5.5 is fully active and ready to build.'")
    print(test_out)
