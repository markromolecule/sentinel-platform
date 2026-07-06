import { beforeEach } from 'vitest';
import { resetAccessControlCatalogsCache } from './src/modules/security/access-control/services/access-control-catalog.service';

beforeEach(() => {
    resetAccessControlCatalogsCache();
});
