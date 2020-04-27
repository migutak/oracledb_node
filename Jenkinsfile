try {
   timeout(time: 20, unit: 'MINUTES') {
      node('nodejs') {
          stage('build') {
            openshiftBuild(buildConfig: 'oraclenode', showBuildLogs: 'true')
          }
          stage('deploy') {
            openshiftDeploy(deploymentConfig: 'oraclenode')
          }
        }
   }
} catch (err) {
   echo "in catch block"
   echo "Caught: ${err}"
   currentBuild.result = 'FAILURE'
   throw err
}          
