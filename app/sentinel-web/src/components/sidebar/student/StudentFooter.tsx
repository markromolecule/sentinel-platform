export default function StudentFooter() {
    return (
        <footer className="border-border/40 bg-background mt-auto border-t py-8">
            <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
                <div className="flex items-center gap-2">
                    <span className="text-foreground font-bold">Sentinel</span>
                    <span className="text-muted-foreground text-sm">© 2026</span>
                </div>

                <div className="flex items-center gap-6">
                    <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        Terms and Conditions
                    </a>
                </div>
            </div>
        </footer>
    );
}
