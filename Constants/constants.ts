
export const DEFAULT_REQUIRED_PCT = {
  Theory: 75,
  Practical: 80,
  Tutorial: 75,
  'Seminar/Viva': 75
};

export const MBBS_YEARS = [
  '1st Prof',
  '2nd Prof',
  '3rd Prof (Part 1)',
  '3rd Prof (Part 2) / Final Prof'
];

export const PROF_SUBJECTS: Record<string, string[]> = {
  '1st Prof': ['Anatomy', 'Physiology', 'Biochemistry'],
  '2nd Prof': ['Pharmacology', 'Pathology', 'Microbiology', 'Forensic Medicine'],
  '3rd Prof (Part 1)': ['Ophthalmology', 'ENT', 'Community Medicine'],
  '3rd Prof (Part 2) / Final Prof': ['Medicine', 'Surgery', 'Obstetrics & Gynecology', 'Pediatrics']
};

export const SUBJECT_MAPPINGS: Record<string, string> = {
  'Gross Anatomy': 'Anatomy',
  'Histology': 'Anatomy',
  'Dissection': 'Anatomy',
  'PSM': 'Community Medicine',
  'Forensic': 'Forensic Medicine & Toxicology',
  'Path': 'Pathology',
  'Micro': 'Microbiology',
  'Med': 'Medicine',
  'Surg': 'Surgery',
  'OBG': 'Obstetrics & Gynecology'
};
