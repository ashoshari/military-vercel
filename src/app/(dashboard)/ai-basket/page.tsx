"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";

import Header from "./components/header/Header";
import AiBasketStats from "./components/ai-basket-stats/AiBasketStats";
import ProductsLinkNetwork from "./components/products-link-network/ProductsLinkNetwork";
import SupportAndLiftingByBasket from "./components/support-and-lifting-by-basket/SupportAndLiftingByBasket";
import BasketAnalysisNetowrk from "./components/basket-analysis-network/BasketAnalysisNetowrk";
import RulesOfAssociation from "./components/rules-of-association/RulesOfAssociation";

export default function AIBasketPage() {
  return (
    <div className="space-y-6">
      <Header />
      <AiBasketStats />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ProductsLinkNetwork />
        <SupportAndLiftingByBasket />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BasketAnalysisNetowrk />
        <RulesOfAssociation />
      </div>
    </div>
  );
}
