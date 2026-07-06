import { useEffect, useState } from 'react';
import type { MatrixCategory } from '../_components/table/role-matrix-types';

/**
 * Custom hook to manage the collapsed and expanded state of category and module groupings in the Role Matrix table.
 * 
 * @param groupedPermissions The structured tree of category and module permissions to dynamically initialize collapse state for.
 */
export function useRoleMatrixCollapsing(groupedPermissions: MatrixCategory[]) {
    const [collapsedCategoryKeys, setCollapsedCategoryKeys] = useState<Record<string, boolean>>({});
    const [collapsedModuleKeys, setCollapsedModuleKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsedCategoryKeys((current) => {
            let hasChanged = false;
            const next = { ...current };

            groupedPermissions.forEach((category) => {
                const key = category.categoryKey ?? '__other__';
                if (!(key in next)) {
                    next[key] = true;
                    hasChanged = true;
                }
            });

            return hasChanged ? next : current;
        });

        setCollapsedModuleKeys((current) => {
            let hasChanged = false;
            const next = { ...current };

            groupedPermissions.forEach((category) => {
                const categoryKey = category.categoryKey ?? '__other__';
                category.modules.forEach((module) => {
                    const moduleKey = `${categoryKey}:${module.moduleKey}`;
                    if (!(moduleKey in next)) {
                        next[moduleKey] = true;
                        hasChanged = true;
                    }
                });
            });

            return hasChanged ? next : current;
        });
    }, [groupedPermissions]);

    const toggleCategory = (categoryKey: string) => {
        setCollapsedCategoryKeys((current) => ({
            ...current,
            [categoryKey]: !current[categoryKey],
        }));
    };

    const toggleModule = (moduleKey: string) => {
        setCollapsedModuleKeys((current) => ({
            ...current,
            [moduleKey]: !current[moduleKey],
        }));
    };

    return {
        collapsedCategoryKeys,
        collapsedModuleKeys,
        toggleCategory,
        toggleModule,
    };
}
