rc# RCS Chatbot — Build & Deploy Instructions
**Rosebud Cloud Solutions | Azure Web App + Claude API**

---

## What You're Building

A branded chatbot webpage for Rosebud Cloud Solutions, deployed as an Azure Web App. It uses the Claude API (claude-sonnet-4-6) as the AI backend, displays the RCS logo, matches the purple/white brand, and acts as a cloud & AI assistant for site visitors.

**Stack:** Python (Flask) backend · HTML/CSS/JS frontend · Azure Web App · Azure Key Vault · GitHub Actions CI/CD

---

## Prerequisites

- Azure account (active, with a subscription)
- Anthropic API key (get one at console.anthropic.com)
- GitHub account
- Python 3.11+ installed locally
- Azure CLI installed (`az --version` to verify)
- Git installed

---

## Step 1 — Project Structure

Create this folder structure locally:

```
rcs-chatbot/
├── app.py                  # Flask backend
├── requirements.txt
├── .env.example
├── .gitignore
├── static/
│   ├── logo.png            # RCS logo (the PNG you have)
│   └── style.css
├── templates/
│   └── index.html          # Chat UI
├── infra/
│   └── main.bicep          # Azure infrastructure
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## Step 2 — Backend (Flask)

**`app.py`**

```python
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

    # Validate message structure
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
```

**`requirements.txt`**

```
flask==3.0.3
anthropic==0.30.0
gunicorn==22.0.0
```

**`.env.example`** (commit this, never the real `.env`)

```
ANTHROPIC_API_KEY=your-key-here
```

**`.gitignore`**

```
.env
__pycache__/
*.pyc
.venv/
```

---

## Step 3 — Frontend

**`templates/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RCS Assistant | Rosebud Cloud Solutions</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
  <div class="chat-wrapper">
    <header>
      <img src="/static/logo.png" alt="Rosebud Cloud Solutions" class="logo">
      <div class="header-text">
        <h1>RCS Assistant</h1>
        <span class="status">● Online</span>
      </div>
    </header>

    <div class="messages" id="messages">
      <div class="message assistant">
        <p>Hi! I'm the Rosebud Cloud Solutions assistant. I can help you understand 
        our cloud, AI, and automation services. What can I help you with today?</p>
      </div>
    </div>

    <div class="input-area">
      <input type="text" id="userInput" placeholder="Ask about our services..." 
             autocomplete="off" />
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script>
    let conversationHistory = [];

    async function sendMessage() {
      const input = document.getElementById("userInput");
      const text = input.value.trim();
      if (!text) return;

      appendMessage("user", text);
      conversationHistory.push({ role: "user", content: text });
      input.value = "";

      appendMessage("assistant", "...", "typing");

      try {
        const response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: conversationHistory })
        });

        const data = await response.json();
        removeTyping();

        if (data.reply) {
          appendMessage("assistant", data.reply);
          conversationHistory.push({ role: "assistant", content: data.reply });
        } else {
          appendMessage("assistant", "Sorry, something went wrong. Please try again.");
        }
      } catch (err) {
        removeTyping();
        appendMessage("assistant", "Connection error. Please try again.");
      }
    }

    function appendMessage(role, text, id = "") {
      const messages = document.getElementById("messages");
      const div = document.createElement("div");
      div.className = `message ${role}`;
      if (id) div.id = id;
      div.innerHTML = `<p>${text}</p>`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const typing = document.getElementById("typing");
      if (typing) typing.remove();
    }

    document.getElementById("userInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  </script>
</body>
</html>
```

**`static/style.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0d0d0d;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.chat-wrapper {
  width: 100%;
  max-width: 780px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}

header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  background: #1a1a1a;
  border-bottom: 1px solid #8B2FC9;
}

.logo { height: 48px; width: auto; }

.header-text h1 {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
}

