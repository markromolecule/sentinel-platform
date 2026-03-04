export declare const COURSE_QUERY_KEYS: {
    readonly all: readonly ["courses"];
    readonly detail: (id: string) => readonly ["courses", string];
    readonly lists: () => readonly ["courses", "list"];
    readonly list: (filters: Record<string, string>) => readonly ["courses", "list", {
        readonly filters: Record<string, string>;
    }];
};
//# sourceMappingURL=index.d.ts.map