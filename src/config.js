export const API_BASE ="http://localhost/hostel_room_api";

export const COLORS = ['#0f172a','#334155','#64748b','#94a3b8','#cbd5e1'];

export const STATUS = {
 SUCCESS:'Success',
 ERROR:'error'
};

/**
 * Helper to check if API response is successful regardless of casing
 */
export const isSuccess = (res) => {
 return res?.data?.status?.toLowerCase() ==='success';
};

