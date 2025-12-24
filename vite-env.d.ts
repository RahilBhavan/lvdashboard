/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_VAULT_ADDRESS?: string;
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
    readonly VITE_PROTOCOL_OWNER?: string;
    readonly VITE_CHAIN_ID?: string;
    readonly VITE_RPC_URL?: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*?raw' {
    const content: string;
    export default content;
}
