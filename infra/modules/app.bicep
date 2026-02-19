param location string
param appName string

// App Service Plan (F1 Free — upgrade to B1 Basic once quota is approved)
resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${appName}-plan'
  location: location
  sku: { name: 'F1', tier: 'Free' }
  kind: 'linux'
  properties: { reserved: true } // Required for Linux
}

// Web App — ANTHROPIC_API_KEY is injected by GitHub Actions from a GitHub secret
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: plan.id
    publicNetworkAccess: 'Enabled'
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appCommandLine: 'gunicorn --bind=0.0.0.0:8000 app:app'
      ipSecurityRestrictions: []
      scmIpSecurityRestrictions: []
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
      ]
    }
    httpsOnly: true
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
