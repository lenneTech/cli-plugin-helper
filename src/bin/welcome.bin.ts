import NpmPackageHelper from '@lenne.tech/npm-package-helper';

/**
 * Welcome after installation
 */
const run = async () => {
  try {
    // Set current working directory: get parameter or use cwd of process
    const cwd = process.argv[2] || process.cwd();

    // Get data from local package.json
    const { data, path } = await NpmPackageHelper.getFile('package.json', {
      cwd: __dirname
    });
    if (path && data) {
      console.log('Welcome :-)');
      console.log(`You installed version ${data.verion} of typescript-start in ${cwd}`);
    }
  } catch (e) {
    if (e && e.code !== 'EEXIST') {
      return e;
    }
  }

  // Everything is ok
  return;
};
run().then(error => {
  if (error) {
    console.log(error);
  }
});
