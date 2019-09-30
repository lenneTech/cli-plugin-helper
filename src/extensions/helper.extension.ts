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
      runtime: { brand }
    } = this.toolbox;

    // Configuration in home directory (~/.brand)
    let homeDirConfig = {};
    try {
      const homeDirConfigFile = join(filesystem.homedir(), '.' + brand);
      if (await filesystem.existsAsync(homeDirConfigFile)) {
        homeDirConfig = JSON.parse(await filesystem.readAsync(homeDirConfigFile));
      }
    } catch (e) {
      // Nothing
    }

    // Configuration in current directory (./.brand)
    let currentDirConfig = {};
    try {
      const currentDirConfigFile = join(filesystem.cwd(), '.' + brand);
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
      ...currentDirConfig
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
      initial?: string;
      name?: string;
      errorMessage?: string;
      showError?: boolean;
    }
  ) {
    // Process options
    const opts = Object.assign(
      {
        initial: '',
        name: 'name',
        showError: false
      },
      options
    );
    if (!opts.errorMessage) {
      opts.errorMessage = `You must provide a valid ${opts.name}!`;
    }

    // Toolbox features
    const {
      print: { error },
      prompt: { ask }
    } = this.toolbox;

    // Get input
    if (!input || !this.trim(input)) {
      const answers = await ask({
        initial: opts.initial,
        type: 'input',
        name: 'input',
        message: `Enter ${opts.name}`
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
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
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
      system: { run, startTimer }
    } = this.toolbox;

    // Start timer
    const timer = startTimer();

    // Get package.json
    const packageJson: any = await helper.readFile(
      join(meta.src ? meta.src : defaultPlugin.directory, '..', 'package.json')
    );

    // Process options
    const opts = Object.assign(
      {
        global: true,
        packageName: packageJson ? packageJson.name : '',
        showInfos: false
      },
      options
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
   * Command selector
   *
   * Hint: this doesn't exists in this context!
   * If you want to use external functions, use toolbox instead (e.g. toolbox.helper.trim)
   */
  public async commandSelector(
    toolbox: IHelperExtendedGluegunToolbox,
    options?: {
      checkUpdate?: boolean;
      level?: number;
      parentCommand?: string;
      welcome?: string;
    }
  ) {
    // Toolbox feature
    const {
      config,
      filesystem: { existsAsync },
      helper,
      meta,
      print,
      prompt,
      runtime: { brand, commands, defaultPlugin }
    } = toolbox;

    // Prepare parent command
    const pC = options.parentCommand ? options.parentCommand.trim() : '';

    // Process options
    const { checkUpdate, level, parentCommand, welcome } = Object.assign(
      {
        checkUpdate: true,
        level: pC ? pC.split(' ').length : 0,
        parentCommand: '',
        welcome: pC ? pC.charAt(0).toUpperCase() + pC.slice(1) + ' commands' : ''
      },
      options
    );

    // Check for updates
    if (
      checkUpdate && // parameter
      config[brand].checkForUpdate && // current configuration
      (await helper.getConfig()).checkForUpdate && // extra configuration
      !(await existsAsync(join(meta.src ? meta.src : defaultPlugin.directory, '..', 'src'))) // not development environment
    ) {
      config[brand].checkForUpdate = false;

      // tslint:disable-next-line:no-floating-promises
      toolbox.meta
        .checkForUpdate()
        .then((update) => {
          if (update) {
            // tslint:disable-next-line:no-floating-promises
            helper.updateCli().catch(() => {
              // do nothing
            });
          }
        })
        .catch(() => {
          // do nothing
        });
    }

    // Welcome
    if (welcome) {
      print.info(print.colors.cyan(welcome));
    }

    // Get main commands
    let mainCommands = commands
      .filter(
        (c) =>
          c.commandPath.length === level + 1 &&
          c.commandPath.join(' ').startsWith(parentCommand) &&
          ![brand, 'help'].includes(c.commandPath[0])
      )
      .map((c) => c.commandPath[level] + (c.description ? ` (${c.description})` : ''))
      .sort();

    // Additions commands
    mainCommands = ['[ help ]'].concat(mainCommands);
    if (level) {
      mainCommands.push('[ back ]');
    }
    mainCommands.push('[ cancel ]');

    // Select command
    const { commandName } = await prompt.ask({
      type: 'select',
      name: 'commandName',
      message: 'Select command',
      choices: mainCommands.slice(0)
    });

    // Check command
    if (!commandName) {
      print.error('No command selected!');
      return;
    }

    switch (commandName) {
      case '[ back ]': {
        await helper.commandSelector(toolbox, {
          parentCommand: parentCommand.substr(0, parentCommand.lastIndexOf(' '))
        });
        return;
      }
      case '[ cancel ]': {
        print.info('Take care 👋');
        return;
      }
      case '[ help ]': {
        (print.printCommands as any)(toolbox, level ? parentCommand.split(' ') : undefined);
        break;
      }
      default: {
        // Get command
        const command = commands.filter(
          (c) => c.commandPath.join(' ') === `${parentCommand} ${commandName}`.trim().replace(/\s\(.*\)$/, '')
        )[0];

        // Run command
        try {
          await command.run(toolbox);
          process.exit();
        } catch (e) {
          // Abort via CTRL-C
          if (!e) {
            console.log('Goodbye ✌️');
          } else {
            // Throw error
            throw e;
          }
        }
      }
    }
  }
}

/**
 * Extend toolbox
 */
export default (toolbox: IHelperExtendedGluegunToolbox) => {
  toolbox.helper = new Helper(toolbox);
};
