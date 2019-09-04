# CLI Plugin: Helper

The CLI-Plugin: Helper integrates the helper extension for [Gluegun](https://infinitered.github.io/gluegun) CLIs.

It contains

- `commandSelector`: A menu maker for your commands
- `getConfig`: Extends the handling of the configuration, also for ~/.<CLI_BRAND>
- `getDir`: Extension of path.join that can handle homedir (~) and automatic OS-specific separator conversion
- `getInput`: Checks inputs (e.g. from parameters) and asks if they are not set
- `msToMinutesAndSeconds`: Converts milliseconds to minutes:seconds string
- `readFile`: Read a file and get the (JSON) data
- `trim`: Extension of the string.trim that also replaces line breaks
- `updateCli`: Helps you to keep your CLI up to date
- ...

## Integration

It can be easily integrated into your CLI:

```bash
$ npm install @lenne.tech/cli-plugin-helper
```

`src/cli.ts`:

```typescript
// ...
const cli = build()
  // ...
  .plugin('./node_modules/@lenne.tech/cli-plugin-helper/dist', {
    commandFilePattern: '*.js',
    extensionFilePattern: '*.js'
  })
  // ...
  .create();
// ...
```

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

`src/commands/git/git.ts`:

```typescript
import { ExtendedGluegunToolbox } from '../../interfaces/extended-gluegun-toolbox';

/**
 * Git commands
 */
module.exports = {
  name: 'git',
  alias: ['g'],
  description: 'Git commands',
  hidden: true,
  run: async (toolbox: ExtendedGluegunToolbox) => {
    const {
      helper: { commandSelector }
    } = toolbox;
    await commandSelector(toolbox, { parentCommand: 'git' });
    return 'git';
  }
};
```

## Thanks

Many thanks to the developers of [Glugun](https://infinitered.github.io/gluegun)
and all the developers whose packages are used here.

## License

MIT - see LICENSE
