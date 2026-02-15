import { Header, Footer } from "@/components/common";

export default function SiteLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <>
               <Header />
               {children}
               <Footer />
          </>
     );
}
