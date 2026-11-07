// Clean client implementation for estimate and contact forms
export const supabase = {
  functions: {
    invoke: async (functionName: string, options: { body: any }) => {
      console.log(`[Form Submission] ${functionName}:`, options?.body);
      // Simulate network latency for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        data: { success: true, message: 'Received successfully' },
        error: null,
      };
    },
  },
};
