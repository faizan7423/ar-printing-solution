import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuoteModal } from "@/components/forms/QuoteModal";
import { ContactActions } from "@/components/ui/ContactActions";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <QuoteModal><a className="skip" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/><ContactActions/></QuoteModal>;
}