/**
 * Supabase Client (Optional integration stub / fallback client)
 */

export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null })
  },
  from: (table) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (data) => Promise.resolve({ data, error: null }),
    update: (data) => Promise.resolve({ data, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
};

export default supabase;
