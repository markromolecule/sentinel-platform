import { AdminUser } from "@sentinel/shared";

export interface AdministratorPageTypes extends AdminUser {
    meta?: Record<string, unknown>;
}
