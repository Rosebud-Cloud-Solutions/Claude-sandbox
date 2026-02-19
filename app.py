import os
import anthropic
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM_PROMPT = """You are the Rosebud Cloud Solutions assistant — a helpful,
knowledgeable AI for a Microsoft-focused cloud consultancy based in the UK.

You help visitors understand RCS services including:
- Cloud & Infrastructure (Azure architecture, migrations, setup)
- AI & Automation Platforms
- Managed Cloud Support
- Security & Compliance
- DevSecOps & DevOps
- Training & Enablement

Be concise, professional, and helpful. If asked something outside RCS's scope,
acknowledge it and guide the visitor toward contacting the team at
hello@rosebudcloudsolutions.co.uk.

Never fabricate specific pricing, case study details, or client names.
If you don't know something specific, say so and offer to connect them with the team."""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    messages = data.get("messages", [])

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    for msg in messages:
        if msg.get("role") not in ("user", "assistant"):
            return jsonify({"error": "Invalid message role"}), 400

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages
    )

    return jsonify({"reply": response.content[0].text})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
