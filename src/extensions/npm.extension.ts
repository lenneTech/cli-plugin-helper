import * as find from 'find-file-up';
import * as fs from 'fs';
import { dirname } from 'path';

import { IHelperExtendedGluegunToolbox } from '../interfaces/extended-gluegun-toolbox.interface';

/**
 * npm functions
 */
export class Npm {
  /**
   * Constructor for integration of toolbox
   */
  constructor(protected toolbox: IHelperExtendedGluegunToolbox) {}

  /**
   * Get package.json
   */
  public async getPackageJson(
    options: { cwd?: string; errorMessage?: string; showError?: boolean } = {},
  ): Promise<{ data: any; path: string }> {
    // Toolbox features
    const {
      filesystem,
      helper,
      print: { error },
    } = this.toolbox;

    // Prepare options
    const opts = Object.assign(
      {
        cwd: filesystem.cwd(),
        errorMessage: 'No package.json found!',
        showError: false,
      },
      options,
    );

    // Find package.json
    const path = await find('package.json', opts.cwd);
    if (!path) {
      if (opts.showError) {
        error(opts.errorMessage);
      }
      return { data: null, path: '' };
    }

    // Everything ok
    return { data: await helper.readFile(path), path };
  }

  /**
   * Set data for package.json
   */
  public async setPackageJson(
    data: string | { [key: string]: any },
    options: {
      cwd?: string;
      errorMessage?: string;
      showError?: boolean;
    } = {},
  ) {
    if (typeof data === 'object') {
      data = JSON.stringify(data, null, 2);
    }

    // Path to package.json
    const { path } = await this.getPackageJson(options);
    if (!path) {
      return;
    }

    // Write
    try {
      fs.unlinkSync(path);
      fs.writeFileSync(path, data);
    } catch (e) {
      return '';
    }

    // Done
    return path;
  }

  /**
   * Install npm packages
   */
  public async install(options: { cwd?: string; errorMessage?: string; showError?: boolean } = {}) {
    // Toolbox features
    const {
      filesystem,
      print: { spin },
      system,
    } = this.toolbox;

    // Prepare options
    const opts = Object.assign(
      {
        cwd: filesystem.cwd(),
        errorMessage: 'No package.json found!',
        showError: false,
      },
      options,
    );

    // Find package.json
    const { path } = await this.getPackageJson(opts);
    if (!path) {
      return false;
    }

    // Install npm packages
    const npmSpin = spin('Install npm packages');
    await system.run(`cd ${dirname(path)} && npm i`);
    npmSpin.succeed();
    return true;
  }

  /**
   * Update package.json
   */
  public async update(
    options: {
      cwd?: string;
      errorMessage?: string;
      install?: boolean;
      showError?: boolean;
    } = {},
  ) {
    // Toolbox features
    const {
      filesystem,
      print: { spin },
      system,
    } = this.toolbox;

    // Prepare options
    const opts = Object.assign(
      {
        cwd: filesystem.cwd(),
        errorMessage: 'No package.json found!',
        install: false,
        showError: false,
      },
      options,
    );

    // Find package.json
    const { path } = await this.getPackageJson(opts);
    if (!path) {
      return false;
    }

    // Check ncu
    if (!system.which('ncu')) {
      const installNcuSpin = spin('Install ncu');
      await system.run('npm i -g npm-check-updates');
      installNcuSpin.succeed();
    }

    // Update package.json
    const updateSpin = spin('Update package.json');
    await system.run(`ncu -u --packageFile ${path}`);
    updateSpin.succeed();

    // Install packages
    if (opts.install) {
      const installSpin = spin('Install npm packages');
      await system.run(`cd ${dirname(path)} && npm i`);
      installSpin.succeed();
    }

    // Success
    return true;
  }
}

/**
 * Extend toolbox
 */
export default (toolbox: IHelperExtendedGluegunToolbox) => {
  toolbox.npm = new Npm(toolbox);
};
