# CLI Plugin: Helper

The CLI-Plugin: Helper integrates the helper extension for [Gluegun](https://infinitered.github.io/gluegun) CLIs.

It contains

- `showMenu`: A menu maker for your commands
- `getConfig`: Extends the handling of the configuration, also for ~/.<CLI_BRAND>
- `getDir`: Extension of path.join that can handle homedir (~) and automatic OS-specific separator conversion
- `getInput`: Checks inputs (e.g. from parameters) and asks if they are not set
- `msToMinutesAndSeconds`: Converts milliseconds to minutes:seconds string
- `readFile`: Read a file and get the (JSON) data
- `trim`: Extension of the string.trim that also replaces line breaks
- `updateCli`: Helps you to keep your CLI up to date
- ...

Menu in action:

![Gluegun Menu Demo](assets/demo.gif)

## Integration

It can be easily integrated into your CLI:

### 1. Install extension:

```bash
$ npm install @lenne.tech/cli-plugin-helper
```

### 2. Integrate extension as plugin:

`src/cli.ts`:

```typescript
// ...
const cli = build()
  // ...
  .plugin(__dirname + '/../node_modules/@lenne.tech/cli-plugin-helper/dist', {
    commandFilePattern: '*.js',
    extensionFilePattern: '*.js'
  })
  // ...
  .create();
// ...
```

### 3. Extend interface:

`src/interfaces/extended-gluegun-toolbox.ts`:

```typescript
import { Helper } from '@lenne.tech/cli-plugin-helper';
// ...

/**
 * Extended GluegunToolbox
 */
export interface ExtendedGluegunToolbox extends GluegunToolbox {
  helper: Helper;
  // ...
}
```

### 4. Prepare main commands:

`src/commands/YOUR_COMMAND/YOUR_COMMAND.ts`:

```typescript
import { IHelperExtendedGluegunToolbox } from '@lenne.tech/cli-plugin-helper';

/**
 * YOUR_COMMAND menu
 */
module.exports = {
  name: 'YOUR_COMMAND',
  alias: ['YOUR_COMMAND_ALIAS'],
  description: 'YOUR_DESCRIPTION',
  hidden: true,
  run: async (toolbox: IHelperExtendedGluegunToolbox) => {
    await toolbox.helper.showMenu('(PARANT_COMMANDS) YOUR_COMMAND');
  }
};
```

## Parameters of `showMenu`

1. parentCommands?: string  
   command name OR parent names + command name

2. options?: object

   - level: number => Level of the current section (0 = main section)
   - headline: string => Headline for the current section

Note: If the options in the main menu are to be used, for example to define the headline,
`null` or an empty string `''` must be passed as the first parameter:  
`showMenu(null, {headline: 'Main menu'})`

## Example

Example file structure:

```
src/commands/
    section1/
        subsection1/
            subsection1.ts
            yyy1.ts
            yyy2.ts
        section1.ts
        xxx1.ts
        xxx2.ts
    section2/
        section2.ts
        zzz1.ts
        zzz2.ts
    brand.ts
```

`src/commands/brand.ts`:

```typescript
import { IHelperExtendedGluegunToolbox } from '@lenne.tech/cli-plugin-helper';

/**
 * Main menu
 */
module.exports = {
  name: 'brand',
  description: 'Welcome to brand CLI',
  hidden: true,
  run: async (toolbox: IHelperExtendedGluegunToolbox) => {
    await toolbox.helper.showMenu();
  }
};
```

`src/commands/section1/section1.ts`:

```typescript
import { IHelperExtendedGluegunToolbox } from '@lenne.tech/cli-plugin-helper';

/**
 * Section1 menu
 */
module.exports = {
  name: 'section1',
  alias: ['s1'],
  description: 'Description for section1',
  hidden: true,
  run: async (toolbox: IHelperExtendedGluegunToolbox) => {
    await toolbox.helper.showMenu('section1');
  }
};
```

`src/commands/section1/subsection1/subsection1.ts`:

```typescript
import { IHelperExtendedGluegunToolbox } from '@lenne.tech/cli-plugin-helper';

/**
 * Subsection1 menu
 */
module.exports = {
  name: 'subsection1',
  alias: ['sub1'],
  description: 'Description for subsection1',
  hidden: true,
  run: async (toolbox: IHelperExtendedGluegunToolbox) => {
    await toolbox.helper.showMenu('section1 subsection1', { headline: 'Subsection1 commands' });
  }
};
```

## Thanks

Many thanks to the developers of [Glugun](https://infinitered.github.io/gluegun)
and all the developers whose packages are used here.

## License

MIT - see LICENSE
