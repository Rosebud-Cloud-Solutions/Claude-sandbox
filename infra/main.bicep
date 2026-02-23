targetScope = 'subscription'

param location string = 'uksouth'
param appName string = 'rosebudcloud-chat'
param rgName string = 'rg-rosebudcloud-chat'

@secure()
param apiKey string

// Create the resource group at subscription scope
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: rgName
  location: location
}

// Deploy App Service resources into the resource group via module
module app 'modules/app.bicep' = {
  name: 'rcs-app'
  scope: rg
  params: {
    location: location
    appName: appName
    apiKey: apiKey
  }
}

output webAppUrl string = app.outputs.webAppUrl
