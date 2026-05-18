export const safeGetFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const safeSetToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

export const getStudentById = (studentId) => {
  const students = safeGetFromStorage('students', []);
  return students.find(s => s.id === studentId);
};

export const getStudentByRollNo = (rollNo) => {
  const students = safeGetFromStorage('students', []);
  return students.find(s => s.rollNo === rollNo || s.uniRollNo === rollNo);
};
