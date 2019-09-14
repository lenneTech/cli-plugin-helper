import { GluegunToolbox } from 'gluegun';
import { Helper } from '../extensions/helper.extension';
import { Npm } from '../extensions/npm.extension';

/**
 * Extended GluegunToolbox
 */
export interface IHelperExtendedGluegunToolbox extends GluegunToolbox {
  helper?: Helper;
  npm?: Npm;
}
