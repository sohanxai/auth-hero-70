import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchDonors from "./tools/search-donors";
import listBloodBanks from "./tools/list-blood-banks";
import listHospitals from "./tools/list-hospitals";
import listActiveRequests from "./tools/list-active-requests";
import getMyDonorProfile from "./tools/get-my-donor-profile";
import toggleAvailability from "./tools/toggle-availability";
import createBloodRequest from "./tools/create-blood-request";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bloodconnect-mcp",
  title: "BloodConnect MCP",
  version: "0.1.0",
  instructions:
    "Tools for BloodConnect — search blood donors, list partner blood banks and hospitals, view active emergency blood requests, and (as a signed-in user) manage your donor profile and create blood requests.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchDonors,
    listBloodBanks,
    listHospitals,
    listActiveRequests,
    getMyDonorProfile,
    toggleAvailability,
    createBloodRequest,
  ],
});
