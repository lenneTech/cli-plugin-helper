import { Helper } from '../extensions/helper.extension';
import { GluegunToolbox } from 'gluegun';

/**
 * Extended GluegunToolbox
 */
export interface IHelperExtendedGluegunToolbox extends GluegunToolbox {
  helper?: Helper;
}