.status {
  color: #7ed957;
  font-size: 0.75rem;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message { max-width: 78%; }

.message.user {
  align-self: flex-end;
  background: #8B2FC9;
  color: #fff;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
}

.message.assistant {
  align-self: flex-start;
  background: #1e1e1e;
  color: #e0e0e0;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  border: 1px solid #2a2a2a;
}

.message p { line-height: 1.6; font-size: 0.95rem; }

.input-area {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
}

.input-area input {
  flex: 1;
  background: #111;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-area input:focus { border-color: #8B2FC9; }

.input-area button {
  background: #8B2FC9;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.input-area button:hover { background: #7020b0; }

.messages::-webkit-scrollbar { width: 6px; }
.messages::-webkit-scrollbar-track { background: transparent; }
.messages::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
```

---

## Step 4 — Place the Logo

Copy your `RCS_Logo_Transparent_Square_1.png` into the `static/` folder and rename it `logo.png`.

```bash
cp /path/to/RCS_Logo_Transparent_Square_1.png static/logo.png
```

---

## Step 5 — Azure Infrastructure (Bicep)

**`infra/main.bicep`**

```bicep
param location string = resourceGroup().location
param appName string = 'rcs-chatbot'
param kvName string = 'kv-rcs-chatbot'

// App Service Plan (free tier for testing, switch to B1 for production)
resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${appName}-plan'
  location: location
  sku: { name: 'B1', tier: 'Basic' }
  properties: { reserved: true }  // Required for Linux
  kind: 'linux'
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  identity: { type: 'SystemAssigned' }  // Managed Identity for Key Vault
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appCommandLine: 'gunicorn --bind=0.0.0.0:8000 app:app'
      appSettings: [
        {
          name: 'ANTHROPIC_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kvName};SecretName=anthropic-api-key)'
        }
      ]
    }
    httpsOnly: true
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: webApp.identity.principalId
        permissions: { secrets: ['get'] }
      }
    ]
  }
}

output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
```

---

## Step 6 — Deploy Azure Infrastructure

```bash
# Login
az login

# Create resource group
az group create --name rg-rcs-chatbot --location uksouth

# Deploy Bicep
az deployment group create \
  --resource-group rg-rcs-chatbot \
  --template-file infra/main.bicep

# Add your API key to Key Vault (one time, never again)
az keyvault secret set \
  --vault-name kv-rcs-chatbot \
  --name anthropic-api-key \
  --value "YOUR_ANTHROPIC_API_KEY_HERE"
```

---

## Step 7 — GitHub Actions CI/CD

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy RCS Chatbot

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: rcs-chatbot
          package: .
```

**Add GitHub secret** — run this once to generate the credentials JSON:

```bash
az ad sp create-for-rbac \
  --name "rcs-chatbot-deploy" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUB_ID/resourceGroups/rg-rcs-chatbot \
  --json-auth
```

Copy the output JSON → GitHub repo → Settings → Secrets → New secret → name it `AZURE_CREDENTIALS`.

---

## Step 8 — Test Locally Before Pushing

```bash
# Create local .env (never commit this)
echo "ANTHROPIC_API_KEY=your-key-here" > .env

# Install deps
pip install -r requirements.txt

# Run
python app.py

# Open http://localhost:8000
```

---

## Step 9 — Push and Deploy

```bash
git init
git add .
git commit -m "Initial RCS chatbot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rcs-chatbot.git
git push -u origin main
```

GitHub Actions will trigger automatically. Your chatbot will be live at:
`https://rcs-chatbot.azurewebsites.net`

---

## Checklist

- [ ] Logo copied to `static/logo.png`
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] API key stored in Azure Key Vault only
- [ ] Bicep deployed successfully
- [ ] `AZURE_CREDENTIALS` secret added to GitHub
- [ ] Local test passes before first push
- [ ] HTTPS enforced (`httpsOnly: true` in Bicep)

---

## Costs (approximate, UK South)

| Resource | Tier | Monthly cost |
|---|---|---|
| App Service Plan | B1 Basic | ~£11/month |
| Key Vault | Standard | ~£0.03/10k operations |
| Claude API | Per token | Pay as you go |

Switch App Service to **F1 Free** for initial testing (limited CPU, no custom domain).

---

## What to Do Next

Once this is working, natural next steps are adding a custom domain (`rosebudcloudsolutions.co.uk/chat`), streaming responses for a better UX, and optionally adding RAG against your services documentation to make answers even more accurate.
