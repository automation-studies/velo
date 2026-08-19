import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hostnames that serve the Production deployment. Any other hostname (preview
// deployments, localhost during `vite preview`, etc.) is treated as preview.
const PRODUCTION_HOSTNAMES = ['velo-ivalice.vercel.app'];

// Deployed builds (Vercel) must work identically regardless of which
// environment built them, since `vercel promote` re-aliases a preview build
// to production without rebuilding — Vite bakes import.meta.env.VITE_* into
// the bundle at build time, so a single build can only ever carry one value
// per env var. Both configs are therefore hardcoded here (safe: these are
// public publishable keys, not secrets — access is enforced by RLS) and
// picked at runtime based on the hostname actually serving the bundle.
const DEPLOYED_CONFIGS = {
  production: {
    url: 'https://upeeugrbrpgpbaphdppq.supabase.co',
    publishableKey: 'sb_publishable_oaioLsyNPUEe96uD5N3ULQ_0grQzCl8',
  },
  preview: {
    url: 'https://rzudrrvezexduetabfvg.supabase.co',
    publishableKey: 'sb_publishable_d9lz0XjfC5rFkbkyPrbMwA_24ebr__I',
  },
};

// `yarn dev` keeps reading .env directly, so local development is unaffected
// and still controlled by VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY.
const { url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY } = import.meta.env.DEV
  ? { url: import.meta.env.VITE_SUPABASE_URL, publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }
  : PRODUCTION_HOSTNAMES.includes(window.location.hostname)
    ? DEPLOYED_CONFIGS.production
    : DEPLOYED_CONFIGS.preview;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});