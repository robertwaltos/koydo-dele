import { redirect } from "next/navigation";

// Redirect English /pricing to Spanish /precios
export default function PricingRedirect() {
  redirect("/precios");
}
