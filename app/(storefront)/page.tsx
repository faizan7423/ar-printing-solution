import { Hero, Strengths, ServicesPreview, AboutPreview, Applications, Process, Gallery } from "@/components/sections/HomeSections";
import { CTASection } from "@/components/ui/Editorial";
import { HomeShop, BulkPrinting } from "@/components/shop/HomeShop";

export default function Home() {
  return <><Hero/><Strengths/><HomeShop/><BulkPrinting/><ServicesPreview/><AboutPreview/><Applications/><Process/><Gallery/><CTASection/></>;
}