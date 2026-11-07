/** Industry keys exactly as the API's `Industry` enum issues them. */
export const INDUSTRIES = {
  realEstate: 'real_estate',
  education: 'education',
  clinic: 'clinic',
  automotive: 'automotive',
  agency: 'agency',
} as const;

export type Industry = (typeof INDUSTRIES)[keyof typeof INDUSTRIES];
