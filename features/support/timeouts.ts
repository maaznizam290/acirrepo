/**
 * features/support/timeouts.ts
 * -----------------------------------------------------------------------
 * Sets a generous default Cucumber step timeout. Individual Playwright
 * actions still respect their own (shorter) action/navigation timeouts
 * configured in config/env.ts — this just prevents Cucumber itself from
 * killing a step early during long BDD flows (e.g., impersonation +
 * multi-product cart steps).
 * -----------------------------------------------------------------------
 */

import { setDefaultTimeout } from '@cucumber/cucumber';
import { env } from '../../config/env';

setDefaultTimeout(env.timeouts.navigation * 2);
