/**
 * Layout Loader
 * 
 * Loads and validates office layout from JSON configuration.
 */

import type { OfficeLayout } from './officeLayoutTypes';
import { isValidOfficeLayout } from './officeLayoutTypes';
import defaultLayoutData from './defaultLayout.json';

export function loadDefaultLayout(): OfficeLayout {
  const layout = defaultLayoutData as OfficeLayout;
  
  if (!isValidOfficeLayout(layout)) {
    throw new Error('Invalid default layout structure');
  }
  
  return layout;
}
