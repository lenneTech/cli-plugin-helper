import { Menu } from '@lenne.tech/gluegun-menu';
import * as fs from 'fs';
import * as os from 'os';
import { join, sep } from 'path';

import { IHelperExtendedGluegunToolbox } from '../interfaces/extended-gluegun-toolbox.interface';

/**
 * Common helper functions
 */
export class Helper {
  /**
   * Constructor for integration of toolbox
   */
  constructor(protected toolbox: IHelperExtendedGluegunToolbox) {}

  /**
   * Get configuration
   */
  public async getConfig() {
    // Toolbox feature
    const {
      config,
      filesystem,
      runtime: { brand },
    } = this.toolbox;

    // Configuration in home directory (~/.brand)
    let homeDirConfig = {};
    try {
      const homeDirConfigFile = join(filesystem.homedir(), `.${brand}`);
      if (await filesystem.existsAsync(homeDirConfigFile)) {
        homeDirConfig = JSON.parse(await filesystem.readAsync(homeDirConfigFile));
      }
    } catch (e) {
      // Nothing
    }

    // Configuration in current directory (./.brand)
    let currentDirConfig = {};
    try {
      const currentDirConfigFile = join(filesystem.cwd(), `.${brand}`);
      if (await filesystem.existsAsync(currentDirConfigFile)) {
        currentDirConfig = JSON.parse(await filesystem.readAsync(currentDirConfigFile));
      }
    } catch (e) {
      // Nothing
    }

    return {
      ...config[brand],
      ...config.loadConfig(join('~', `.${brand}`), brand),
      ...homeDirConfig,
      ...config.loadConfig(join(filesystem.cwd(), `.${brand}`), brand),
      ...currentDirConfig,
    };
  }

  /**
   * Get prepared directory path
   */
  public getDir(...dirPath: string[]) {
    if (!dirPath.join('')) {
      return null;
    }
    return join(...dirPath) // normalized path
      .replace('~', os.homedir()) // replace ~ with homedir
      .replace(/\/|\\/gm, sep); // set OS specific separators
  }

  /**
   * Get input if not set
   */
  public async getInput(
    input: string,
    options?: {
      errorMessage?: string;
      initial?: string;
      name?: string;
      showError?: boolean;
    },
  ) {
    // Process options
    const opts = Object.assign(
      {
        initial: '',
        name: 'name',
        showError: false,
      },
      options,
    );
    if (!opts.errorMessage) {
      opts.errorMessage = `You must provide a valid ${opts.name}!`;
    }

    // Toolbox features
    const {
      print: { error },
      prompt: { ask },
    } = this.toolbox;

    // Get input
    if (!input || !this.trim(input)) {
      const answers = await ask({
        initial: opts.initial,
        message: `Enter ${opts.name}`,
        name: 'input',
        type: 'input',
      });
      input = answers.input;
      if (!input && opts.showError) {
        error(opts.errorMessage);
      }
    }

    // Return input
    return input;
  }

  /**
   * String with minutes and seconds
   */
  public msToMinutesAndSeconds(ms: number) {
    const minutes = Math.floor((ms / 1000 / 60) << 0);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  /**
   * Read a file
   */
  public readFile(path: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (path.endsWith('.json')) {
            resolve(JSON.parse(data.toString()));
          } else {
            resolve(data);
          }
        }
      });
    });
  }

  /**
   * Trim and remove linebreaks from input
   */
  public trim(input: any) {
    // Check input
    if (input !== 0 && !input) {
      return input;
    }

    // Trim input
    return input
      .toString()
      .trim()
      .replace(/(\r\n|\n|\r)/gm, '');
  }

  /**
   * Run update for cli
   */
  public async updateCli(options?: { global?: boolean; packageName?: string; showInfos?: boolean }) {
    // Toolbox
    const {
      helper,
      meta,
      print: { info, spin, success },
      runtime: { brand, defaultPlugin },
      system: { run, startTimer },
    } = this.toolbox;

    // Start timer
    const timer = startTimer();

    // Get package.json
    const packageJson: any = await helper.readFile(
      join(meta.src ? meta.src : defaultPlugin.directory, '..', 'package.json'),
    );

    // Process options
    const opts = Object.assign(
      {
        global: true,
        packageName: packageJson ? packageJson.name : '',
        showInfos: false,
      },
      options,
    );

    // Run without infos
    if (!opts.showInfos) {
      return run(`npm install${opts.global ? ' -g ' : ' '}${opts.packageName}`);
    }

    // Update
    const updateSpin = spin(`Update ${opts.packageName}`);
    await run(`npm install${opts.global ? ' -g ' : ' '}${opts.packageName}`);
    updateSpin.succeed();

    // Check new version
    const versionSpin = spin(`Get current version from ${opts.packageName}`);
    const version = helper.trim(await run(`${brand} version`));
    versionSpin.succeed();

    // Success
    success(`🎉 Updated to ${version} from ${opts.packageName} in ${helper.msToMinutesAndSeconds(timer())}m.`);
    info('');
  }

  /**
   * Show menu
   */
  public async showMenu(
    parentCommands?: string,
    options?: {
      checkUpdate?: boolean;
      headline?: string;
      level?: number;
    },
  ) {
    // Toolbox feature
    const {
      config,
      filesystem: { existsAsync },
      meta,
      runtime: { brand, defaultPlugin },
    } = this.toolbox;

    // Process options
    const { checkUpdate } = Object.assign(
      {
        checkUpdate: true,
      },
      options,
    );

    // Check for updates
    try {
      if (
        checkUpdate // parameter
        && brand && config[brand]?.checkForUpdate // current configuration
        && (await this.getConfig()).checkForUpdate // extra configuration
        && !(await existsAsync(join(meta.src ? meta.src : defaultPlugin.directory, '..', 'src'))) // not development environment
      ) {
        config[brand].checkForUpdate = false;

        // tslint:disable-next-line:no-floating-promises
        meta
        .checkForUpdate()
        .then((update) => {
          if (update) {
            // tslint:disable-next-line:no-floating-promises
            this.updateCli().catch(() => {
              // do nothing
            });
          }
        })
        .catch(() => {
          // do nothing
        });
      }
    } catch (e) {
      // do nothing
    }

    // ShowMenu
    await new Menu(this.toolbox).showMenu(parentCommands, options);
  }
}

/**
 * Extend toolbox
 */
export default (toolbox: IHelperExtendedGluegunToolbox) => {
  toolbox.helper = new Helper(toolbox);
};
