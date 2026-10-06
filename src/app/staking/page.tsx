import { permanentRedirect } from "next/navigation";

export default function StakingRedirect() {
  permanentRedirect("/vaults");
}
