import datastore from './datastore.js';

export async function getEnvVar(varkey) {
  if (process.env.MYLOCALHOST) {
    return process.env[varkey];
  }

  const query = datastore.createQuery('EnvVar');
  query.filter('envkey', '=', varkey);

  const [results] = await datastore.runQuery(query);

  if (results.length === 0) {
    console.log(`No EnvVar found for envkey: ${varkey}`);
    return undefined;
  }

  return results[0].envval;
}
